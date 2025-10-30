# K2Tech AI Lab — Onboarding Platform

Полноценная реализация онбординг-сервиса из продуктовой спецификации K2Tech AI Lab. Репозиторий содержит рабочий backend (FastAPI + SQLite), браузерный фронтенд без моков и исходную документацию, из которой вырастает остальная платформа.

## Архитектура

```
backend/
  app/
    main.py          # FastAPI-приложение, REST API, выдача PDF/Markdown, статика
    database.py      # Инициализация SQLite и фабрика сессий
    models.py        # SQLModel-таблицы сессий, транскриптов, событий, голосовых артефактов
    schemas.py       # Pydantic-схемы запросов/ответов
    services.py      # Логика NLU, генерации roadmap/checklist, голосовые команды, отчёты
frontend/
  index.html         # Семиступенчатый интерфейс: consent → voice → roadmap → экспорт
  styles.css         # Безфреймворковый дизайн в стиле продуктовой спецификации
  app.js             # Голосовая запись, NLU-команды, управление сессиями через API
requirements.txt     # Зависимости Python
storage/             # Живые голосовые артефакты (webm), раздаются через `/storage`
```

Документация из прошлой итерации по-прежнему доступна в `docs/` и служит опорой для развития остальных сервисов экосистемы.

## Запуск

1. **Установите зависимости** (Python 3.10+):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Запустите backend**:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
   Приложение поднимется на http://localhost:8000. Главная страница (`/`) выдаёт фронтенд.

3. **Откройте UI**:
   - Перейдите в браузере на http://localhost:8000/app/ (или на корень, если поднимаете без дополнительного прокси).
   - Нажмите «Запись» — используется реальный Web Speech API (Chrome/Edge) и живой MediaRecorder. При отсутствии поддержки доступен ручной ввод текста.

4. **Экспорт отчётов**:
   - После завершения сессии доступны ссылки «Скачать PDF» и «Скачать Markdown». Сервер учитывает summary/roadmap/checklist и прикреплённые голосовые артефакты.

## API

Основные точки, отражающие спецификацию раздела 5.1:

| Метод | Endpoint | Назначение |
|-------|----------|------------|
| GET   | `/onboarding/sessions` | Список сессий с фильтрами (язык/статус/режим/индустрия) |
| POST  | `/onboarding/sessions` | Создать новую сессию, зафиксировать consent |
| POST  | `/onboarding/sessions/{id}/voice-input` | Загрузить голосовой артефакт (base64) и опциональный transcript |
| POST  | `/onboarding/sessions/{id}/text-input` | Добавить текстовый фрагмент и обновить резюме |
| POST  | `/onboarding/sessions/{id}/voice-edit` | Применить голосовую команду (NLU) к summary/checklist |
| PATCH | `/onboarding/sessions/{id}/summary` | Ручное уточнение резюме |
| POST  | `/onboarding/sessions/{id}/generate-roadmap` | Построить roadmap по целям и барьерам |
| POST  | `/onboarding/sessions/{id}/generate-checklist` | Сформировать readiness checklist |
| POST  | `/onboarding/sessions/{id}/checklist/status` | Обновить прогресс по пункту checklist |
| POST  | `/onboarding/sessions/{id}/complete` | Завершить сессию, зафиксировать readiness |
| DELETE| `/onboarding/sessions/{id}` | Soft-delete с указанием причины |
| GET   | `/onboarding/sessions/{id}/transcript` | История транскриптов |
| GET   | `/onboarding/sessions/{id}/events` | История событий (audit log) |
| GET   | `/onboarding/sessions/{id}/export-pdf` | PDF-экспорт отчёта |
| GET   | `/onboarding/sessions/{id}/export-markdown` | Markdown-экспорт для рассылки/презентаций |

Полный Swagger доступен на http://localhost:8000/docs.

## Документация и генерация

- `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md` — мастер-документ.
- `docs/services/` — автоматические выжимки по сервисам (генерируются `python scripts/split_spec.py`).

## Roadmap развития

- Подключить реальные ML/LLM-пайплайны для резюме и генерации дорожной карты.
- Интегрировать IAM, Notification, Analytics сервисы из общей спецификации.
- Завести CI (pytest + playwright) и обвязки инфраструктуры (Docker Compose, Terraform).

Репозиторий готов для запуска демонстраций и быстрых пилотов без моков на фронте.
