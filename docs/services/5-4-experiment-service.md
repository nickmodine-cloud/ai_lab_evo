# 5.4 Experiment Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: управление экспериментами (runs), метрики/логи/артефакты, интеграция с MLflow/W&B, ресурсы.

**Views**
1. **Experiments Table/Kanban**: статусы (Queued/Running/Completed/Failed); сортировки по дате/стоимости/метрике.
2. **Experiment Detail**: *Overview* (config, params, resources), *Metrics* (line charts, compare baselines), *Logs* (live tail, уровни), *Artifacts* (модели, отчёты, чекпоинты), *Code* (git link), *Costs* (GPU/API).
3. **Create/Configure**: форма (model, approach, framework, hyperparams, resources), пресеты по типам (LLM/ML/CV).
4. **Run Monitor**: прогресс (epochs/steps), ETA, live‑metrics, live‑logs, кнопки Stop/Download Logs.
5. **Compare Experiments**: выбор списка, таблица и диаграмма сравнений.

**Диалоги**: *Create*; *Start* (резервация ресурсов, MLflow run); *Log metrics/logs*; *Upload artifact*; *Complete/Fail/Stop*; *Compare*.

**Валидаторы**: допустимые ресурсы; корректность гиперпараметров; лимиты артефактов; связность с Hypothesis.

**Фильтры/Поиск**: по гипотезе, статусу, модели, пользователю, дате.

**API**: `POST /experiments`; `POST /experiments/{id}/start`; `POST /experiments/{id}/metrics`; `/metrics/batch`; `GET /experiments/{id}/metrics`; `POST /experiments/{id}/logs`; `GET /experiments/{id}/logs`; `POST /experiments/{id}/artifacts`; `GET /experiments/{id}/artifacts`; `POST /experiments/{id}/complete|fail|stop`; `POST /experiments/compare`.

**События**: `ExperimentCreated`, `ExperimentStarted`, `ExperimentCompleted/Failed/Stopped`.

**Нотификации**: владельцу гипотезы, TL, observers; «ресурсы недоступны»; «резервация скоро истекает».

**Роли/Права**: DS/MLE – свои; CURATOR/ADMIN – все.

**Ошибки/Edge**: OOM; недоступность ресурсов; таймаут логирования; превышение лимитов хранилища.

**Метрики**: % успешных; средняя длительность; стоимость; лидерборд по метрикам.

---
