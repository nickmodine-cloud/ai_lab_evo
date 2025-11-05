# 5.15 Admin/Marketplace Service

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
