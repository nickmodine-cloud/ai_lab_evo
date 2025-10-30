# 5.3 Hypothesis Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: управление гипотезами/кейсам, стадии, связи, комментарии, вложения, критические поля для гейтов.

**Views**
1. **Hypotheses List / Kanban**: колонки стадий; карточки с priority/owner/tags/ROI; группировки (swimlanes: по приоритету/департаменту).
2. **Matrix (Impact × Feasibility)**: интерактивная карта; drag для изменения оценок.
3. **Create Hypothesis (Modal/Page)**: тип AI (LLM/ML/CV/NLP/RPA), шаблон подтипа (Chatbot/RAG/etc), обязательные поля, автогенерация из Value Case/ROI.
4. **Hypothesis Detail**: вкладки *Overview* (statement, goals, data sources, owners), *Data & ROI*, *Experiments* (связанные), *Discussion* (комменты с @упоминаниями), *Activity Log*, *Files*.
5. **Transition Dialog**: проверка readiness; список незаполненных полей; запрос approvals.
6. **Bulk Edit**: массовая смена тегов/приоритета/owner.

**Диалоги (C/U/D/Транзишены)**
- *Create*: вручную/из ROI; автогенерировать `hyp_id`.
- *Update*: частичные изменения; version++.
- *Delete*: soft delete; restore.
- *Transition*: IDEATION→SCOPING→PRIORITIZATION→EXPERIMENTATION→EVALUATION→SCALING→PRODUCTION; backward по правилам; approvals (single/all/majority), readiness‑check.
- *Comment/Resolve*: треды, реакции, упоминания, резолюции.
- *Attachments*: загрузка/версии/превью.

**Валидаторы**: обязательные поля на каждой стадии; корректность финансов (ROI%/payback≥0); дата запуска ≥ сегодня; уникальность названия в рамках Lab.

**Фильтры/Поиск**: по стадии/приоритету/типу AI/владельцу/департаменту/ROI/дате/тегам; фулл‑текст.

**API**: `POST /hypotheses`; `GET /hypotheses?filters...`; `GET /hypotheses/{id}`; `PATCH /hypotheses/{id}`; `DELETE /hypotheses/{id}`; `POST /hypotheses/{id}/transition`; `POST /hypotheses/{id}/comments`; `GET /.../comments`; `POST /hypotheses/{id}/attachments`; `GET /.../activity-log`.

**События**: `HypothesisCreated`, `HypothesisUpdated`, `HypothesisStageChanged`, `HypothesisApproved/Rejected`, `HypothesisDeleted`.

**Нотификации**: владельцу, reviewers, observers; «ожидает апрува», «переведена в стадию X», «комментарий от Y».

**Роли/Права**: OWNER/TECH_LEAD/REVIEWER/OBSERVER; ADMIN/CURATOR – полный.

**Ошибки/Edge**: провал readiness → список ошибок; конфликт редактирования; зависимость от другой гипотезы (graph) не закрыта.

**Метрики**: конверсия между стадиями; среднее время в стадии; топ‑ROI гипотез; портфель по приоритетам.

---
