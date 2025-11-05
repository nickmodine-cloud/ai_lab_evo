```markdown
# K2Tech AI Lab — Полная спецификация v1.0 (Draft)

> **Назначение документа**: исчерпывающая продуктово‑техническая спецификация «ИИ‑лаборатории под ключ». Содержит полную навигацию, описание всех модулей/представлений (views), сценариев (create/update/delete), дашбордов, API, событий, ролей и прав, нефункциональных требований. Готово для передачи в команду разработки (Codex) и последующей детализации.  
> **UI/Tech Stack Update**: Для реализации UI использовать библиотеку shadcn-ui как основу, интегрируя как можно больше компонентов из Aceternity UI (https://ui.aceternity.com/components) для достижения темной темы с неоновыми эффектами, анимациями и визуальными улучшениями. Глобальная тема: темная (dark mode) с неоновыми градиентами, contour (контурными) эффектами на кнопках, инпутах и модалках. Конкретно:  
> - **Навигация**: Floating Dock из Aceternity для основного меню приложения (sidebar или bottom dock для мобильных).  
> - **Гриды и layouts**: Bento Grid из Aceternity для дашбордов, списков и матриц (e.g., Hypothesis Matrix).  
> - **Формы и элементы**: Анимированные инпуты (Animated Input), кнопки с неоновыми эффектами (Neon Button, Glowing Button), анимированные модалки (Animated Modal) для всех диалогов C/U/D.  
> - **Другие компоненты**: Card Hover Effects для карточек, Neon Gradient Card для KPI, Animated Tooltip для подсказок, Particle Background или Neon Effects для фонов в темной теме. Анимировать все модалки, кнопки и формы с Framer Motion для плавных переходов. Пройтись по всем разделам и применить эти компоненты где релевантно (указано в Views).

---

## 0. Навигация по документу

* [1. Обзор и цели продукта](#1-обзор-и-цели-продукта)
* [2. Персоны, роли, права (RBAC)](#2-персоны-роли-права-rbac)
* [3. Информационная архитектура и навигационная модель](#3-информационная-архитектура-и-навигационная-модель)
* [4. Глобальные элементы UI/UX](#4-глобальные-элементы-uiux)
* [5. Модули и сервисы (спецификации по разделам)](#5-модули-и-сервисы-спецификации-по-разделам)

  * [5.1 Onboarding Service](#51-onboarding-service)
  * [5.2 Readiness Service](#52-readiness-service)
  * [5.3 Hypothesis Service](#53-hypothesis-service)
  * [5.4 Experiment Service](#54-experiment-service)
  * [5.5 Value Case Service](#55-value-case-service)
  * [5.6 ROI Calculator Service](#56-roi-calculator-service)
  * [5.7 IAM Service](#57-iam-service)
  * [5.8 Governance Service](#58-governance-service)
  * [5.9 Resource Service (GPU & Compute)](#59-resource-service-gpu--compute)
  * [5.10 Laboratory Service](#510-laboratory-service)
  * [5.11 Dashboard Service](#511-dashboard-service)
  * [5.12 Notification Service](#512-notification-service)
  * [5.13 File Storage Service](#513-file-storage-service)
  * [5.14 Voice Service](#514-voice-service)
  * [5.15 Admin/Marketplace Service](#515-adminmarketplace-service)
  * [5.16 Analytics Service](#516-analytics-service)
  * [5.17 Workflow Orchestration Service](#517-workflow-orchestration-service)
* [6. Поисковые сценарии и фильтры (все разделы)](#6-поисковые-сценарии-и-фильтры-все-разделы)
* [7. Сценарии C/U/D и состояния (empty/loading/error/edge)](#7-сценарии-cud-и-состояния-emptyloadingerroredge)
* [8. События, очереди, нотификации, вебхуки](#8-события-очереди-нотификации-вебхуки)
* [9. Импорт/экспорт, версии, аудиты](#9-импорtexport-версии-аудиты)
* [10. Нефункциональные требования](#10-нефункциональные-требования)
* [11. Приложения: схемы данных и API](#11-приложения-схемы-данных-и-api)

> Примечание: для каждого сервиса в п.5 соблюдается единый формат: **Domain / Views / Диалоги C/U/D / Валидаторы / Фильтры / API / События / Роли / Нотификации / Права / Показатели / Ошибки**. UI-компоненты указаны в Views с интеграцией shadcn-ui + Aceternity.

---

## 1. Обзор и цели продукта

**Миссия**: безопасный и быстрый способ запустить корпоративную ИИ‑программу «по‑взрослому»: методология + SaaS + инфраструктура + команда внедрения.  
**Ключевая ценность**: Start→Scale за 90 дней; контроль метрик и ROI; управление портфелем гипотез; соблюдение ИБ; land→expand→embed.  

**Жизненный цикл (AI Experiment Lifecycle)**: *Ideation → Scoping → Prioritization → Experimentation → Evaluation → Scaling → Governance.*  

**Целевые KPI**: Time‑to‑First‑Value ≤ 6–8 недель; Cost‑per‑Experiment −20..−40%; Adoption ≥ 3 департамента к волне 2; Repeatability ≥ 70%; Portfolio ROI > 0.

### 1.1 Фокус текущего релиза

* **Hypothesis Core** — единственный активный поток разработки; все данные, UX и аналитика строятся вокруг жизненного цикла гипотез.
* **Onboarding / Readiness / Voice** — backlog следующей волны; фиксируем исследования и требования, но не начинаем реализацию, пока Hypothesis Core не стабилен.
* **Workflow Suite** — добавляем визуальную оркестрацию гипотез через BPMN-подобные процессы, синхронизацию гейтов и автоматизацию задач.

---

## 2. Персоны, роли, права (RBAC)

### 2.1 Персоны

* **Executive Sponsor / Champion** — топ‑менеджер, владелец эффекта.
* **AI Lab Lead / Curator / PM** — руководитель лаборатории.
* **Data Scientist / ML Engineer** — исполнитель экспериментов.
* **Data Engineer** — интеграция и подготовка данных.
* **Business Analyst / SME** — формулировка гипотез, оценка влияния.
* **IT/Ops / DevOps** — инфраструктура, деплой, мониторинг.
* **Governance Committee** — апрув гейтов и политики.
* **Integrator (K2Tech) Squad** — методология, менторство, запуск.

### 2.2 Роли и права (пример)

* **ADMIN**: полный доступ в пределах тенанта/лаборатории.
* **AI_CURATOR**: управляет гипотезами, приоритизацией, апелляциями, портфелем.
* **DS / MLE**: создаёт/ведёт эксперименты, ресурсы, артефакты.
* **DE**: коннекторы, пайплайны, датасеты.
* **BUSINESS_USER**: создаёт идеи, ROI-калькуляции, читает отчёты.
* **IT_ADMIN**: ресурсы, интеграции, мониторинг.
* **VIEWER / AUDITOR**: только чтение + экспорт.

> **Права на уровне объектов**: Hypothesis (CRUD, stage-transition, comments, attachments), Experiment (CRUD, run/stop, metrics/logs/artifacts), Resources (reserve/queue/release), ValueCases/ROI (read/calc/export), Users/Roles (IAM), Notifications (read/config), Files (upload/version/delete), Governance (approvals), Admin (dictionaries/workflows/branding/integrations).

---

## 3. Информационная архитектура и навигационная модель

### 3.1 Основные разделы (top‑level)

* **Dashboard** (CEO / Portfolio / Team / Resources)
* **Hypotheses** (Ideation / Scoping / Prioritization / Board / Matrix)
* **Experiments** (Kanban / Runs / Metrics / Logs / Artifacts)
* **Data & Assets** (Datasets / Models / Pipelines)
* **Compute** (GPU Scheduler / Queue / Reservations / Nodes)
* **Governance** (Wiki / Policies / Approvals / Risk Register)
* **Marketplace** (Modules / Connectors / Install)
* **Value & ROI** (Value Cases / ROI Calculator / History)
* **People & Access** (Users / Roles / Labs)
* **Admin** (Dictionaries / Workflows / Integrations / Branding / Settings)
* **Notifications**

### 3.2 Маршруты и хлебные крошки

* `/dashboard` → подстраницы `/dashboard/ceo`, `/dashboard/portfolio`, `/dashboard/resources`
* `/hypotheses` → `/hypotheses/:hypId` → вкладки *Overview / Data / Experiments / Discussion / Activity / Files*
* `/experiments` → `/experiments/:expId` → вкладки *Metrics / Logs / Artifacts / Config / Run*
* `/data` → *datasets*, *models*, *pipelines*
* `/compute` → *queue*, *reservations*, *nodes*
* `/governance` → *wiki*, *approvals*, *risks*
* `/marketplace` → *modules*, *connectors*
* `/value` → *cases*, *roi*, *history*
* `/people` → *users*, *roles*, *labs*
* `/admin` → *dictionaries*, *workflows*, *integrations*, *branding*, *settings*

> **UI Update**: Основная навигация реализована как Floating Dock из Aceternity UI с неоновыми иконками и анимациями hover. Хлебные крошки с shadcn-ui Breadcrumbs и неоновыми контурами.

---

## 4. Глобальные элементы UI/UX

* **Header**: глобальный поиск (shadcn-ui Input с неоновыми эффектами из Aceternity), быстрые действия ("+") с Animate Button, иконка уведомлений (Animated Badge), профиль (shadcn-ui Dropdown с Neon Gradient).
* **Sidebar**: контекстная навигация по разделу (Floating Dock из Aceternity), состояния свернуть/закрепить, с неоновыми анимациями на hover.
* **Command Palette** (⌘K): переходы, создание объектов, поиск команд (shadcn-ui Command с анимированными списками из Aceternity).
* **Empty states**: CTA + подсказки + быстрый импорт/шаблоны (Animated Empty State с Bento Grid для предложений).
* **Bulk actions**: чекбоксы списков, операции (assign, transition, export, tag) с shadcn-ui Checkbox и Neon Buttons.
* **i18n**: RU/EN; время/валюта/форматы дат — настройка на уровне профиля/тенанта.
* **A11y**: контраст, клавиатурная навигация, ARIA‑лейблы.
* **Global Theme**: Темная тема с неоновыми градиентами (Neon Gradient Card, Particle Background из Aceternity). Все модалки — анимированные (Animated Modal), кнопки с contour эффектами, формы инпутов анимированные (Animated Input с неоном).

---

## 5. Модули и сервисы (спецификации по разделам)

> Формат для каждого подпункта: **Domain** → **Views** → **Диалоги** (Create/Update/Delete/Transition) → **Валидаторы** → **Фильтры/Поиск** → **API** → **События** → **Нотификации** → **Роли/Права** → **Ошибки/Edge** → **Метрики модуля**. В Views добавлены рекомендации по shadcn-ui + Aceternity компонентам.

### 5.1 Onboarding Service

**Статус**: backlog (Wave 2). Реализация откладывается до стабилизации Hypothesis Core.

**Domain**: голосовой/текстовый онбординг топ‑менеджера; сбор контекста; генерация *Roadmap*/*Checklist*; старт лаборатории.

**Views** (с UI: shadcn-ui для базовых, Aceternity для анимаций и неона)

1. **Welcome & Consent**: выбор языка, политика, согласие на запись голоса (Bento Grid для карточек, Animated Input для чекбоксов).
2. **Voice Interview**: крупная кнопка микрофона (Neon Button с анимацией); live‑транскрипт; этапный прогресс (shadcn-ui Progress с неоновым градиентом).
3. **Extracted Summary**: роль, цели, барьеры, текущее состояние (editable) (Animated List для редактирования).
4. **Generated Roadmap (Gantt‑like)**: этапы 1–6, задачи с зависимостями, бюджет (Bento Grid + Gantt с анимациями hover).
5. **Readiness Checklist**: категории (Команда/Данные/Инфра/Методология/Бюджет), прогресс, due‑dates (Acceternity Checklist с неоновыми чекбоксами).
6. **Finalize**: кнопка *Complete Onboarding* → создание лаборатории, первичных гипотез, уведомления (Animated Button с контурным эффектом).
7. **Export**: PDF/Markdown; поделиться ссылкой; запланировать ревизию (shadcn-ui Button с Neon Gradient).

**Диалоги** (все в Animated Modal из Aceternity с неоновыми формами)

* *Start Session* (Create): подтверждение языка/режима (demo/standard), старт таймера.
* *Voice Input* (Update): запись, STT, NLU, извлечение сущностей → обновление `extracted_data`.
* *Generate Roadmap* (Create): параметры горизонта (3/6/12 мес), сохранение как `roadmap_data`.
* *Generate Checklist* (Create): авто‑чеклист с приоритетами, датами.
* *Voice Edit* (Update): NLU‑команды (ADD_CHECKLIST_ITEM, UPDATE_BUDGET, ...).
* *Complete* (Transition): завершение сессии, создание Lab + базовых гипотез, событие `OnboardingCompleted`.
* *Delete Session* (Delete): soft delete с подтверждением и причиной.

**Валидаторы**: обязательный язык; длина аудио ≤ N минут; лимит попыток; валидация дат при checklist; уникальность задач в roadmap.

**Фильтры/Поиск (для админов)**: статус, язык, индустрия, дата, режим, readiness score, сортировки (shadcn-ui DataTable с Bento Grid).

**API (основное)**

* `POST /onboarding/sessions { user_id, language, mode }`
* `POST /onboarding/sessions/{id}/voice-input { audio_base64, audio_format }`
* `POST /onboarding/sessions/{id}/text-input { text }`
* `POST /onboarding/sessions/{id}/generate-roadmap { time_horizon_months }`
* `POST /onboarding/sessions/{id}/generate-checklist`
* `POST /onboarding/sessions/{id}/voice-edit`
* `POST /onboarding/sessions/{id}/complete`
* `GET /onboarding/sessions/{id}/export-pdf`

**События**: `OnboardingSessionCreated`, `OnboardingVoiceProcessed`, `RoadmapGenerated`, `ChecklistGenerated`, `OnboardingCompleted`.

**Нотификации**: «Сессия завершена», «Создана лаборатория», «Добавлены гипотезы».

**Роли/Права**: USER (свой онбординг); ADMIN (все); CURATOR (read облачный PDF для презентации).

**Ошибки/Edge**: плохое аудио → повтор; таймаут LLM; конфликт редактирования → last‑write‑wins с журналом.

**Метрики**: avg processing time; % завершённых сессий; средний readiness score; NPS онбординга.

---

### 5.2 Readiness Service

**Статус**: backlog (Wave 2). Реализация откладывается до стабилизации Hypothesis Core.

**Domain**: AI Readiness Assessment; расчёт Overall & Category Scores; план действий на 3 мес.

**Views** (с UI: Aceternity для анимированных чартов и неона)

1. **Wizard 6 категорий**: бизнес‑стратегия, люди/скиллы, данные, инфраструктура, процессы, культура (Animated Steps с неоновыми прогресс-барами).
2. **Progress Panel**: #вопросов, overall score, maturity level (Neon Gradient Card).
3. **Results**: radar‑chart (Animated Chart из Aceternity), топ сильных/слабых, рекомендации (Bento Grid).
4. **Action Plan** (3‑месячный): помесячно, задачи, impact, приоритет (Timeline с анимациями).
5. **Export**: PDF, отправить в Hypothesis/Dashboard (Neon Button).

**Диалоги** (Animated Modal с анимированными формами)

* *Create Assessment*; *Answer Question*; *Recalculate Score*; *Generate Action Plan*; *Complete Assessment*; *Delete*.

**Валидаторы**: веса вопросов, типы ответов, вычисление категор. максимумов, консистентность процентов.

**Фильтры/Поиск**: по пользователю/лабе, статусам, уровням зрелости (shadcn-ui Select с неоном).

**API**: `POST /readiness/assessments`; `GET /readiness/questions`; `POST /readiness/assessments/{id}/answers`; `POST /readiness/assessments/{id}/calculate-score`; `POST /readiness/assessments/{id}/generate-action-plan`; `GET /.../export-pdf`.

**События**: `AssessmentCreated`, `AssessmentCompleted`.

**Нотификации**: «Action Plan готов», «Результаты отправлены в CEO Dashboard».

**Роли/Права**: USER (своё), CURATOR (все), ADMIN (все).

**Ошибки/Edge**: частично отвеченные; изменение вопросов админом после старта → версионирование вопросников.

**Метрики**: средний overall score; распределение по maturity; конверсия в action plan; влияние плана на KPI через 3 мес.

---

### 5.3 Hypothesis Service

**Domain**: управление гипотезами/кейсам, стадии, связи, комментарии, вложения, критические поля для гейтов.

**Views** (с UI: Bento Grid для матрицы, Card Hover для карточек)

1. **Hypotheses List / Kanban**: колонки стадий; карточки с priority/owner/tags/ROI; группировки (swimlanes: по приоритету/департаменту) (Kanban Board с анимациями drag).
2. **Matrix (Impact × Feasibility)**: интерактивная карта; drag для изменения оценок (Bento Grid + Aceternity Matrix с неоном).
3. **Create Hypothesis (Modal/Page)**: тип AI (LLM/ML/CV/NLP/RPA), шаблон подтипа (Chatbot/RAG/etc), обязательные поля, автогенерация из Value Case/ROI (Animated Form с неоновыми инпутами).
4. **Hypothesis Detail**: вкладки *Overview* (statement, goals, data sources, owners), *Data & ROI*, *Experiments* (связанные), *Discussion* (комменты с @упоминаниями), *Activity Log*, *Files* (Tabs с анимациями).
5. **Transition Dialog**: проверка readiness; список незаполненных полей; запрос approvals (Animated Modal).
6. **Bulk Edit**: массовая смена тегов/приоритета/owner (shadcn-ui Table с чекбоксами).

**Диалоги (C/U/D/Транзишены)** (все в Animated Modal с неоновыми эффектами)

* *Create*: вручную/из ROI; автогенерировать `hyp_id`.
* *Update*: частичные изменения; version++.
* *Delete*: soft delete; restore.
* *Transition*: IDEATION→SCOPING→PRIORITIZATION→EXPERIMENTATION→EVALUATION→SCALING→PRODUCTION; backward по правилам; approvals (single/all/majority), readiness‑check.
* *Comment/Resolve*: треды, реакции, упоминания, резолюции.
* *Attachments*: загрузка/версии/превью.

**Валидаторы**: обязательные поля на каждой стадии; корректность финансов (ROI%/payback≥0); дата запуска ≥ сегодня; уникальность названия в рамках Lab.

**Фильтры/Поиск**: по стадии/приоритету/типу AI/владельцу/департаменту/ROI/дате/тегам; фулл‑текст (shadcn-ui Combobox с неоном).

**API**: `POST /hypotheses`; `GET /hypotheses?filters...`; `GET /hypotheses/{id}`; `PATCH /hypotheses/{id}`; `DELETE /hypotheses/{id}`; `POST /hypotheses/{id}/transition`; `POST /hypotheses/{id}/comments`; `GET /.../comments`; `POST /hypotheses/{id}/attachments`; `GET /.../activity-log`.

**События**: `HypothesisCreated`, `HypothesisUpdated`, `HypothesisStageChanged`, `HypothesisApproved/Rejected`, `HypothesisDeleted`.

**Нотификации**: владельцу, reviewers, observers; «ожидает апрува», «переведена в стадию X», «комментарий от Y».

**Роли/Права**: OWNER/TECH_LEAD/REVIEWER/OBSERVER; ADMIN/CURATOR – полный.

**Ошибки/Edge**: провал readiness → список ошибок; конфликт редактирования; зависимость от другой гипотезы (graph) не закрыта.

**Метрики**: конверсия между стадиями; среднее время в стадии; топ‑ROI гипотез; портфель по приоритетам.

---

### 5.4 Experiment Service

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

### 5.5 Value Case Service

**Domain**: каталог value‑кейсов (отраслевые), метрики, ROI‑шаблоны, связь с Hypothesis.

**Views** (с UI: Bento Grid для каталога, Card Hover Effects для деталей)

1. **Cases Catalog**: карточки со сводкой (ROI, payback, maturity), фильтры по индустрии/типу AI (Bento Grid с неоновыми карточками).
2. **Case Detail**: описание, результаты, метрики, «Посчитать ROI», «Создать гипотезу» (Neon Gradient Card с анимированными кнопками).
3. **Matrix View (Impact vs Complexity)**: расстановка кейсов для ориентира (Aceternity Matrix с drag и неоном).

**Диалоги** (Animated Modal с неоновыми формами)

* *Create/Update/Delete Case* (контент‑менеджеры), *Add Metrics*, *Attach ROI Template*.

**Валидаторы**: уникальность slug; корректность процента/валют; статус публикации.

**Фильтры/Поиск**: индустрия, тип ИИ, категория, ROI диапазон, теги; полнотекстовый (shadcn-ui Input с неоном).

**API**: `GET /value-cases`; `GET /value-cases/{slug}`; `POST /value-cases`; `PATCH /value-cases/{id}`; `DELETE /value-cases/{id}`; `GET /value-cases/matrix`.

**События**: `ValueCaseCreated/Updated/Viewed`.

**Нотификации**: редакторам при модерации.

**Роли/Права**: VIEW всем; EDIT — CONTENT_ADMIN.

**Ошибки/Edge**: кейс скрыт (draft); конфликт slug.

**Метрики**: просмотры, конверсия «ROI calc» → «Create Hypothesis».

---

### 5.6 ROI Calculator Service

**Domain**: расчёт ROI по шаблонам; история расчётов; экспорт в Hypothesis.

**Views** (с UI: Animated Form для калькулятора, Bento Grid для истории)

1. **ROI Form**: динамические поля (number, currency, slider); подсказки; live preview (Animated Input с неоновыми слайдерами).
2. **Results**: карточки (economy/year, total cost, ROI%, payback months), bar‑chart по годам (Animated Chart с градиентами).
3. **History**: список прошлых расчётов; статусы «экспортировано в гипотезу» (Bento Grid).

**Диалоги** (Animated Modal)

* *Calculate*; *Save*; *Export to Hypothesis*; *Delete Calculation*.

**Валидаторы**: формулы, типы полей, валюты, неотрицательные значения.

**Фильтры/Поиск**: по владельцу/кейсам/дате/ROI (shadcn-ui Filter с неоном).

**API**: `GET /roi-calculator/templates?value_case_id=`; `POST /roi-calculator/calculate`; `GET /roi-calculator/calculations/{id}`; `GET /roi-calculator/calculations?user_id=`; `POST /roi-calculator/export-to-hypothesis`.

**События**: `ROICalculationSaved`, `ROIExportedToHypothesis`.

**Нотификации**: «ROI сохранён», «Создана гипотеза из ROI».

**Роли/Права**: USER — свои; CURATOR/ADMIN — все.

**Ошибки/Edge**: деление на ноль; несогласованные валюты; потеря шаблона.

**Метрики**: средний ROI по сегментам; конверсия в гипотезы.

---

### 5.7 IAM Service

**Domain**: пользователи, роли, сессии, SSO, аудиты, предпочтения.

**Views** (с UI: shadcn-ui Table для пользователей, Bento Grid для ролей)

1. **Users**: таблица, фильтры (department, role, status), действия (reset, suspend, assign roles) (DataTable с hover анимациями).
2. **Roles/Permissions**: матрица прав; конструктор кастом‑ролей (Aceternity Matrix с неоном).
3. **Sessions**: активные токены, устройства, revoke (Animated List).
4. **Profile**: язык, часовой пояс, тема, нотификации, API‑keys (Animated Form с неоновыми инпутами).

**Диалоги** (Animated Modal)

* *Register*; *Verify Email*; *Login/Logout*; *Refresh Token*; *Forgot/Reset Password*; *Create User (Admin)*; *Assign/Remove Role*; *Suspend/Activate*.

**Валидаторы**: сложность пароля; уникальность email; блокировки после N попыток.

**Фильтры/Поиск**: по роли/статусу/дате/отделу (shadcn-ui Select).

**API**: `/auth/register|verify-email|login|refresh|logout|forgot-password|reset-password`; `/users (CRUD)`, `/roles (CRUD)`, `/permissions`.

**События**: `UserRegistered`, `UserLoggedIn`, `RoleAssigned`.

**Нотификации**: welcome email, security alerts.

**Роли/Права**: ADMIN, LAB_OWNER, etc.

**Ошибки/Edge**: brute‑force → lockout; SSO drift.

**Метрики**: MAU/WAU/DAU; входы по ролям; неудачные логины.

---

### 5.8 Governance Service

**Domain**: Wiki/Policies, Approvals, Risk Register, Knowledge base.

**Views** (с UI: Bento Grid для регистров, Animated Tree для wiki)

1. **Wiki**: древо документов; версии; diff; публикации (Tree View с анимациями).
2. **Approvals**: список заявок (stage transitions, production deploys); фильтры по роли/статусу (Bento Grid).
3. **Risk Register**: таблица рисков (категория, severity, owner, due); heatmap (Aceternity Heatmap с неоном).

**Диалоги** (Animated Modal)

* *Create/Edit Doc*; *Submit for Approval*; *Approve/Reject with comment*; *Create Risk*; *Mitigation Update*.

**Валидаторы**: обязательные поля; запрет удаления утверждённых; цифровые подписи (опционально).

**Фильтры/Поиск**: полнотекст по wiki; статус/категория по approvals/risks.

**API**: `/governance/wiki (CRUD)`; `/approvals (list/act)`; `/risks (CRUD)`.

**События**: `ApprovalRequested/Granted/Rejected`, `RiskCreated/Updated/Closed`.

**Нотификации**: апруверам/владельцам рисков.

**Роли/Права**: EDITOR/REVIEWER/APPROVER.

**Ошибки/Edge**: зависший апрув → эскалация; конфликт версий wiki.

**Метрики**: SLA approvals; #активных рисков; покрытие политиками.

---

### 5.9 Resource Service (GPU & Compute)

**Domain**: узлы ресурсов, очереди, резервации, использование, стоимость.

**Views** (с UI: Bento Grid для очередей, Animated Charts для утилизации)

1. **Queue**: запросы на ресурсы (requested type/count/duration, priority, ETA) (Animated List с неоном).
2. **Reservations**: активные/завершённые; продление; досрочный release (Bento Grid).
3. **Nodes**: список узлов (gpu type/count, utilization, temp, cost), stat cards (Neon Gradient Cards).
4. **Costs**: отчёты по gpu‑часам, стоимости, разбивки по пользователям/проектам (Animated Bar Chart).

**Диалоги** (Animated Modal)

* *Check Availability*; *Reserve*; *Extend*; *Release*; *Cancel*; *Queue Request*.

**Валидаторы**: лимиты квот; пересечение бронирований; стоимость ≈ duration× тариф.

**Фильтры/Поиск**: по типу GPU, статусу, пользователю, периоду.

**API**: `/resources/nodes`; `/resources/availability`; `/resources/reservations (CRUD)`; `/resources/queue`; `/resources/usage-metrics`; `/resources/costs/summary`.

**События**: `ResourceReserved/Released/Expired`, `QueueAdded/Promoted`.

**Нотификации**: «ресурсы доступны», «очередь продвинута», «резервация истекает».

**Роли/Права**: DS/MLE — запрос своих; IT_ADMIN — всё.

**Ошибки/Edge**: недоступность узлов; перегрев; внезапный down‑node.

**Метрики**: утилизация; среднее ожидание; экономия от досрочных релизов.

---

### 5.10 Laboratory Service

**Domain**: лаборатории (рабпространства), членство, приглашения, видимость.

**Views** (с UI: Bento Grid для списка labs, Card Hover для деталей)

1. **Labs List**: карточки (описание, owner, counts, статус, visibility) (Bento Grid с неоном).
2. **Lab Detail**: *Overview*, *Members* (roles), *Settings*, *Stats* (Tabs с анимациями).
3. **Invitations**: отправка, статусы, повтор (Animated List).

**Диалоги** (Animated Modal)

* *Create Lab*; *Invite Member*; *Change Role*; *Remove Member*; *Archive Lab*.

**Валидаторы**: уникальность slug; валидность email; роль только из списка.

**Фильтры/Поиск**: по отделу/статусу/видимости/моей роли.

**API**: `/laboratories (CRUD)`; `/laboratories/{id}/members (CRUD)`; `/invitations (create/accept)`.

**События**: `LaboratoryCreated`, `InvitationSent/Accepted`.

**Нотификации**: приглашённому; owner при принятии.

**Роли/Права**: OWNER/ADMIN/MEMBER/VIEWER.

**Ошибки/Edge**: истёк токен приглашения; конфликт видимости.

**Метрики**: #labs; средний размер; активность участников.

---

### 5.11 Dashboard Service

**Domain**: KPI‑панели для разных аудиторий; виджеты; кэш.

**Views** (с UI: Bento Grid для виджетов, Neon Gradient Cards для KPI)

1. **CEO Dashboard**: KPI‑карточки (active hypotheses, in experimentation, in production, success rate, avg time‑to‑prod, total investment YTD, realized ROI YTD, critical risks), воронка стадий, action required, time‑to‑market по стадиям, ROI scatter/matrix, risks heatmap, team performance (Bento Grid + Animated Charts).
2. **Portfolio Dashboard**: агрегированные портфельные метрики, распределения по департаментам/типам AI, карта проектов (Matrix с неоном).
3. **Team Dashboard**: эффективность команд, прогресс по задачам, загрузка GPU (Timeline с анимациями).
4. **Resources Dashboard**: утилизация узлов, очереди, прогноз потребностей (Heatmap + Bar Charts).

**Диалоги** (Animated Modal)

* *Configure Widgets* (метрика, период, фильтры, размер); *Set Targets/SLA*; *Export PDF*.

**Валидаторы**: допустимые агрегаты/диапазоны; права на источники.

**Фильтры/Поиск**: по лаборатории/департаменту/периоду/типу AI.

**API**: `/dashboards/ceo`; `/dashboards/portfolio`; `/dashboards/team`; `/dashboards/resources`; `/dashboards/set-targets`.

**События**: `DashboardViewed`, `TargetsUpdated`.

**Нотификации**: дайджесты (еженедельно/ежемесячно) владельцам.

**Роли/Права**: CEO/ADMIN/CURATOR — полный; остальные по видимости.

**Ошибки/Edge**: пустые данные → placeholder; истёк кэш → lazy rebuild.

**Метрики**: частота просмотров; TTFB; % виджетов в кэше.

---

### 5.12 Notification Service

**Domain**: генерация/доставка уведомлений: In‑App, Email, Slack, Push; предпочтения; дайджесты.

**Views** (с UI: Animated List для инбокса, Bento Grid для предпочтений)

1. **Inbox**: вкладки (All/Unread/Starred/Archived), фильтры по типу события/объекту/приоритету (Tabs + Animated List с неоном).
2. **Notification Detail**: текст, привязка к объекту, статусы по каналам (Neon Card).
3. **Preferences**: event×channel матрица; quiet hours; email digest time (Matrix с анимациями).

**Диалоги** (Animated Modal)

* *Mark read/star/archive*; *Mark all read*; *Bulk archive*; *Save Preferences*.

**Валидаторы**: формат времени; ограничения quiet hours.

**Фильтры/Поиск**: как в Inbox; полнотекст по тексту уведомления.

**API**: `/notifications (list/update)`; `/notifications/mark-all-read`; `/notifications/preferences (get/patch)`; `/notifications/unread-count`.

**События**: консьюмит Kafka: `Hypothesis*`, `Experiment*`, `Resource*`, `Approval*` и т.д.

**Нотификации**: по предпочтениям пользователей.

**Роли/Права**: любой авторизованный пользователь для своих уведомлений; ADMIN видит системные метрики доставки.

**Ошибки/Edge**: сбой канала → retry/backoff; лимит писем → деградация в digest.

**Метрики**: delivery rate; open rate; avg time‑to‑notify.

---

### 5.13 File Storage Service

**Domain**: загрузка, версия, доступ, превью, подписанные ссылки, вирус‑скан.

**Views** (с UI: Bento Grid для списка, Animated Modal для истории)

1. **Attachments List** (внутри Hypothesis/Experiment): миниатюры/иконки, версия, uploader, дата (Bento Grid с hover эффектами).
2. **Version History Modal**: сравнение версий, restore (Animated List).
3. **Batch Upload**: dnd‑зона, прогресс, итоги (Drag & Drop с неоновыми индикаторами).

**Диалоги** (Animated Modal)

* *Upload*; *Upload Version*; *Delete/Restore*; *Download (signed URL)*.

**Валидаторы**: типы файлов (whitelist), размер, скан антивирусом.

**Фильтры/Поиск**: по владельцу/типу/объекту/дате.

**API**: `/files/upload`; `/files/{id}`; `/files/{id}/download`; `/files/{id}/upload-version`; `/files/{id}/versions`; `/files` (list).

**События**: `FileUploaded/Deleted`.

**Нотификации**: владельцу объекта при новых вложениях.

**Роли/Права**: доступ по видимости объекта; PRIVATE/INTERNAL/PUBLIC.

**Ошибки/Edge**: истёк токен загрузки; неудачный вирус‑скан.

**Метрики**: объём хранилища; топ‑типы файлов; время генерации preview.

---

### 5.14 Voice Service

**Статус**: backlog (Wave 2). Реализация откладывается до стабилизации Hypothesis Core.

**Domain**: STT/TTS, NLU; voice‑команды; стриминг транскрипции.

**Views** (с UI: Floating Modal для записи, Animated List для истории)

1. **Voice Modal** (floating): запись, волны, partial/final transcript, команды (Aceternity Floating Dock с неоновыми кнопками).
2. **Requests History**: список, транскрипты, intent, статус исполнения (Bento Grid).

**Диалоги** (Animated Modal)

* *Transcribe (file/stream)*; *Process Command*; *Synthesize*.

**Валидаторы**: форматы аудио; max длительность; языки.

**Фильтры/Поиск**: по контексту (onboarding/hypothesis), дате, статусу.

**API**: `/voice/transcribe`; `/voice/transcribe-stream`; `/voice/process-command`; `/voice/synthesize`; `/voice/requests`.

**События**: `VoiceTranscribed`, `CommandExecuted`.

**Нотификации**: «команда выполнена» (success/error).

**Роли/Права**: любой пользователь в своей области.

**Ошибки/Edge**: низкое качество; неверный intent; безопасные слова.

**Метрики**: WER; avg processing; adoption голоса.

---

### 5.15 Admin/Marketplace Service

**Domain**: системные настройки, словари, workflows, интеграции, брендирование, каталог модулей.

**Views** (с UI: Bento Grid для marketplace, Animated Editor для workflows)

1. **Dictionaries**: индустрии, департаменты, валюты, типы AI, бизнес‑категории; drag‑n‑drop order; bulk import/export CSV (Drag & Drop List с неоном).
2. **Workflows**: визуальный редактор стадий (порядок, required fields, approvals, SLA/targets) (Aceternity Workflow Builder).
3. **Integrations**: SendGrid/SES, Slack, LDAP/AD/SSO, SIEM, GitLab/Jenkins, MLflow (Bento Grid с статусами).
4. **Branding**: лого, цвета, favicon, email‑хедер (Animated Form).
5. **Marketplace**: список модулей/коннекторов; install/enable; статусы (Bento Grid с hover эффектами).

**Диалоги** (Animated Modal)

* *Add/Edit Dictionary Item*; *Bulk Import*; *Update Setting*; *Test Connection*; *Install Module*; *Reorder Stages*.

**Валидаторы**: уникальность кодов; правила min/max; скрытие sensitive.

**Фильтры/Поиск**: по типам словарей; статусам интеграций; категориям модулей.

**API**: `/admin/dictionaries`; `/admin/settings`; `/admin/workflows`; `/admin/branding`; `/marketplace/modules`.

**События**: `SettingsUpdated`, `WorkflowChanged`, `ModuleInstalled`.

**Нотификации**: предупреждения об опасных изменениях (2FA, prod‑keys).

**Роли/Права**: только ADMIN/OWNER.

**Ошибки/Edge**: удаление используемого словаря → reassign/soft‑delete; падение интеграции.

**Метрики**: покрытие справочниками; статусы интеграций; uptake модулей.

---

### 5.16 Analytics Service

**Domain**: события (eventing), метрики времени, инсайты, предсказания, отчёты.

**Views** (с UI: Animated Charts для time-series, Bento Grid для insights)

1. **Time‑Series**: выбор метрик (total_hypotheses, success_rate), гранулярность (DAY/WEEK/MONTH), фильтры (Line Chart с неоновыми градиентами).
2. **Insights**: bottlenecks по стадиям (avg time vs target), корневые причины, рекомендации (Neon Cards).
3. **Predictions**: вероятность успеха гипотезы (feature set), похожие кейсы (Animated Probability Bar).
4. **Reports**: Executive Summary за период (JSON/PDF) (Bento Grid).

**Диалоги** (Animated Modal)

* *Define Metric*; *Export Report*; *Drill‑down*.

**Валидаторы**: корректные диапазоны дат; доступ к источникам.

**Фильтры/Поиск**: по лабе/департаменту/периоду.

**API**: `/analytics/events (ingest)`; `/metrics/time-series`; `/insights/bottlenecks`; `/predictions/success-probability`; `/reports/executive-summary`.

**События**: аггрегируются из всех сервисов.

**Нотификации**: «обнаружен bottleneck», «новый отчёт доступен».

**Роли/Права**: ADMIN/CURATOR/CEO.

**Ошибки/Edge**: пропуски событий; outliers.

**Метрики**: задержка агрегаций; SLA отчётов.

---

### 5.17 Workflow Orchestration Service

**Статус**: активный. Гибкое управление процессами Hypothesis через BPMN-подобные схемы и автоматизацию переходов между стадиями.

**Domain**: визуальное моделирование и исполнение рабочих процессов, связывающих Hypothesis, approvals, эксперименты и уведомления; хранение версий workflow, SLA по задачам, аудит изменений.

**Views**

1. **Workflow Designer**: drag-and-drop BPMN-палитра (start/end, user task, service task, gateway, timer); библиотека шаблонов (идея→гейтинг); превью состояний Hypothesis.
2. **Workflow Instance Board**: список активных процессов, статус задач, ответственные, ожидаемые approvals (Kanban + timeline).
3. **Task Console**: персональный inbox задач (approve, provide data, review metrics) с контекстом Hypothesis и достижимостью KPI.
4. **Workflow Analytics**: тепловая карта узких мест, SLA, автоматически предлагаемые оптимизации.

**Диалоги**

* *Create Workflow Template*: выбор базового шаблона, настройка узлов, версияция.
* *Publish Workflow*: проверка валидаций, назначение ролей, привязка к типам гипотез.
* *Trigger Workflow*: запуск для Hypothesis, выбор варианта гейтов.
* *Modify Live Workflow*: безопасные изменения с миграцией активных инстансов.

**Валидаторы**: корректность BPMN-графа (единый start/end, отсутствие циклов без гейтов), назначенные роли на user task, доступность интеграций для service task.

**Фильтры/Поиск**: по статусам (draft/published/live), владельцам, связанным гипотезам, SLA.

**API**: `POST /workflow/templates`, `POST /workflow/templates/{id}/publish`, `POST /workflow/instances`, `PATCH /workflow/instances/{id}`, `GET /workflow/instances?hypothesis_id=`, `POST /workflow/tasks/{id}/complete`.

**События**: `WorkflowTemplatePublished`, `WorkflowInstanceStarted`, `WorkflowTaskCompleted`, `WorkflowSLAThreat`, `WorkflowOptimisationSuggested`.

**Нотификации**: push/email/slack при назначении задач, предупреждения об SLA, рекомендации оптимизации.

**Роли/Права**: WORKFLOW_ADMIN (CRUD шаблонов), CURATOR (запуск/мониторинг), PARTICIPANT (выполнение задач), VIEWER (read-only).

**Ошибки/Edge**: зависшие задачи без исполнителя, миграция активных процессов; откат версии workflow.

**Метрики**: среднее время прохождения гипотезы через workflow, SLA по задачам, коэффициент автоматизации (количество service task vs user task).


---

## 6. Поисковые сценарии и фильтры (все разделы)

* Единый **Global Search**: объекты Hypothesis/Experiment/Data/Users/Docs; префиксные операторы (`type:hyp id:HYP-`); fuzzy; недавние (shadcn-ui Command с Aceternity анимациями и неоновыми подсветками).
* Списки: серверные фильтры + пагинация; сохранённые фильтры; расшаривание ссылкой (Bento Grid для результатов).
* Фулл‑текст: для описаний/комментариев/вики с подсветкой (Animated Highlight).

---

## 7. Сценарии C/U/D и состояния (empty/loading/error/edge)

* **Create**: модальные/отдельные страницы; автозаполнение из шаблонов; предпросмотр; валидация; оптимистичные обновления (Animated Modal из Aceternity).
* **Update**: частичные PATCH; контроль версий; блокировка конкурентных правок (warning + merge‑hint); audit trail.
* **Delete**: soft‑delete везде; корзина (30 дней); каскад для вложений/связей.
* **Empty**: CTA + импорт/шаблон; «создайте первую гипотезу/прикрепите файл» (Animated Empty State с неоном).
* **Loading**: skeletons; прогресс‑бары; lazy loading вкладок (shadcn-ui Skeleton с градиентами).
* **Error**: классы ошибок (network/validation/server/business); retry; contact admin (Neon Alert).
* **Edge**: длинные названия, большие списки (виртуализация), большие файлы (chunked upload), timezone shifts.

---

## 8. События, очереди, нотификации, вебхуки

* **Event Bus (Kafka)**: топики `hypothesis.*`, `experiment.*`, `resource.*`, `approval.*`, `file.*`, `analytics.events`.
* **Consumers**: Notification, Analytics, Dashboard, Governance (approvals), Resource (queue promotion).
* **Webhooks**: настраиваемые исходящие (Jira, Slack, Teams, Confluence, GitLab). Подпись, ретраи, dead‑letter.

---

## 9. Импорт/Export, версии, аудиты

* **Импорт**: CSV/XLSX для словарей, гипотез (bulk), датасетов (каталогизация) (Animated Upload Modal).
* **Экспорт**: PDF (отчёты), CSV (таблицы), Markdown (вики/спецификации), signed URLs (Neon Button для экспорта).
* **Версионирование**: Hypothesis/Docs/Files – история изменений; сравнение версий; restore (Animated Diff View).
* **Аудит**: user/action/resource/status/details/IP/UA/timestamp; экспорт для комплаенса (Bento Grid для логов).

---

## 10. Нефункциональные требования

* **Безопасность**: SSO (OAuth2/SAML), RBAC, JWT, TLS, Secrets, audit, data masking, сети (on‑prem/hybrid), антивирус.
* **Производительность**: p95 < 300 ms для типовых чтений; очереди GPU ETA < 5 мин при N<…; горизонтальное масштабирование.
* **Надёжность**: HA для критичных сервисов (DB реплики, stateless pods 2+), бэкапы/restore, SRP.
* **Наблюдаемость**: logs/traces/metrics; алерты по SLA; health‑checks.
* **Локализация**: RU/EN; форматы даты/валют; правописание.
* **Доступность**: AA WCAG; клавиатура; screen readers.
* **Совместимость**: браузеры LTS; мобильная адаптация основных экранов (Floating Dock для мобильных).

---

## 11. Приложения: схемы данных и API

### 11.1 Ключевые сущности (сокращённо)

* **Hypothesis**: id, hyp_id, lab_id, title, statement, description, ai_type/subtype, business_category, owners, priority, impact, complexity, data_sources/quality/volume, estimates (cost, time, roi, payback), success_metrics[], stage, tags[], links[], timestamps, version.
* **Experiment**: id, exp_id, hypothesis_id, name, variant, status, model/approach/framework, params, resources (gpu/cpu/ram), started/completed/duration, costs (gpu/api/total), artifacts (urls), git (repo/branch/commit), mlflow/wandb ids, version.
* **ResourceNode**: id, type (GPU/CPU), gpu_type/count/memory, cpu/ram, status, utilization/temp, location, hourly_cost, labels, health.
* **Reservation/Queue**: requested/allocated, priority, ETA, status, actuals, costs.
* **Notification**: id, user_id, event_type, title, message, related_object(type/id/url), channels/statuses, priority, timestamps.
* **ROI Template/Calculation**: value_case_id, input_fields[], formulas{}, results{}, currency, timestamps.
* … (подробные JSON‑схемы — в отдельном приложении при разработке БД).

### 11.2 REST API (сводка)

* Hypotheses: CRUD, transition, comments, attachments, activity, search.
* Experiments: CRUD, start, metrics (single/batch), logs, artifacts, complete/fail/stop, compare.
* Resources: nodes, availability, reservations CRUD, queue, usage‑metrics, costs.
* Value/ROI: cases CRUD, matrix, roi templates, calculate, export.
* IAM: auth/register/…/reset, users CRUD, roles CRUD, permissions list.
* Governance: wiki CRUD, approvals act, risks CRUD.
* Dashboards: /ceo, /portfolio, /team, /resources, set targets.
* Notifications: list/update, mark‑all, preferences, unread‑count.
* Files: upload, get, download (signed), upload‑version, versions, list.
* Voice: transcribe (file/stream), process‑command, synthesize, requests.
* Admin: dictionaries CRUD/import/export, settings, workflows, branding, marketplace modules.

---

### 11.3 Диаграммы последовательностей (описательно)

* **Hypothesis → Transition**: UI → readiness‑check → (optional) approvals → stage update → events → notifications.
* **Experiment → Start**: UI → availability → reservation → start run → stream logs/metrics → complete → release resources.
* **ROI → Hypothesis**: ROI form → calculate → save → export → create Hypothesis with mapped fields.
* **Approval flow**: requester → create approval request → notify approvers → decision (all/any/majority) → update transition.

---

## Завершение

Документ охватывает все представления, сценарии и интерфейсы системы. Следующий шаг — сквозные user‑flows в виде прототипов и детализация контрактов API/схем БД в Swagger/OpenAPI и миграциях. UI реализован на shadcn-ui с интеграцией Aceternity для темной темы с неоновыми эффектами, анимированными модалками, формами и меню (Floating Dock, Bento Grid и т.д.).