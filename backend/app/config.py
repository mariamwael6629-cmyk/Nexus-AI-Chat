from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./nexus.db"
    secret_key: str = "change-this-to-a-random-secret-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:8088,http://127.0.0.1:8088"
    environment: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
