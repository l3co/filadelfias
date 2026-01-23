"""
Configuration settings for the application.
Uses Pydantic Settings for environment variable management.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Filadelfias API"
    environment: str = "development"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/filadelfias"

    @field_validator("database_url", mode="before")
    @classmethod
    def convert_to_asyncpg(cls, v: str) -> str:
        """Convert postgresql:// to postgresql+asyncpg:// and fix SSL params for asyncpg."""
        if not v:
            return v
        # Convert driver
        if v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        # asyncpg doesn't support sslmode param, remove it (SSL is handled separately)
        if "sslmode=" in v:
            # Remove sslmode parameter from URL
            import re

            v = re.sub(r"[?&]sslmode=[^&]*", "", v)
            # Clean up URL if we left a dangling ? or &
            v = v.replace("?&", "?").rstrip("?")
        return v

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS - stored as string to avoid JSON parsing issues
    cors_origins_str: str = "http://localhost:3000,http://localhost:5173,https://filadelfias-6a116.web.app,https://filadelfias.com,https://www.filadelfias.com"

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
