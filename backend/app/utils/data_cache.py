import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Global in-memory cache for static stadium locations data
_stadium_locations_cache = None

def get_stadium_locations_cached() -> List[Dict[str, Any]]:
    """
    Loads and caches the static stadium_locations.json dataset in-memory.
    Returns the cached dataset on subsequent calls to eliminate redundant disk I/O.
    """
    global _stadium_locations_cache
    if _stadium_locations_cache is not None:
        return _stadium_locations_cache
        
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for _ in range(5):
        if os.path.exists(os.path.join(current_dir, "data")):
            break
        current_dir = os.path.dirname(current_dir)
        
    file_path = os.path.join(current_dir, "data", "stadium_locations.json")
    if not os.path.exists(file_path):
        logger.error(f"Stadium data file not found at {file_path}")
        return []
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            _stadium_locations_cache = json.load(f)
            logger.info("Loaded and cached static stadium_locations.json dataset successfully.")
            return _stadium_locations_cache
    except Exception as e:
        logger.error(f"Error reading stadium JSON database: {e}")
        return []
