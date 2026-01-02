from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Document Translator"
    debug: bool = True
    anthropic_api_key: Optional[str] = None  # Optional for testing

    # File upload configuration
    allowed_file_extensions: list[str] = ['.docx', '.pptx']
    max_file_size_mb: int = 10

    class Config:
        env_file = '.env'
        extra = 'ignore'  # Ignore extra fields from .env

settings = Settings()