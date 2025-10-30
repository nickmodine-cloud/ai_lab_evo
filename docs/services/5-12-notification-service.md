# 5.12 Notification Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: генерация/доставка уведомлений: In‑App, Email, Slack, Push; предпочтения; дайджесты.

**Views**
1. **Inbox**: вкладки (All/Unread/Starred/Archived), фильтры по типу события/объекту/приоритету.
2. **Notification Detail**: текст, привязка к объекту, статусы по каналам.
3. **Preferences**: event×channel матрица; quiet hours; email digest time.

**Диалоги**: *Mark read/star/archive*; *Mark all read*; *Bulk archive*; *Save Preferences*.

**Валидаторы**: формат времени; ограничения quiet hours.

**Фильтры/Поиск**: как в Inbox; полнотекст по тексту уведомления.

**API**: `/notifications (list/update)`; `/notifications/mark-all-read`; `/notifications/preferences (get/patch)`; `/notifications/unread-count`.

**События**: консьюмит Kafka: `Hypothesis*`, `Experiment*`, `Resource*`, `Approval*` и т.д.

**Нотификации**: по предпочтениям пользователей.

**Роли/Права**: любой авторизованный пользователь для своих уведомлений; ADMIN видит системные метрики доставки.

**Ошибки/Edge**: сбой канала → retry/backoff; лимит писем → деградация в digest.

**Метрики**: delivery rate; open rate; avg time‑to‑notify.

---
