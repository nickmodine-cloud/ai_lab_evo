# 5.7 IAM Service

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
