# 5.6 ROI Calculator Service

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

**Domain**: расчёт ROI по шаблонам; история расчётов; экспорт в Hypothesis.

**Views** (с UI: Animated Form для калькулятора, Bento Grid для истории)

1. **ROI Form**: динамические поля (number, currency, slider); подсказки; live preview (Animated Input с неоновыми слайдерами).
2. **Results**: карточки (economy/year, total cost, ROI%, payback months), bar‑chart по годам (Animated Chart с градиентами).
3. **History**: список прошлых расчётов; статусы «экспортировано в гипотезу» (Bento Grid).

**Диалоги** (Animated Modal)

* *Calculate*; *Save*; *Export to Hypothesis*; *Delete Calculation*.

**Валидаторы**: формулы, типы полей, валюты, неотрицательные значения.

**Фильтры/Поиск**: по владельцу/кейсам/дате/ROI (shadcn-ui Filter с неоном).

**API**: `GET /roi-calculator/templates?value_case_id=`; `POST /roi-calculator/calculate`; `GET /roi-calculator/calculations/{id}`; `GET /roi-calculator/calculations?user_id=`; `POST /roi-calculator/export-to-hypothesis`.

**События**: `ROICalculationSaved`, `ROIExportedToHypothesis`.

**Нотификации**: «ROI сохранён», «Создана гипотеза из ROI».

**Роли/Права**: USER — свои; CURATOR/ADMIN — все.

**Ошибки/Edge**: деление на ноль; несогласованные валюты; потеря шаблона.

**Метрики**: средний ROI по сегментам; конверсия в гипотезы.

---
