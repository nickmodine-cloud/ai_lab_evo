# 5.16 Analytics Service

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

**Domain**: события (eventing), метрики времени, инсайты, предсказания, отчёты.

**Views** (с UI: Animated Charts для time-series, Bento Grid для insights)

1. **Time‑Series**: выбор метрик (total_hypotheses, success_rate), гранулярность (DAY/WEEK/MONTH), фильтры (Line Chart с неоновыми градиентами).
2. **Insights**: bottlenecks по стадиям (avg time vs target), корневые причины, рекомендации (Neon Cards).
3. **Predictions**: вероятность успеха гипотезы (feature set), похожие кейсы (Animated Probability Bar).
4. **Reports**: Executive Summary за период (JSON/PDF) (Bento Grid).

**Диалоги** (Animated Modal)

* *Define Metric*; *Export Report*; *Drill‑down*.

**Валидаторы**: корректные диапазоны дат; доступ к источникам.

**Фильтры/Поиск**: по лабе/департаменту/периоду.

**API**: `/analytics/events (ingest)`; `/metrics/time-series`; `/insights/bottlenecks`; `/predictions/success-probability`; `/reports/executive-summary`.

**События**: аггрегируются из всех сервисов.

**Нотификации**: «обнаружен bottleneck», «новый отчёт доступен».

**Роли/Права**: ADMIN/CURATOR/CEO.

**Ошибки/Edge**: пропуски событий; outliers.

**Метрики**: задержка агрегаций; SLA отчётов.

---
