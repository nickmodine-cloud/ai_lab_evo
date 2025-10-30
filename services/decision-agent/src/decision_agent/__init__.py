"""
K2Tech Decision Agent - OpenRouter интеграция для принятия решений по разработке.

Этот агент анализирует спецификацию проекта, текущее состояние разработки
и принимает решения о следующих шагах, используя OpenRouter API.
"""

__version__ = "0.1.0"
__author__ = "K2Tech AI Lab"

from decision_agent.agent import DecisionAgent
from decision_agent.config import AgentConfig

__all__ = ["DecisionAgent", "AgentConfig"]
