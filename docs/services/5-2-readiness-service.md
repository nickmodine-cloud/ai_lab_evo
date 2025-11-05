# 5.2 Readiness Service

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

**Статус**: backlog (Wave 2). Реализация откладывается до стабилизации Hypothesis Core.

**Domain**: AI Readiness Assessment; расчёт Overall & Category Scores; план действий на 3 мес.

**Views** (с UI: Aceternity для анимированных чартов и неона)

1. **Wizard 6 категорий**: бизнес‑стратегия, люди/скиллы, данные, инфраструктура, процессы, культура (Animated Steps с неоновыми прогресс-барами).
2. **Progress Panel**: #вопросов, overall score, maturity level (Neon Gradient Card).
3. **Results**: radar‑chart (Animated Chart из Aceternity), топ сильных/слабых, рекомендации (Bento Grid).
4. **Action Plan** (3‑месячный): помесячно, задачи, impact, приоритет (Timeline с анимациями).
5. **Export**: PDF, отправить в Hypothesis/Dashboard (Neon Button).

**Диалоги** (Animated Modal с анимированными формами)

* *Create Assessment*; *Answer Question*; *Recalculate Score*; *Generate Action Plan*; *Complete Assessment*; *Delete*.

**Валидаторы**: веса вопросов, типы ответов, вычисление категор. максимумов, консистентность процентов.

**Фильтры/Поиск**: по пользователю/лабе, статусам, уровням зрелости (shadcn-ui Select с неоном).

**API**: `POST /readiness/assessments`; `GET /readiness/questions`; `POST /readiness/assessments/{id}/answers`; `POST /readiness/assessments/{id}/calculate-score`; `POST /readiness/assessments/{id}/generate-action-plan`; `GET /.../export-pdf`.

**События**: `AssessmentCreated`, `AssessmentCompleted`.

**Нотификации**: «Action Plan готов», «Результаты отправлены в CEO Dashboard».

**Роли/Права**: USER (своё), CURATOR (все), ADMIN (все).

**Ошибки/Edge**: частично отвеченные; изменение вопросов админом после старта → версионирование вопросников.

**Метрики**: средний overall score; распределение по maturity; конверсия в action plan; влияние плана на KPI через 3 мес.

---
