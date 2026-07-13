import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini import gemini_service

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str


# Helper to load system prompt from prompts.md
def get_system_prompt() -> str:
    try:
        # Load system instruction context from docs
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        prompts_path = os.path.join(base_dir, "docs", "prompts.md")
        if os.path.exists(prompts_path):
            with open(prompts_path, "r", encoding="utf-8") as f:
                return f.read()
    except Exception:
        pass
    return "You are StadiaFlow AI, a FIFA World Cup 2026 stadium assistant."


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Primary endpoint for chatting with the StadiaFlow AI assistant.
    Reads customized prompts from docs/prompts.md.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    system_instruction = get_system_prompt()
    response_text = await gemini_service.generate_response(
        prompt=request.message,
        system_instruction=system_instruction
    )
    
    # Import datetime dynamically to avoid import overhead at startup
    from datetime import datetime, timezone
    return ChatResponse(
        response=response_text,
        session_id=request.session_id,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
