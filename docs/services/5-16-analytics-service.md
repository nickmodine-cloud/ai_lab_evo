# 5.16 Analytics Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: события (eventing), метрики времени, инсайты, предсказания, отчёты.

**Views**
1. **Time‑Series**: выбор метрик (total_hypotheses, success_rate), гранулярность (DAY/WEEK/MONTH), фильтры.
2. **Insights**: bottlenecks по стадиям (avg time vs target), корневые причины, рекомендации.
3. **Predictions**: вероятность успеха гипотезы (feature set), похожие кейсы.
4. **Reports**: Executive Summary за период (JSON/PDF).

**Диалоги**: *Define Metric*; *Export Report*; *Drill‑down*.

**Валидаторы**: корректные диапазоны дат; доступ к источникам.

**Фильтры/Поиск**: по лабе/департаменту/периоду.

**API**: `/analytics/events (ingest)`; `/metrics/time-series`; `/insights/bottlenecks`; `/predictions/success-probability`; `/reports/executive-summary`.

**События**: аггрегируются из всех сервисов.

**Нотификации**: «обнаружен bottleneck», «новый отчёт доступен».

**Роли/Права**: ADMIN/CURATOR/CEO.

**Ошибки/Edge**: пропуски событий; outliers.

**Метрики**: задержка агрегаций; SLA отчётов.

---

## 6. Поисковые сценарии и фильтры (все разделы)

- Единый **Global Search**: объекты Hypothesis/Experiment/Data/Users/Docs; префиксные операторы (`type:hyp id:HYP-`); fuzzy; недавние.
- Списки: серверные фильтры + пагинация; сохранённые фильтры; расшаривание ссылкой.
- Фулл‑текст: для описаний/комментариев/вики с подсветкой.

---

## 7. Сценарии C/U/D и состояния (empty/loading/error/edge)

- **Create**: модальные/отдельные страницы; автозаполнение из шаблонов; предпросмотр; валидация; оптимистичные обновления.
- **Update**: частичные PATCH; контроль версий; блокировка конкурентных правок (warning + merge‑hint); audit trail.
- **Delete**: soft‑delete везде; корзина (30 дней); каскад для вложений/связей.
- **Empty**: CTA + импорт/шаблон; «создайте первую гипотезу/прикрепите файл».
- **Loading**: skeletons; прогресс‑бары; lazy loading вкладок.
- **Error**: классы ошибок (network/validation/server/business); retry; contact admin.
- **Edge**: длинные названия, большие списки (виртуализация), большие файлы (chunked upload), timezone shifts.

---

## 8. События, очереди, нотификации, вебхуки

- **Event Bus (Kafka)**: топики `hypothesis.*`, `experiment.*`, `resource.*`, `approval.*`, `file.*`, `analytics.events`.
- **Consumers**: Notification, Analytics, Dashboard, Governance (approvals), Resource (queue promotion).
- **Webhooks**: настраиваемые исходящие (Jira, Slack, Teams, Confluence, GitLab). Подпись, ретраи, dead‑letter.

---

## 9. Импорт/Export, версии, аудиты

- **Импорт**: CSV/XLSX для словарей, гипотез (bulk), датасетов (каталогизация).
- **Экспорт**: PDF (отчёты), CSV (таблицы), Markdown (вики/спецификации), signed URLs.
- **Версионирование**: Hypothesis/Docs/Files – история изменений; сравнение версий; restore.
- **Аудит**: user/action/resource/status/details/IP/UA/timestamp; экспорт для комплаенса.

---

## 10. Нефункциональные требования

- **Безопасность**: SSO (OAuth2/SAML), RBAC, JWT, TLS, Secrets, audit, data masking, сети (on‑prem/hybrid), антивирус.
- **Производительность**: p95 < 300 ms для типовых чтений; очереди GPU ETA < 5 мин при N<…; горизонтальное масштабирование.
- **Надёжность**: HA для критичных сервисов (DB реплики, stateless pods 2+), бэкапы/restore, SRP.
- **Наблюдаемость**: logs/traces/metrics; алерты по SLA; health‑checks.
- **Локализация**: RU/EN; форматы даты/валют; правописание.
- **Доступность**: AA WCAG; клавиатура; screen readers.
- **Совместимость**: браузеры LTS; мобильная адаптация основных экранов.

---

## 11. Приложения: схемы данных и API

### 11.1 Ключевые сущности (сокращённо)
- **Hypothesis**: id, hyp_id, lab_id, title, statement, description, ai_type/subtype, business_category, owners, priority, impact, complexity, data_sources/quality/volume, estimates (cost, time, roi, payback), success_metrics[], stage, tags[], links[], timestamps, version.
- **Experiment**: id, exp_id, hypothesis_id, name, variant, status, model/approach/framework, params, resources (gpu/cpu/ram), started/completed/duration, costs (gpu/api/total), artifacts (urls), git (repo/branch/commit), mlflow/wandb ids, version.
- **ResourceNode**: id, type (GPU/CPU), gpu_type/count/memory, cpu/ram, status, utilization/temp, location, hourly_cost, labels, health.
- **Reservation/Queue**: requested/allocated, priority, ETA, status, actuals, costs.
- **Notification**: id, user_id, event_type, title, message, related_object(type/id/url), channels/statuses, priority, timestamps.
- **ROI Template/Calculation**: value_case_id, input_fields[], formulas{}, results{}, currency, timestamps.
- … (подробные JSON‑схемы — в отдельном приложении при разработке БД).

### 11.2 REST API (сводка)
- Hypotheses: CRUD, transition, comments, attachments, activity, search.
- Experiments: CRUD, start, metrics (single/batch), logs, artifacts, complete/fail/stop, compare.
- Resources: nodes, availability, reservations CRUD, queue, usage‑metrics, costs.
- Value/ROI: cases CRUD, matrix, roi templates, calculate, export.
- IAM: auth/register/…/reset, users CRUD, roles CRUD, permissions list.
- Governance: wiki CRUD, approvals act, risks CRUD.
- Dashboards: /ceo, /portfolio, /team, /resources, set targets.
- Notifications: list/update, mark‑all, preferences, unread‑count.
- Files: upload, get, download (signed), upload‑version, versions, list.
- Voice: transcribe (file/stream), process‑command, synthesize, requests.
- Admin: dictionaries CRUD/import/export, settings, workflows, branding, marketplace modules.

---

### 11.3 Диаграммы последовательностей (описательно)
- **Hypothesis → Transition**: UI → readiness‑check → (optional) approvals → stage update → events → notifications.
- **Experiment → Start**: UI → availability → reservation → start run → stream logs/metrics → complete → release resources.
- **ROI → Hypothesis**: ROI form → calculate → save → export → create Hypothesis with mapped fields.
- **Approval flow**: requester → create approval request → notify approvers → decision (all/any/majority) → update transition.

---

## Завершение

Документ охватывает все представления, сценарии и интерфейсы системы. Следующий шаг — сквозные user‑flows в виде прототипов и детализация контрактов API/схем БД в Swagger/OpenAPI и миграциях.
