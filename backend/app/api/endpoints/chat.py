import os
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status

from app.models.chat import ChatRequest, ChatResponse
from app.services.gemini import gemini_service
from app.utils.semantic_matcher import semantic_search
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def load_stadium_data() -> list:
    """
    Helper to read mock stadium locations from JSON.
    """
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
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading stadium JSON file: {e}")
        return []


def load_system_instruction() -> str:
    """
    Helper to read official AI Assistant prompt templates from docs/prompts.md.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up until we find the parent containing 'docs' or the project root
    for _ in range(6):
        if os.path.exists(os.path.join(current_dir, "docs")):
            break
        current_dir = os.path.dirname(current_dir)
        
    file_path = os.path.join(current_dir, "docs", "prompts.md")
    
    if not os.path.exists(file_path):
        return "You are StadiaFlow AI, the official intelligent stadium assistant for the FIFA World Cup 2026."
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Simple extraction of the system prompt section if needed
            return content
    except Exception as e:
        return "You are StadiaFlow AI, the official intelligent stadium assistant for the FIFA World Cup 2026."


def construct_simulation_reply(matches: list, query: str) -> str:
    """
    Constructs a helpful context-aware response based on matched telemetry details.
    """
    query_lower = query.lower()
    
    # 1. Handle special emergency queries first
    if any(k in query_lower for k in ["emergency", "accident", "hurt", "fire", "security"]):
        return (
            "🚨 **EMERGENCY WARNING** 🚨\n\n"
            "If you or someone nearby is experiencing a medical emergency, threat, or fire:\n"
            "- Immediately notify nearby **Stadium Stewards** or **Security Guards**.\n"
            "- Head directly to the **Main First Aid Station** located at **Section 112**.\n"
            "- *We have logged this issue internally to dispatch medical personnel to your section.*"
        )
        
    if not matches:
        return (
            "I couldn't find any specific matching amenities or gates. "
            "Could you clarify your question? You can ask me about:\n"
            "- **Gates** (e.g. 'Where is Gate B?')\n"
            "- **Food & Beverages** (e.g. 'Where can I get vegetarian food or burgers?')\n"
            "- **Facilities** (e.g. 'Nearest restrooms', 'Where is First Aid?')"
        )

    # 2. General Location responses
    reply = "Based on the live FIFA 2026 stadium telemetry, here is what I found:\n\n"
    
    for loc in matches:
        name = loc.get("name")
        type_name = loc.get("type", "").replace("_", " ").title()
        section = loc.get("section")
        description = loc.get("description")
        amenities = loc.get("amenities", [])
        
        reply += f"📍 **{name}** ({type_name})\n"
        reply += f"- **Location**: Section {section}\n"
        reply += f"- **Details**: {description}\n"
        
        if amenities:
            reply += f"- **Amenity services**: {', '.join(amenities)}\n"
        reply += "\n"
        
    reply += "Let me know if you would like me to map out routes to any of these locations!"
    return reply


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint for querying the AI Stadium Assistant.
    Uses Google Gemini if configured, otherwise falls back to a similarity-based simulation engine.
    """
    query = request.message.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat query message cannot be empty."
        )
        
    timestamp_str = datetime.now(timezone.utc).isoformat()
    
    # Check if Gemini key is set and valid
    has_gemini_key = (
        settings.GEMINI_API_KEY and 
        settings.GEMINI_API_KEY != "mock_key_for_now" and 
        settings.GEMINI_API_KEY != "your_gemini_api_key_here"
    )
    
    try:
        stadium_locations = load_stadium_data()
        
        if has_gemini_key:
            try:
                logger.info("Routing query to Gemini AI SDK.")
                system_instruction = load_system_instruction()
                
                # Format system instruction with active JSON locations context
                stadium_info_str = json.dumps(stadium_locations, indent=2)
                contextual_instruction = (
                    f"{system_instruction}\n\n"
                    f"### CURRENT LIVE STADIUM Telemetry Context:\n"
                    f"{stadium_info_str}"
                )
                
                reply_text = await gemini_service.generate_response(
                    prompt=query,
                    system_instruction=contextual_instruction
                )
                
                return ChatResponse(
                    reply=reply_text,
                    source="gemini",
                    timestamp=timestamp_str,
                    confidence=1.0
                )
            except Exception as e:
                logger.error(f"Gemini API execution failed: {e}. Falling back to simulation.")
        
        # Fallback to simulation mode if key is missing or API failed
        logger.info("Routing to Semantic Simulation Engine.")
        matches, confidence_score = semantic_search(query, stadium_locations)
        reply_text = construct_simulation_reply(matches, query)
        
        return ChatResponse(
            reply=reply_text,
            source="simulation",
            timestamp=timestamp_str,
            confidence=confidence_score
        )
            
    except Exception as e:
        logger.error(f"Error occurred in chat resolution: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resolving your stadium query."
        )
