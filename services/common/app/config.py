from functools import lru_cache
from pydantic import BaseSettings


class Settings(BaseSettings):
    service_name: str = "service"
    log_level: str = "INFO"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
