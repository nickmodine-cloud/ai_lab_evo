"""Основной модуль агента принятия решений на базе OpenRouter."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from openai import OpenAI
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential

from decision_agent.config import AgentConfig

logger = logging.getLogger(__name__)


class ProjectContext(BaseModel):
    """Контекст текущего проекта."""

    specification: Optional[str] = Field(None, description="Спецификация проекта")
    agents_guide: Optional[str] = Field(None, description="Руководство по агентам")
    current_branch: Optional[str] = Field(None, description="Текущая ветка git")
    git_status: Optional[str] = Field(None, description="Статус git")
    recent_commits: Optional[List[str]] = Field(None, description="Последние коммиты")
    workspace_structure: Optional[Dict[str, Any]] = Field(
        None, description="Структура workspace"
    )


class Decision(BaseModel):
    """Решение агента о следующих шагах разработки."""

    task_type: str = Field(..., description="Тип задачи")
    priority: str = Field(..., description="Приоритет (HIGH/MEDIUM/LOW)")
    title: str = Field(..., description="Название задачи")
    description: str = Field(..., description="Детальное описание")
    reasoning: str = Field(..., description="Обоснование решения")
    steps: List[str] = Field(..., description="Конкретные шаги для выполнения")
    affected_modules: List[str] = Field(..., description="Затрагиваемые модули")
    estimated_complexity: str = Field(..., description="Оценка сложности")
    dependencies: List[str] = Field(default_factory=list, description="Зависимости")
    risks: List[str] = Field(default_factory=list, description="Риски")
    success_criteria: List[str] = Field(..., description="Критерии успеха")


class DecisionAgent:
    """
    Агент для принятия решений о разработке на основе OpenRouter API.
    
    Анализирует спецификацию проекта, текущее состояние кодовой базы
    и принимает решения о приоритетах и следующих шагах разработки.
    """

    def __init__(self, config: AgentConfig):
        """
        Инициализация агента.
        
        Args:
            config: Конфигурация агента
        """
        self.config = config
        self.client = OpenAI(
            api_key=config.openrouter_api_key,
            base_url=config.openrouter_base_url,
        )
        self.context: Optional[ProjectContext] = None
        
        # Настройка логирования
        logging.basicConfig(
            level=getattr(logging, config.log_level),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        )

    def load_project_context(self) -> ProjectContext:
        """
        Загрузить контекст проекта из файлов и git.
        
        Returns:
            ProjectContext с загруженными данными
        """
        logger.info("Загрузка контекста проекта...")
        
        context = ProjectContext(
            specification=self.config.get_spec_content(),
            agents_guide=self.config.get_agents_guide_content(),
        )
        
        # Получение информации из git
        try:
            import subprocess
            
            # Текущая ветка
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True,
                text=True,
                check=True,
            )
            context.current_branch = result.stdout.strip()
            
            # Git status
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                check=True,
            )
            context.git_status = result.stdout.strip()
            
            # Последние коммиты
            result = subprocess.run(
                ["git", "log", "--oneline", "-10"],
                capture_output=True,
                text=True,
                check=True,
            )
            context.recent_commits = result.stdout.strip().split("\n")
            
        except Exception as e:
            logger.warning(f"Не удалось получить информацию git: {e}")
        
        # Анализ структуры workspace
        try:
            context.workspace_structure = self._analyze_workspace_structure()
        except Exception as e:
            logger.warning(f"Не удалось проанализировать структуру workspace: {e}")
        
        self.context = context
        logger.info("Контекст проекта загружен")
        return context

    def _analyze_workspace_structure(self) -> Dict[str, Any]:
        """
        Анализировать структуру рабочего пространства.
        
        Returns:
            Словарь с информацией о структуре
        """
        workspace = self.config.workspace_path
        structure = {
            "services": [],
            "apps": [],
            "packages": [],
            "docs": [],
            "scripts": [],
        }
        
        # Сканирование директорий
        for dir_type in structure.keys():
            dir_path = workspace / dir_type
            if dir_path.exists() and dir_path.is_dir():
                structure[dir_type] = [
                    item.name for item in dir_path.iterdir() if item.is_dir()
                ]
        
        return structure

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    def _call_openrouter(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Вызов OpenRouter API с повторными попытками.
        
        Args:
            messages: Список сообщений для модели
            temperature: Температура генерации
            max_tokens: Максимальное количество токенов
            
        Returns:
            Ответ модели
        """
        try:
            response = self.client.chat.completions.create(
                model=self.config.openrouter_model,
                messages=messages,
                temperature=temperature or self.config.openrouter_temperature,
                max_tokens=max_tokens or self.config.openrouter_max_tokens,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Ошибка при вызове OpenRouter API: {e}")
            raise

    def analyze_current_state(self, user_request: Optional[str] = None) -> Decision:
        """
        Анализировать текущее состояние проекта и принять решение.
        
        Args:
            user_request: Дополнительный запрос пользователя
            
        Returns:
            Решение о следующих шагах
        """
        if not self.context:
            self.load_project_context()
        
        logger.info("Анализ текущего состояния проекта...")
        
        # Формирование системного промпта
        system_prompt = self._build_system_prompt()
        
        # Формирование пользовательского запроса
        user_prompt = self._build_user_prompt(user_request)
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        
        # Получение решения от модели
        response = self._call_openrouter(messages)
        
        # Парсинг JSON ответа
        try:
            decision_data = self._extract_json_from_response(response)
            decision = Decision(**decision_data)
            logger.info(f"Принято решение: {decision.title}")
            return decision
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге решения: {e}")
            logger.debug(f"Ответ модели: {response}")
            raise

    def _build_system_prompt(self) -> str:
        """Построить системный промпт с контекстом проекта."""
        prompt_parts = [
            "Ты - эксперт-архитектор и технический лидер проекта K2Tech AI Lab.",
            "Твоя задача - анализировать текущее состояние разработки и принимать решения о приоритетах и следующих шагах.",
            "",
            "# КОНТЕКСТ ПРОЕКТА",
            "",
        ]
        
        if self.context.specification:
            prompt_parts.extend([
                "## Спецификация проекта:",
                self.context.specification[:15000],  # Ограничение для контекста
                "",
            ])
        
        if self.context.agents_guide:
            prompt_parts.extend([
                "## Руководство по разработке:",
                self.context.agents_guide,
                "",
            ])
        
        if self.context.current_branch:
            prompt_parts.extend([
                f"## Текущая ветка: {self.context.current_branch}",
                "",
            ])
        
        if self.context.workspace_structure:
            prompt_parts.extend([
                "## Структура проекта:",
                json.dumps(self.context.workspace_structure, indent=2, ensure_ascii=False),
                "",
            ])
        
        prompt_parts.extend([
            "# ТВОИ ОБЯЗАННОСТИ",
            "",
            "1. Анализировать спецификацию и текущее состояние кодовой базы",
            "2. Определять приоритетные задачи на основе:",
            "   - Критичности для бизнеса",
            "   - Зависимостей между модулями",
            "   - Текущего прогресса разработки",
            "3. Предлагать конкретные, исполняемые шаги",
            "4. Учитывать архитектурные принципы и best practices",
            "5. Минимизировать технический долг",
            "",
            "# ФОРМАТ ОТВЕТА",
            "",
            "Отвечай СТРОГО в формате JSON со следующей структурой:",
            "```json",
            "{",
            '  "task_type": "feature|bugfix|refactor|infrastructure|documentation",',
            '  "priority": "HIGH|MEDIUM|LOW",',
            '  "title": "Краткое название задачи",',
            '  "description": "Детальное описание задачи",',
            '  "reasoning": "Почему эта задача важна сейчас",',
            '  "steps": ["Шаг 1", "Шаг 2", "..."],',
            '  "affected_modules": ["module1", "module2"],',
            '  "estimated_complexity": "SIMPLE|MEDIUM|COMPLEX",',
            '  "dependencies": ["зависимость1", "зависимость2"],',
            '  "risks": ["риск1", "риск2"],',
            '  "success_criteria": ["критерий1", "критерий2"]',
            "}",
            "```",
            "",
            "ВАЖНО:",
            "- Используй ТОЛЬКО русский язык",
            "- Будь конкретным и практичным",
            "- Следуй архитектуре из спецификации",
            "- Не предлагай упрощений или моков",
            "- Все предложения должны быть полностью реализуемыми",
        ])
        
        return "\n".join(prompt_parts)

    def _build_user_prompt(self, user_request: Optional[str] = None) -> str:
        """Построить пользовательский промпт."""
        prompt_parts = [
            "# ТЕКУЩЕЕ СОСТОЯНИЕ",
            "",
        ]
        
        if self.context.git_status:
            prompt_parts.extend([
                "## Git Status:",
                self.context.git_status if self.context.git_status else "Нет изменений",
                "",
            ])
        
        if self.context.recent_commits:
            prompt_parts.extend([
                "## Последние коммиты:",
                "\n".join(self.context.recent_commits[:5]),
                "",
            ])
        
        if user_request:
            prompt_parts.extend([
                "## Запрос разработчика:",
                user_request,
                "",
            ])
        
        prompt_parts.extend([
            "# ЗАДАЧА",
            "",
            "Проанализируй текущее состояние проекта и определи:",
            "1. Что нужно сделать в первую очередь?",
            "2. Какие модули затронуты?",
            "3. Какие есть риски и зависимости?",
            "4. Каковы критерии успешного выполнения?",
            "",
            "Предоставь решение в формате JSON (без дополнительного текста).",
        ])
        
        return "\n".join(prompt_parts)

    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Извлечь JSON из ответа модели.
        
        Args:
            response: Ответ модели
            
        Returns:
            Распарсенный JSON
        """
        # Попытка найти JSON между ```json и ```
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.find("```", start)
            json_str = response[start:end].strip()
        elif "```" in response:
            start = response.find("```") + 3
            end = response.find("```", start)
            json_str = response[start:end].strip()
        else:
            # Попытка распарсить весь ответ как JSON
            json_str = response.strip()
        
        return json.loads(json_str)

    def generate_implementation_plan(self, decision: Decision) -> str:
        """
        Сгенерировать детальный план реализации решения.
        
        Args:
            decision: Принятое решение
            
        Returns:
            Детальный план реализации
        """
        logger.info("Генерация плана реализации...")
        
        messages = [
            {
                "role": "system",
                "content": (
                    "Ты - технический эксперт. "
                    "Создай детальный план реализации задачи с конкретными командами, "
                    "изменениями в коде и тестами. "
                    "Используй ТОЛЬКО русский язык. "
                    "Следуй архитектурным принципам из AGENTS.md."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Создай детальный план реализации для задачи:\n\n"
                    f"Название: {decision.title}\n"
                    f"Описание: {decision.description}\n"
                    f"Шаги: {json.dumps(decision.steps, ensure_ascii=False, indent=2)}\n\n"
                    f"Модули: {', '.join(decision.affected_modules)}\n\n"
                    "Включи:\n"
                    "1. Структуру файлов и директорий\n"
                    "2. Основной код с примерами\n"
                    "3. Необходимые зависимости\n"
                    "4. Команды для тестирования\n"
                    "5. Критерии приёмки\n"
                ),
            },
        ]
        
        plan = self._call_openrouter(messages, temperature=0.3)
        return plan

    def continuous_decision_loop(
        self,
        max_iterations: Optional[int] = None,
        callback: Optional[callable] = None,
    ) -> List[Decision]:
        """
        Непрерывный цикл принятия решений и разработки.
        
        Args:
            max_iterations: Максимальное количество итераций
            callback: Функция обратного вызова для каждого решения
            
        Returns:
            Список принятых решений
        """
        iterations = max_iterations or self.config.max_iterations
        decisions = []
        
        logger.info(f"Запуск цикла принятия решений (макс. {iterations} итераций)...")
        
        for i in range(iterations):
            logger.info(f"Итерация {i + 1}/{iterations}")
            
            # Перезагрузка контекста для актуальности
            self.load_project_context()
            
            # Принятие решения
            decision = self.analyze_current_state()
            decisions.append(decision)
            
            # Callback для обработки решения
            if callback:
                should_continue = callback(decision)
                if not should_continue:
                    logger.info("Цикл остановлен callback функцией")
                    break
            
            # Проверка завершённости проекта
            if self._is_project_complete():
                logger.info("Проект завершён согласно спецификации")
                break
        
        logger.info(f"Цикл завершён. Принято решений: {len(decisions)}")
        return decisions

    def _is_project_complete(self) -> bool:
        """
        Проверить, завершён ли проект согласно спецификации.
        
        Returns:
            True если все критичные модули реализованы
        """
        # TODO: Реализовать проверку на основе спецификации
        # Пока возвращаем False для продолжения разработки
        return False
