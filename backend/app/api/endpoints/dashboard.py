import logging
from fastapi import APIRouter, HTTPException, status
from app.models.dashboard import DashboardResponse
from app.services.dashboard import dashboard_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_metrics():
    """
    Get aggregated real-time operational dashboard metrics for crowd, concessions, emergency dispatches, and parking.
    """
    try:
        data = await dashboard_service.get_aggregated_dashboard()
        return data
    except Exception as e:
        logger.error(f"Error serving dashboard endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compile operations dashboard data."
        )
