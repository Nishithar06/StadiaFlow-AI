import logging
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.navigation import NavLocation

logger = logging.getLogger(__name__)
router = APIRouter()


def get_walking_time_for_section(section: str) -> int:
    """
    Simulates walking time in minutes from the main entrance (Gate A / Section 101).
    """
    try:
        sec_num = int(section)
        # Calculate a realistic walk time based on section spacing
        diff = abs(sec_num - 101)
        if diff > 15:
            # Concourse wraps around in circle
            diff = abs(30 - diff)
        return max(2, int(diff * 0.8))
    except ValueError:
        return 5


@router.get("/navigation", response_model=List[NavLocation])
def get_navigation_map():
    """
    Retrieves all stadium directory locations, including gates, concessions, restrooms, first aid,
    along with dynamic layers for parking decks and accessibility assistance zones.
    """
    try:
        from app.utils.data_cache import get_stadium_locations_cached
        raw_locations = get_stadium_locations_cached()
            
        locations = []
        
        # 1. Parse standard amenities from json
        for loc in raw_locations:
            sec = loc.get("section", "101")
            locations.append(NavLocation(
                id=loc.get("id"),
                name=loc.get("name"),
                type=loc.get("type"),
                section=sec,
                description=loc.get("description", ""),
                amenities=loc.get("amenities", []),
                walking_time_mins=get_walking_time_for_section(sec)
            ))

        # 2. Inject Parking Deck telemetry layer
        locations.append(NavLocation(
            id="parking-north",
            name="North Lot (General Parking)",
            type="parking",
            section="101",
            description="Main lot for general spectators. Access to Gate A.",
            amenities=["Electric Charging", "Accessible Parking spaces"],
            walking_time_mins=2
        ))
        locations.append(NavLocation(
            id="parking-east",
            name="East Lot (Transit Hub / Bus Deck)",
            type="parking",
            section="115",
            description="Adjacent to public shuttle terminals and coach slots.",
            amenities=["Shuttle pickup", "Restrooms"],
            walking_time_mins=10
        ))
        locations.append(NavLocation(
            id="parking-south",
            name="South Lot (VIP & Media Deck)",
            type="parking",
            section="128",
            description="Restricted credentials access. Adjacent to Gate C.",
            amenities=["VIP drop-off", "Valet services"],
            walking_time_mins=8
        ))

        # 3. Inject Accessibility Assistance points
        locations.append(NavLocation(
            id="access-ramps-102",
            name="Accessible Ramp Section 102",
            type="accessibility",
            section="102",
            description="Stroller and wheelchair accessible ramps to lower concourse.",
            amenities=["Tactile paving", "Stroller parking"],
            walking_time_mins=3
        ))
        locations.append(NavLocation(
            id="access-elevators-112",
            name="Concourse Elevators Level 1/2",
            type="accessibility",
            section="112",
            description="Dual elevators providing wheelchair access to upper hospitality tiers.",
            amenities=["Audio announcements", "Braille indicators"],
            walking_time_mins=7
        ))
        locations.append(NavLocation(
            id="access-seating-115",
            name="Wheelchair Viewing Deck Section 115",
            type="accessibility",
            section="115",
            description="Dedicated seating deck with power outlet options for wheelchairs.",
            amenities=["Companion seating", "Charging outlets"],
            walking_time_mins=9
        ))

        return locations

    except Exception as e:
        logger.error(f"Error compiling navigation directories: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compile interactive navigation directory."
        )
