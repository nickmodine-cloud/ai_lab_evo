# 5.7 IAM Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: пользователи, роли, сессии, SSO, аудиты, предпочтения.

**Views**
1. **Users**: таблица, фильтры (department, role, status), действия (reset, suspend, assign roles).
2. **Roles/Permissions**: матрица прав; конструктор кастом‑ролей.
3. **Sessions**: активные токены, устройства, revoke.
4. **Profile**: язык, часовой пояс, тема, нотификации, API‑keys.

**Диалоги**: *Register*; *Verify Email*; *Login/Logout*; *Refresh Token*; *Forgot/Reset Password*; *Create User (Admin)*; *Assign/Remove Role*; *Suspend/Activate*.

**Валидаторы**: сложность пароля; уникальность email; блокировки после N попыток.

**Фильтры/Поиск**: по роли/статусу/дате/отделу.

**API**: `/auth/register|verify-email|login|refresh|logout|forgot-password|reset-password`; `/users (CRUD)`, `/roles (CRUD)`, `/permissions`.

**События**: `UserRegistered`, `UserLoggedIn`, `RoleAssigned`.

**Нотификации**: welcome email, security alerts.

**Роли/Права**: ADMIN, LAB_OWNER, etc.

**Ошибки/Edge**: brute‑force → lockout; SSO drift.

**Метрики**: MAU/WAU/DAU; входы по ролям; неудачные логины.

---
