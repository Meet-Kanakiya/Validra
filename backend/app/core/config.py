import os
from pathlib import Path
from typing import List, Union
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory of the backend project (where .env and uploads reside)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Support custom env file location (e.g., .env.production, .env.staging) or default to BASE_DIR / .env
ENV_FILE = os.getenv("ENV_FILE", str(BASE_DIR / ".env"))

# Explicitly load environment variables via python-dotenv
# override=False ensures host/container system environment variables take precedence in production
if os.path.exists(ENV_FILE):
    load_dotenv(dotenv_path=ENV_FILE, override=False)
else:
    load_dotenv(override=False)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Validra API"
    API_STR: str = "/api"
    ENV: str = "development"  # development | production | test
    DATABASE_URL: str = "postgresql+asyncpg://postgres:root@localhost:5432/validra"
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_IMAGE_TYPES: Union[List[str], str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    ]

    @field_validator("ALLOWED_IMAGE_TYPES", mode="before")
    @classmethod
    def parse_allowed_image_types(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=ENV_FILE if os.path.exists(ENV_FILE) else None,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
