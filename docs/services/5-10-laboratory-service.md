# 5.10 Laboratory Service

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
