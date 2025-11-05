# 5.11 Dashboard Service

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

**Domain**: KPI‑панели для разных аудиторий; виджеты; кэш.

**Views** (с UI: Bento Grid для виджетов, Neon Gradient Cards для KPI)

1. **CEO Dashboard**: KPI‑карточки (active hypotheses, in experimentation, in production, success rate, avg time‑to‑prod, total investment YTD, realized ROI YTD, critical risks), воронка стадий, action required, time‑to‑market по стадиям, ROI scatter/matrix, risks heatmap, team performance (Bento Grid + Animated Charts).
2. **Portfolio Dashboard**: агрегированные портфельные метрики, распределения по департаментам/типам AI, карта проектов (Matrix с неоном).
3. **Team Dashboard**: эффективность команд, прогресс по задачам, загрузка GPU (Timeline с анимациями).
4. **Resources Dashboard**: утилизация узлов, очереди, прогноз потребностей (Heatmap + Bar Charts).

**Диалоги** (Animated Modal)

* *Configure Widgets* (метрика, период, фильтры, размер); *Set Targets/SLA*; *Export PDF*.

**Валидаторы**: допустимые агрегаты/диапазоны; права на источники.

**Фильтры/Поиск**: по лаборатории/департаменту/периоду/типу AI.

**API**: `/dashboards/ceo`; `/dashboards/portfolio`; `/dashboards/team`; `/dashboards/resources`; `/dashboards/set-targets`.

**События**: `DashboardViewed`, `TargetsUpdated`.

**Нотификации**: дайджесты (еженедельно/ежемесячно) владельцам.

**Роли/Права**: CEO/ADMIN/CURATOR — полный; остальные по видимости.

**Ошибки/Edge**: пустые данные → placeholder; истёк кэш → lazy rebuild.

**Метрики**: частота просмотров; TTFB; % виджетов в кэше.

---
