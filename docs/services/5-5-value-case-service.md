# 5.5 Value Case Service

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

**Domain**: каталог value‑кейсов (отраслевые), метрики, ROI‑шаблоны, связь с Hypothesis.

**Views** (с UI: Bento Grid для каталога, Card Hover Effects для деталей)

1. **Cases Catalog**: карточки со сводкой (ROI, payback, maturity), фильтры по индустрии/типу AI (Bento Grid с неоновыми карточками).
2. **Case Detail**: описание, результаты, метрики, «Посчитать ROI», «Создать гипотезу» (Neon Gradient Card с анимированными кнопками).
3. **Matrix View (Impact vs Complexity)**: расстановка кейсов для ориентира (Aceternity Matrix с drag и неоном).

**Диалоги** (Animated Modal с неоновыми формами)

* *Create/Update/Delete Case* (контент‑менеджеры), *Add Metrics*, *Attach ROI Template*.

**Валидаторы**: уникальность slug; корректность процента/валют; статус публикации.

**Фильтры/Поиск**: индустрия, тип ИИ, категория, ROI диапазон, теги; полнотекстовый (shadcn-ui Input с неоном).

**API**: `GET /value-cases`; `GET /value-cases/{slug}`; `POST /value-cases`; `PATCH /value-cases/{id}`; `DELETE /value-cases/{id}`; `GET /value-cases/matrix`.

**События**: `ValueCaseCreated/Updated/Viewed`.

**Нотификации**: редакторам при модерации.

**Роли/Права**: VIEW всем; EDIT — CONTENT_ADMIN.

**Ошибки/Edge**: кейс скрыт (draft); конфликт slug.

**Метрики**: просмотры, конверсия «ROI calc» → «Create Hypothesis».

---
