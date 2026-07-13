from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import gemini, stadium, chat

app = FastAPI(
    title="StadiumPilot AI Backend",
    description="Smart Stadium Assistant API for FIFA World Cup 2026",
    version="1.0.0",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoint routers
app.include_router(gemini.router, prefix="/api/v1/gemini", tags=["Gemini AI Assistant"])
app.include_router(stadium.router, prefix="/api/v1", tags=["Stadium & Crowd Live Data"])
app.include_router(chat.router, prefix="/api", tags=["AI Assistant Core"])


@app.get("/api/health")
def api_health():
    return {
        "status": "online",
        "service": "StadiumPilot AI Backend",
        "version": "1.0"
    }


@app.get("/")
def read_root():
    return {
        "message": "Welcome to StadiumPilot AI API",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "gemini_api_configured": settings.GEMINI_API_KEY != "mock_key_for_now" and settings.GEMINI_API_KEY != "your_gemini_api_key_here"
    }
