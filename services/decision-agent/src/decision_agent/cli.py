"""CLI интерфейс для агента принятия решений."""

import json
import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from rich.syntax import Syntax
from rich.table import Table

from decision_agent.agent import DecisionAgent
from decision_agent.config import AgentConfig

console = Console()


def print_banner():
    """Вывести баннер агента."""
    banner = """
╔═══════════════════════════════════════════════╗
║   K2Tech AI Lab - Decision Agent             ║
║   OpenRouter Integration for Development     ║
╚═══════════════════════════════════════════════╝
    """
    console.print(banner, style="bold cyan")


def print_decision(decision):
    """
    Вывести решение агента в красивом формате.
    
    Args:
        decision: Объект Decision
    """
    # Заголовок
    console.print()
    console.print(Panel(
        f"[bold yellow]{decision.title}[/bold yellow]\n\n"
        f"[dim]{decision.description}[/dim]",
        title=f"[bold]Решение агента[/bold] | Приоритет: {decision.priority}",
        border_style="cyan",
    ))
    
    # Обоснование
    console.print("\n[bold cyan]💡 Обоснование:[/bold cyan]")
    console.print(f"  {decision.reasoning}\n")
    
    # Шаги выполнения
    console.print("[bold cyan]📋 Шаги выполнения:[/bold cyan]")
    for i, step in enumerate(decision.steps, 1):
        console.print(f"  {i}. {step}")
    
    # Затрагиваемые модули
    if decision.affected_modules:
        console.print("\n[bold cyan]🎯 Затрагиваемые модули:[/bold cyan]")
        console.print(f"  {', '.join(decision.affected_modules)}")
    
    # Сложность
    console.print(f"\n[bold cyan]⚖️  Сложность:[/bold cyan] {decision.estimated_complexity}")
    
    # Зависимости
    if decision.dependencies:
        console.print("\n[bold cyan]🔗 Зависимости:[/bold cyan]")
        for dep in decision.dependencies:
            console.print(f"  • {dep}")
    
    # Риски
    if decision.risks:
        console.print("\n[bold yellow]⚠️  Риски:[/bold yellow]")
        for risk in decision.risks:
            console.print(f"  • {risk}")
    
    # Критерии успеха
    console.print("\n[bold green]✅ Критерии успеха:[/bold green]")
    for criterion in decision.success_criteria:
        console.print(f"  • {criterion}")
    
    console.print()


def print_context_summary(context):
    """
    Вывести сводку по контексту проекта.
    
    Args:
        context: Объект ProjectContext
    """
    table = Table(title="Контекст проекта", show_header=True, header_style="bold magenta")
    table.add_column("Параметр", style="cyan")
    table.add_column("Значение", style="white")
    
    if context.current_branch:
        table.add_row("Текущая ветка", context.current_branch)
    
    if context.git_status:
        status_lines = context.git_status.split("\n")
        table.add_row("Изменения в git", f"{len(status_lines)} файлов")
    else:
        table.add_row("Изменения в git", "Нет")
    
    if context.recent_commits:
        table.add_row("Последний коммит", context.recent_commits[0] if context.recent_commits else "N/A")
    
    if context.workspace_structure:
        services_count = len(context.workspace_structure.get("services", []))
        table.add_row("Сервисов создано", str(services_count))
    
    console.print(table)
    console.print()


@click.group()
@click.version_option(version="0.1.0")
def main():
    """K2Tech Decision Agent - агент для принятия решений по разработке."""
    pass


