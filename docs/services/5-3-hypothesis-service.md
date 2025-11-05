# 5.3 Hypothesis Service

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
