import os
import json
import logging
from datetime import datetime, timezone
from typing import Any

from app.models.dashboard import (
    DashboardResponse, CrowdMetrics, GateMetric,
    FoodCourtQueue, ConcessionMetric, ParkingStatus, ParkingLot,
    EmergencySummary, EmergencyReportMetric
)
from app.services.gemini import gemini_service
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_data_file_path(filename: str) -> str:
    """
    Locates the mock telemetry JSONs by scanning parent directories.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(5):
        if os.path.exists(os.path.join(current_dir, "data")):
            break
        current_dir = os.path.dirname(current_dir)
    return os.path.join(current_dir, "data", filename)


class DashboardService:
    def load_json_file(self, filename: str) -> Any:
        file_path = get_data_file_path(filename)
        if not os.path.exists(file_path):
            logger.error(f"Mock telemetry file not found: {file_path}")
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {filename}: {e}")
            return None

    async def get_aggregated_dashboard(self) -> DashboardResponse:
        # 1. Load telemetry files
        crowd_data = self.load_json_file("crowd_status.json") or {"checkpoints": []}
        from app.utils.data_cache import get_stadium_locations_cached
        locations_data = get_stadium_locations_cached()
        emergency_data = self.load_json_file("emergency_reports.json") or []

        # Map locations to quickly find metadata if needed
        loc_map = {loc.get("id"): loc for loc in locations_data}

        # 2. Compile Crowd Metrics (Gates)
        checkpoints = crowd_data.get("checkpoints", [])
        gate_metrics = []
        concession_metrics = []

        total_gate_queue = 0
        congested_gates_count = 0
        gate_wait_times = []

        total_concession_queue = 0
        concession_wait_times = []

        for cp in checkpoints:
            cp_id = cp.get("id", "")
            # Check type from stadium locations or id prefix
            loc_meta = loc_map.get(cp_id, {})
            loc_type = loc_meta.get("type", "")

            if loc_type == "gate" or cp_id.startswith("gate"):
                metric = GateMetric(
                    id=cp_id,
                    name=cp.get("name"),
                    status=cp.get("status"),
                    wait_time_minutes=cp.get("wait_time_minutes", 0),
                    density_level=cp.get("density_level"),
                    flow_rate_per_min=cp.get("flow_rate_per_min", 0),
                    current_queue_size=cp.get("current_queue_size", 0)
                )
                gate_metrics.append(metric)
                total_gate_queue += metric.current_queue_size
                gate_wait_times.append(metric.wait_time_minutes)
                if metric.status == "congested":
                    congested_gates_count += 1
            
            elif loc_type == "concession" or cp_id.startswith("concession"):
                metric = ConcessionMetric(
                    id=cp_id,
                    name=cp.get("name"),
                    status=cp.get("status"),
                    wait_time_minutes=cp.get("wait_time_minutes", 0),
                    density_level=cp.get("density_level"),
                    flow_rate_per_min=cp.get("flow_rate_per_min", 0),
                    current_queue_size=cp.get("current_queue_size", 0)
                )
                concession_metrics.append(metric)
                total_concession_queue += metric.current_queue_size
                concession_wait_times.append(metric.wait_time_minutes)

        avg_gate_wait = sum(gate_wait_times) / max(len(gate_wait_times), 1)
        avg_concession_wait = sum(concession_wait_times) / max(len(concession_wait_times), 1)

        crowd_metrics = CrowdMetrics(
            total_estimated_queue=total_gate_queue,
            average_wait_time_minutes=round(avg_gate_wait, 1),
            checkpoints_congested_count=congested_gates_count,
            gates=gate_metrics
        )

        food_court_queue = FoodCourtQueue(
            concessions=concession_metrics,
            average_wait_time_minutes=round(avg_concession_wait, 1)
        )

        # 3. Compile Emergency Incidents
        active_incidents = []
        critical_incidents_count = 0

        for inc in emergency_data:
            # Active defined as pending or dispatched
            if inc.get("status") in ["pending", "dispatched"]:
                metric = EmergencyReportMetric(
                    id=inc.get("id"),
                    type=inc.get("type"),
                    severity=inc.get("severity"),
                    location=inc.get("location"),
                    description=inc.get("description"),
                    status=inc.get("status"),
                    reported_at=inc.get("reported_at")
                )
                active_incidents.append(metric)
                if metric.severity == "high":
                    critical_incidents_count += 1

        emergency_summary = EmergencySummary(
            total_active_incidents=len(active_incidents),
            critical_incidents_count=critical_incidents_count,
            recent_reports=active_incidents
        )

        # 4. Synthesize Parking Status
        lots = [
            ParkingLot(name="North Lot (General)", capacity=2500, occupied=2125, occupancy_rate=85.0, status="busy"),
            ParkingLot(name="East Lot (Transit/Buses)", capacity=3500, occupied=3220, occupancy_rate=92.0, status="congested"),
            ParkingLot(name="South Lot (VIP/Staff)", capacity=1000, occupied=450, occupancy_rate=45.0, status="normal")
        ]
        total_spaces = sum(l.capacity for l in lots)
        total_occupied = sum(l.occupied for l in lots)
        overall_occupancy = (total_occupied / total_spaces) * 100

        parking_status = ParkingStatus(
            lots=lots,
            total_spaces=total_spaces,
            total_occupied=total_occupied,
            overall_occupancy_rate=round(overall_occupancy, 1)
        )

        # 5. Generate Operations Insight (Gemini OR Simulation fallback)
        ai_insight = await self.generate_insight(crowd_metrics, food_court_queue, emergency_summary)

        return DashboardResponse(
            crowd_metrics=crowd_metrics,
            parking_status=parking_status,
            food_court_queue=food_court_queue,
            emergency_summary=emergency_summary,
            ai_insight=ai_insight,
            last_updated=datetime.now(timezone.utc).isoformat()
        )

    async def generate_insight(self, crowd: CrowdMetrics, concessions: FoodCourtQueue, emergency: EmergencySummary) -> str:
        # Check if Gemini key is set and valid
        has_gemini_key = (
            settings.GEMINI_API_KEY and 
            settings.GEMINI_API_KEY != "mock_key_for_now" and 
            settings.GEMINI_API_KEY != "your_gemini_api_key_here"
        )

        if has_gemini_key:
            try:
                # Compile telemetry details for Gemini prompt context
                telemetry_payload = {
                    "total_gate_queue": crowd.total_estimated_queue,
                    "avg_gate_wait": crowd.average_wait_time_minutes,
                    "congested_gates": crowd.checkpoints_congested_count,
                    "avg_food_court_wait": concessions.average_wait_time_minutes,
                    "total_active_emergencies": emergency.total_active_incidents,
                    "critical_emergencies": emergency.critical_incidents_count,
                    "gates": [{"name": g.name, "status": g.status, "wait": g.wait_time_minutes} for g in crowd.gates],
                    "emergencies": [{"id": e.id, "type": e.type, "loc": e.location, "desc": e.description} for e in emergency.recent_reports]
                }
                
                prompt = (
                    f"You are the StadiaFlow Command Operations advisor. Analyze this real-time stadium metrics JSON:\n"
                    f"{json.dumps(telemetry_payload, indent=2)}\n\n"
                    f"Write a concise, professional 3-sentence operational alert command for stadium dispatchers. "
                    f"Include specific actions to divert queues or resolve active emergency dispatches."
                )
                
                # Fetch system prompt from docs
                system_instruction = "You are the StadiaFlow Operations Command Center Advisor. Give short operational dispatches."
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))) # root
                prompts_path = os.path.join(base_dir, "docs", "prompts.md")
                if os.path.exists(prompts_path):
                    try:
                        with open(prompts_path, "r", encoding="utf-8") as f:
                            system_instruction = f.read()
                    except Exception:
                        pass
                
                # Since generate_response is async, we await it directly
                insight = await gemini_service.generate_response(
                    prompt=prompt,
                    system_instruction=system_instruction
                )
                return insight.strip()
            except Exception as e:
                logger.error(f"Error compiling Gemini operational insight: {e}")
                # Fall back to simulation if API execution fails

        # Intelligent Simulation fallback based on JSON state (clean plain text alerts)
        insights = []

        # Emergency check
        if emergency.total_active_incidents > 0:
            active_list = [f"{e.type} at {e.location}" for e in emergency.recent_reports[:2]]
            insights.append(
                f"🚨 Incident Triage Active: {emergency.total_active_incidents} unresolved alerts "
                f"({', '.join(active_list)}). Dispatching first responders. Ensure gate corridors remain clear for EMS."
            )

        # Gate congestion check
        congested_gates = [g.name for g in crowd.gates if g.status == "congested"]
        if congested_gates:
            insights.append(
                f"🚦 Gate Bottlenecks Detected: Congestion at {', '.join(congested_gates)}. "
                f"Recommend broadcasting push notifications to transit arrivals to divert flow to Gate C (South Entrance), "
                f"which is currently clear (4-minute wait time)."
            )
        else:
            insights.append(
                "🟢 Entry Gate Flow: All entrance checkpoints are loading within nominal limits (average wait time < 8 min)."
            )

        # Food wait times check
        high_wait_concessions = [c.name for c in concessions.concessions if c.wait_time_minutes > 10]
        if high_wait_concessions:
            insights.append(
                f"🍔 Concession Queue Peak: Elevated queue wait times detected at {', '.join(high_wait_concessions)}. "
                f"Recommend activating mobile pre-ordering campaigns to Sections 108 and 112 to clear concourse corridors."
            )

        # Default fallback
        if not insights:
            insights.append("Stadium flow operations are fully nominal. Standard telemetry monitoring active.")

        return " ".join(insights)


dashboard_service = DashboardService()
