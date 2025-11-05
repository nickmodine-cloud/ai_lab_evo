from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class HypothesisSettings(BaseSettings):
    """Configuration container for the Hypothesis service."""

    database_url: str = Field(
        default="postgresql+psycopg://hypothesis:hypothesis@localhost:5433/hypothesis"
    )
    database_echo: bool = Field(default=False)
    seed_demo_data: bool = Field(default=True)
    default_timezone: Optional[str] = Field(default="UTC")

    model_config = SettingsConfigDict(
        env_prefix="HYPOTHESIS_",
        env_file=".env",
        env_file_encoding="utf-8",
    )


@lru_cache(maxsize=1)
def get_settings() -> HypothesisSettings:
    return HypothesisSettings()
