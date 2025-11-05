# 5.12 Notification Service

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
