# 5.4 Experiment Service

> Автоматически сгенерировано из файла `initial requirements.md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

## Глобальные элементы UI/UX (общие инструкции)

* **Header**: глобальный поиск (shadcn-ui Input с неоновыми эффектами из Aceternity), быстрые действия ("+") с Animate Button, иконка уведомлений (Animated Badge), профиль (shadcn-ui Dropdown с Neon Gradient).
* **Sidebar**: контекстная навигация по разделу (Floating Dock из Aceternity), состояния свернуть/закрепить, с неоновыми анимациями на hover.
* **Command Palette** (⌘K): переходы, создание объектов, поиск команд (shadcn-ui Command с анимированными списками из Aceternity).
* **Empty states**: CTA + подсказки + быстрый импорт/шаблоны (Animated Empty State с Bento Grid для предложений).
* **Bulk actions**: чекбоксы списков, операции (assign, transition, export, tag) с shadcn-ui Checkbox и Neon Buttons.
* **i18n**: RU/EN; время/валюта/форматы дат — настройка на уровне профиля/тенанта.
* **A11y**: контраст, клавиатурная навигация, ARIA‑лейблы.
* **Global Theme**: Темная тема с неоновыми градиентами (Neon Gradient Card, Particle Background из Aceternity). Все модалки — анимированные (Animated Modal), кнопки с contour эффектами, формы инпутов анимированные (Animated Input с неоном).

---

**Domain**: управление экспериментами (runs), метрики/логи/артефакты, интеграция с MLflow/W&B, ресурсы.

**Views** (с UI: Aceternity для анимированных чартов и логов)

1. **Experiments Table/Kanban**: статусы (Queued/Running/Completed/Failed); сортировки по дате/стоимости/метрике (Bento Grid для карточек).
2. **Experiment Detail**: *Overview* (config, params, resources), *Metrics* (line charts, compare baselines) (Animated Chart), *Logs* (live tail, уровни), *Artifacts* (модели, отчёты, чекпоинты), *Code* (git link), *Costs* (GPU/API) (Neon Cards).
3. **Create/Configure**: форма (model, approach, framework, hyperparams, resources), пресеты по типам (LLM/ML/CV) (Animated Form).
4. **Run Monitor**: прогресс (epochs/steps), ETA, live‑metrics, live‑logs, кнопки Stop/Download Logs (Real-time Progress с неоном).
5. **Compare Experiments**: выбор списка, таблица и диаграмма сравнений (Animated Table).

**Диалоги** (Animated Modal)

* *Create*; *Start* (резервация ресурсов, MLflow run); *Log metrics/logs*; *Upload artifact*; *Complete/Fail/Stop*; *Compare*.

**Валидаторы**: допустимые ресурсы; корректность гиперпараметров; лимиты артефактов; связность с Hypothesis.

**Фильтры/Поиск**: по гипотезе, статусу, модели, пользователю, дате (shadcn-ui DataTable с неоновыми фильтрами).

**API**: `POST /experiments`; `POST /experiments/{id}/start`; `POST /experiments/{id}/metrics`; `/metrics/batch`; `GET /experiments/{id}/metrics`; `POST /experiments/{id}/logs`; `GET /experiments/{id}/logs`; `POST /experiments/{id}/artifacts`; `GET /experiments/{id}/artifacts`; `POST /experiments/{id}/complete|fail|stop`; `POST /experiments/compare`.

**События**: `ExperimentCreated`, `ExperimentStarted`, `ExperimentCompleted/Failed/Stopped`.

**Нотификации**: владельцу гипотезы, TL, observers; «ресурсы недоступны»; «резервация скоро истекает».

**Роли/Права**: DS/MLE – свои; CURATOR/ADMIN – все.

**Ошибки/Edge**: OOM; недоступность ресурсов; таймаут логирования; превышение лимитов хранилища.

**Метрики**: % успешных; средняя длительность; стоимость; лидерборд по метрикам.

---
