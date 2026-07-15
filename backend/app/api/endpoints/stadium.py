import os
import json
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()

# Helper function to get data directory path
def get_data_file_path(filename: str) -> str:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(5):
        if os.path.exists(os.path.join(current_dir, "data")):
            break
        current_dir = os.path.dirname(current_dir)
    return os.path.join(current_dir, "data", filename)


# Pydantic Schemas for validation
class Location(BaseModel):
    id: str
    name: str
    type: str
    section: str
    description: str
    amenities: List[str]


class CheckpointStatus(BaseModel):
    id: str
    name: str
    status: str
    wait_time_minutes: int
    density_level: str
    flow_rate_per_min: int
    current_queue_size: int


class CrowdStatusResponse(BaseModel):
    checkpoints: List[CheckpointStatus]
    last_updated: str


class IncidentReport(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    description: str
    status: str
    reported_at: str


class IncidentCreate(BaseModel):
    type: str = Field(..., min_length=2, max_length=50, description="Type of incident (medical, security, etc.)")
    severity: str = Field(..., pattern="^(high|medium|low)$", description="Severity category (high, medium, low)")
    location: str = Field(..., min_length=2, max_length=100, description="Seating section or concourse zone")
    description: str = Field(..., min_length=5, max_length=1000, description="Full description of the incident")


@router.get("/stadium/locations", response_model=List[Location])
def get_stadium_locations():
    """
    Get all simulated locations, gates, restrooms, and concessions.
    """
    try:
        from app.utils.data_cache import get_stadium_locations_cached
        return get_stadium_locations_cached()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read stadium locations: {str(e)}"
        )


@router.get("/crowd/status", response_model=CrowdStatusResponse)
def get_crowd_status():
    """
    Get live crowd density metrics and queue wait times.
    """
    file_path = get_data_file_path("crowd_status.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read crowd status data: {str(e)}"
        )


@router.get("/emergency/reports", response_model=List[IncidentReport])
def get_emergency_reports():
    """
    Get live list of security and medical incident reports.
    """
    file_path = get_data_file_path("emergency_reports.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read emergency reports: {str(e)}"
        )


@router.post("/emergency/reports", response_model=IncidentReport, status_code=status.HTTP_201_CREATED)
def create_emergency_report(payload: IncidentCreate):
    """
    Submit a new emergency report to dispatch. Writes to the mock JSON database.
    """
    file_path = get_data_file_path("emergency_reports.json")
    try:
        # Load current reports
        reports = []
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                reports = json.load(f)
        
        from datetime import datetime, timezone
        import uuid
        
        new_report = IncidentReport(
            id=f"incident-{uuid.uuid4().hex[:6]}",
            type=payload.type,
            severity=payload.severity,
            location=payload.location,
            description=payload.description,
            status="pending",
            reported_at=datetime.now(timezone.utc).isoformat()
        )
        
        # Add to list and save
        reports.append(new_report.model_dump())
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(reports, f, indent=2)
            
        return new_report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit emergency report: {str(e)}"
        )
