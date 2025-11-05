# 5.17 Workflow Orchestration Service

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
