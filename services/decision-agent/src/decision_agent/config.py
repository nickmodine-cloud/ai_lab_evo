"""Конфигурация агента принятия решений."""

from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentConfig(BaseSettings):
    """Настройки агента для работы с OpenRouter."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # OpenRouter API
    openrouter_api_key: str = Field(..., description="API ключ для OpenRouter")
    openrouter_base_url: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Базовый URL OpenRouter API",
    )
    openrouter_model: str = Field(
        default="anthropic/claude-3.5-sonnet",
        description="Модель для использования",
    )
    openrouter_temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Температура генерации",
    )
    openrouter_max_tokens: int = Field(
        default=4096,
        gt=0,
        description="Максимальное количество токенов",
    )

    # Настройки агента
    agent_name: str = Field(default="K2Tech Decision Agent", description="Имя агента")
    agent_version: str = Field(default="0.1.0", description="Версия агента")
    agent_context_window: int = Field(
        default=32000,
        description="Размер контекстного окна",
    )

    # Логирование
    log_level: str = Field(default="INFO", description="Уровень логирования")
    log_format: str = Field(default="json", description="Формат логов")

    # Пути к файлам проекта
    project_spec_path: Optional[Path] = Field(
        default=None,
        description="Путь к спецификации проекта",
    )
    agents_guide_path: Optional[Path] = Field(
        default=None,
        description="Путь к руководству по агентам",
    )
    workspace_path: Path = Field(
        default=Path("/workspace"),
        description="Путь к рабочему пространству",
    )

    # Настройки принятия решений
    auto_approve_simple_tasks: bool = Field(
        default=False,
        description="Автоматически одобрять простые задачи",
    )
    require_confirmation: bool = Field(
        default=True,
        description="Требовать подтверждение перед выполнением",
    )
    max_iterations: int = Field(
        default=10,
        gt=0,
        description="Максимальное количество итераций",
    )

    def get_spec_content(self) -> Optional[str]:
        """Получить содержимое спецификации проекта."""
        if self.project_spec_path and self.project_spec_path.exists():
            return self.project_spec_path.read_text(encoding="utf-8")
        return None

    def get_agents_guide_content(self) -> Optional[str]:
        """Получить содержимое руководства по агентам."""
        if self.agents_guide_path and self.agents_guide_path.exists():
            return self.agents_guide_path.read_text(encoding="utf-8")
        return None
