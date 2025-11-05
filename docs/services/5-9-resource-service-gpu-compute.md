# 5.9 Resource Service (GPU & Compute)

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

**Domain**: узлы ресурсов, очереди, резервации, использование, стоимость.

**Views** (с UI: Bento Grid для очередей, Animated Charts для утилизации)

1. **Queue**: запросы на ресурсы (requested type/count/duration, priority, ETA) (Animated List с неоном).
2. **Reservations**: активные/завершённые; продление; досрочный release (Bento Grid).
3. **Nodes**: список узлов (gpu type/count, utilization, temp, cost), stat cards (Neon Gradient Cards).
4. **Costs**: отчёты по gpu‑часам, стоимости, разбивки по пользователям/проектам (Animated Bar Chart).

**Диалоги** (Animated Modal)

* *Check Availability*; *Reserve*; *Extend*; *Release*; *Cancel*; *Queue Request*.

**Валидаторы**: лимиты квот; пересечение бронирований; стоимость ≈ duration× тариф.

**Фильтры/Поиск**: по типу GPU, статусу, пользователю, периоду.

**API**: `/resources/nodes`; `/resources/availability`; `/resources/reservations (CRUD)`; `/resources/queue`; `/resources/usage-metrics`; `/resources/costs/summary`.

**События**: `ResourceReserved/Released/Expired`, `QueueAdded/Promoted`.

**Нотификации**: «ресурсы доступны», «очередь продвинута», «резервация истекает».

**Роли/Права**: DS/MLE — запрос своих; IT_ADMIN — всё.

**Ошибки/Edge**: недоступность узлов; перегрев; внезапный down‑node.

**Метрики**: утилизация; среднее ожидание; экономия от досрочных релизов.

---