@main.command()
@click.option(
    "--request",
    "-r",
    help="Конкретный запрос или задача для анализа",
    type=str,
)
@click.option(
    "--output",
    "-o",
    help="Путь для сохранения результата в JSON",
    type=click.Path(),
)
@click.option(
    "--auto-approve",
    "-y",
    is_flag=True,
    help="Автоматически одобрить решение без подтверждения",
)
def analyze(request: Optional[str], output: Optional[str], auto_approve: bool):
    """
    Проанализировать проект и получить рекомендации по следующим шагам.
    
    Пример:
        decision-agent analyze -r "нужно создать сервис гипотез"
    """
    print_banner()
    
    try:
        # Загрузка конфигурации
        config = AgentConfig()
        
        # Создание агента
        with console.status("[bold green]Инициализация агента..."):
            agent = DecisionAgent(config)
        
        # Загрузка контекста
        with console.status("[bold green]Загрузка контекста проекта..."):
            context = agent.load_project_context()
        
        print_context_summary(context)
        
        # Анализ и принятие решения
        with console.status("[bold green]Анализ проекта и принятие решения..."):
            decision = agent.analyze_current_state(user_request=request)
        
        # Вывод решения
        print_decision(decision)
        
        # Сохранение в файл
        if output:
            output_path = Path(output)
            output_path.write_text(
                decision.model_dump_json(indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
            console.print(f"[green]✓[/green] Решение сохранено в {output}")
        
        # Подтверждение выполнения
        if not auto_approve:
            if Confirm.ask("\n[bold]Сгенерировать детальный план реализации?[/bold]"):
                with console.status("[bold green]Генерация плана реализации..."):
                    plan = agent.generate_implementation_plan(decision)
                
                console.print("\n[bold cyan]📝 План реализации:[/bold cyan]\n")
                console.print(Panel(plan, border_style="green"))
                
                if output:
                    plan_path = Path(output).with_suffix(".plan.md")
                    plan_path.write_text(plan, encoding="utf-8")
                    console.print(f"\n[green]✓[/green] План сохранён в {plan_path}")
        
    except Exception as e:
        console.print(f"[bold red]❌ Ошибка:[/bold red] {e}", style="red")
        sys.exit(1)


@main.command()
@click.option(
    "--max-iterations",
    "-n",
    help="Максимальное количество итераций",
    type=int,
    default=10,
)
@click.option(
    "--output-dir",
    "-o",
    help="Директория для сохранения решений",
    type=click.Path(),
    default="./decisions",
)
def continuous(max_iterations: int, output_dir: str):
    """
    Запустить непрерывный цикл принятия решений.
    
    Агент будет анализировать проект и предлагать следующие шаги
    до достижения полной реализации спецификации.
    
    Пример:
        decision-agent continuous -n 5 -o ./decisions
    """
    print_banner()
    
    try:
        # Загрузка конфигурации
        config = AgentConfig()
        config.max_iterations = max_iterations
        
        # Создание директории для решений
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Создание агента
        console.print("[bold green]Инициализация агента...")
        agent = DecisionAgent(config)
        
        decisions = []
        
        def decision_callback(decision):
            """Обработка каждого решения."""
            decisions.append(decision)
            iteration = len(decisions)
            
            console.print(f"\n[bold cyan]═══ Итерация {iteration}/{max_iterations} ═══[/bold cyan]\n")
            print_decision(decision)
            
            # Сохранение решения
            decision_file = output_path / f"decision_{iteration:03d}.json"
            decision_file.write_text(
                decision.model_dump_json(indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
            
            # Запрос подтверждения
            if config.require_confirmation:
                return Confirm.ask("\n[bold]Продолжить к следующей итерации?[/bold]")
            
            return True
        
        # Запуск цикла
        console.print(f"\n[bold green]Запуск непрерывного цикла ({max_iterations} итераций)...[/bold green]\n")
        agent.continuous_decision_loop(
            max_iterations=max_iterations,
            callback=decision_callback,
        )
        
        # Итоговая статистика
        console.print(f"\n[bold green]✓ Цикл завершён![/bold green]")
        console.print(f"Принято решений: {len(decisions)}")
        console.print(f"Результаты сохранены в: {output_path.absolute()}")
        
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠ Цикл прерван пользователем[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"[bold red]❌ Ошибка:[/bold red] {e}", style="red")
        sys.exit(1)


@main.command()
def context():
    """
    Показать текущий контекст проекта.
    
    Отображает информацию о текущем состоянии проекта,
    включая ветку git, изменения, структуру и т.д.
    """
    print_banner()
    
    try:
        config = AgentConfig()
        agent = DecisionAgent(config)
        
        with console.status("[bold green]Загрузка контекста..."):
            ctx = agent.load_project_context()
        
        print_context_summary(ctx)
        
        # Детальная информация
        if ctx.specification:
            spec_lines = ctx.specification.split("\n")
            console.print(f"[cyan]Спецификация:[/cyan] загружена ({len(spec_lines)} строк)")
        
        if ctx.agents_guide:
            guide_lines = ctx.agents_guide.split("\n")
            console.print(f"[cyan]Руководство:[/cyan] загружено ({len(guide_lines)} строк)")
        
        if ctx.workspace_structure:
            console.print("\n[bold cyan]Структура workspace:[/bold cyan]")
            for key, value in ctx.workspace_structure.items():
                if value:
                    console.print(f"  {key}: {', '.join(value)}")
                else:
                    console.print(f"  {key}: [dim]пусто[/dim]")
        
        if ctx.recent_commits:
            console.print("\n[bold cyan]Последние 5 коммитов:[/bold cyan]")
            for commit in ctx.recent_commits[:5]:
                console.print(f"  {commit}")
        
    except Exception as e:
        console.print(f"[bold red]❌ Ошибка:[/bold red] {e}", style="red")
        sys.exit(1)


@main.command()
@click.argument("api_key", required=False)
def setup(api_key: Optional[str]):
    """
    Настроить агента (создать .env файл).
    
    Аргументы:
        api_key: API ключ OpenRouter (опционально, будет запрошен)
    
    Пример:
        decision-agent setup
        decision-agent setup sk-or-v1-xxxxx
    """
    print_banner()
    
    env_path = Path(".env")
    env_example_path = Path(__file__).parent.parent.parent / ".env.example"
    
    console.print("[bold]Настройка агента[/bold]\n")
    
    # Запрос API ключа
    if not api_key:
        api_key = Prompt.ask(
            "[cyan]Введите ваш OpenRouter API ключ[/cyan]",
            password=True,
        )
    
    # Выбор модели
    models = [
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3-opus",
        "openai/gpt-4-turbo",
        "google/gemini-pro-1.5",
    ]
    
    console.print("\n[cyan]Доступные модели:[/cyan]")
    for i, model in enumerate(models, 1):
        console.print(f"  {i}. {model}")
    
    model_choice = Prompt.ask(
        "\nВыберите модель",
        choices=[str(i) for i in range(1, len(models) + 1)],
        default="1",
    )
    selected_model = models[int(model_choice) - 1]
    
    # Другие настройки
    workspace_path = Prompt.ask(
        "[cyan]Путь к workspace[/cyan]",
        default="/workspace",
    )
    
    spec_path = Prompt.ask(
        "[cyan]Путь к спецификации проекта[/cyan]",
        default='/workspace/k_2_tech_ai_lab_полная_спецификация_v_1 (1).md',
    )
    
    agents_guide = Prompt.ask(
        "[cyan]Путь к AGENTS.md[/cyan]",
        default="/workspace/AGENTS.md",
    )
    
    # Создание .env файла
    env_content = f"""# OpenRouter API Configuration
OPENROUTER_API_KEY={api_key}
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL={selected_model}
OPENROUTER_TEMPERATURE=0.7
OPENROUTER_MAX_TOKENS=4096

# Agent Configuration
AGENT_NAME=K2Tech Decision Agent
AGENT_VERSION=0.1.0
AGENT_CONTEXT_WINDOW=32000

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Development Context
PROJECT_SPEC_PATH={spec_path}
AGENTS_GUIDE_PATH={agents_guide}
WORKSPACE_PATH={workspace_path}

# Decision Making Configuration
AUTO_APPROVE_SIMPLE_TASKS=false
REQUIRE_CONFIRMATION=true
MAX_ITERATIONS=10
"""
    
    env_path.write_text(env_content, encoding="utf-8")
    
    console.print("\n[bold green]✓ Конфигурация сохранена в .env[/bold green]")
    console.print("\nТеперь вы можете использовать агента:")
    console.print("  [cyan]decision-agent analyze[/cyan] - анализ и рекомендации")
    console.print("  [cyan]decision-agent continuous[/cyan] - непрерывная разработка")
    console.print("  [cyan]decision-agent context[/cyan] - показать контекст\n")


@main.command()
def test_connection():
    """Проверить подключение к OpenRouter API."""
    print_banner()
    
    try:
        console.print("[bold]Проверка подключения к OpenRouter...[/bold]\n")
        
        config = AgentConfig()
        agent = DecisionAgent(config)
        
        # Тестовый запрос
        with console.status("[bold green]Отправка тестового запроса..."):
            response = agent._call_openrouter(
                messages=[
                    {
                        "role": "user",
                        "content": "Ответь одним словом: работает ли соединение?",
                    }
                ],
                max_tokens=50,
            )
        
        console.print(f"[green]✓ Соединение успешно![/green]")
        console.print(f"[dim]Ответ модели: {response}[/dim]\n")
        console.print(f"Модель: [cyan]{config.openrouter_model}[/cyan]")
        
    except Exception as e:
        console.print(f"[bold red]❌ Ошибка подключения:[/bold red] {e}")
        console.print("\nПроверьте:")
        console.print("  1. Правильность API ключа в .env")
        console.print("  2. Доступность интернет-соединения")
        console.print("  3. Баланс на аккаунте OpenRouter")
        sys.exit(1)


if __name__ == "__main__":
    main()
