from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "changeme"
    APP_NAME: str = "Medical App"
    GEMINI_API_KEY: str
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()