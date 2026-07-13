from pydantic import BaseModel, Field
from typing import List, Dict, Any


class GateMetric(BaseModel):
    id: str
    name: str
    status: str
    wait_time_minutes: int
    density_level: str
    flow_rate_per_min: int
    current_queue_size: int


class CrowdMetrics(BaseModel):
    total_estimated_queue: int = Field(..., description="Sum of all entry gate queues")
    average_wait_time_minutes: float = Field(..., description="Average queue wait time across gates")
    checkpoints_congested_count: int = Field(..., description="Number of entry gates with congested status")
    gates: List[GateMetric]


class ConcessionMetric(BaseModel):
    id: str
    name: str
    status: str
    wait_time_minutes: int
    density_level: str
    flow_rate_per_min: int
    current_queue_size: int


class FoodCourtQueue(BaseModel):
    concessions: List[ConcessionMetric]
    average_wait_time_minutes: float = Field(..., description="Average wait time across dining spots")


class ParkingLot(BaseModel):
    name: str
    capacity: int
    occupied: int
    occupancy_rate: float
    status: str


class ParkingStatus(BaseModel):
    lots: List[ParkingLot]
    total_spaces: int
    total_occupied: int
    overall_occupancy_rate: float


class EmergencyReportMetric(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    description: str
    status: str
    reported_at: str


class EmergencySummary(BaseModel):
    total_active_incidents: int = Field(..., description="Total pending or dispatched dispatches")
    critical_incidents_count: int = Field(..., description="Active dispatches with High severity")
    recent_reports: List[EmergencyReportMetric]


class DashboardResponse(BaseModel):
    crowd_metrics: CrowdMetrics
    parking_status: ParkingStatus
    food_court_queue: FoodCourtQueue
    emergency_summary: EmergencySummary
    ai_insight: str
    last_updated: str
