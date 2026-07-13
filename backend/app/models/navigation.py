from pydantic import BaseModel, Field
from typing import List, Optional


class NavLocation(BaseModel):
    id: str = Field(..., description="Unique identifier for location")
    name: str = Field(..., description="Display name of the location")
    type: str = Field(..., description="Category type (gate, restroom, concession, first_aid, parking, accessibility)")
    section: str = Field(..., description="Seating section or concourse zone reference")
    description: str = Field(..., description="Detailed description of the location")
    amenities: List[str] = Field(default=[], description="Available services or tags")
    walking_time_mins: int = Field(..., description="Estimated walking time in minutes from Gate A (main entrance)")
