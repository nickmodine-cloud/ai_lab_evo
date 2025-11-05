# 5.8 Governance Service

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
