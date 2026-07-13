import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Comma-separated list in env: "http://localhost:5173,http://127.0.0.1:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://stadia-flow-9kc0h8iy9-stadiaflow.vercel.app"
    
    GEMINI_API_KEY: str = "mock_key_for_now"
    GEMINI_MODEL_NAME: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
