# 5.6 ROI Calculator Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: расчёт ROI по шаблонам; история расчётов; экспорт в Hypothesis.

**Views**
1. **ROI Form**: динамические поля (number, currency, slider); подсказки; live preview.
2. **Results**: карточки (economy/year, total cost, ROI%, payback months), bar‑chart по годам.
3. **History**: список прошлых расчётов; статусы «экспортировано в гипотезу».

**Диалоги**: *Calculate*; *Save*; *Export to Hypothesis*; *Delete Calculation*.

**Валидаторы**: формулы, типы полей, валюты, неотрицательные значения.

**Фильтры/Поиск**: по владельцу/кейсам/дате/ROI.

**API**: `GET /roi-calculator/templates?value_case_id=`; `POST /roi-calculator/calculate`; `GET /roi-calculator/calculations/{id}`; `GET /roi-calculator/calculations?user_id=`; `POST /roi-calculator/export-to-hypothesis`.

**События**: `ROICalculationSaved`, `ROIExportedToHypothesis`.

**Нотификации**: «ROI сохранён», «Создана гипотеза из ROI».

**Роли/Права**: USER — свои; CURATOR/ADMIN — все.

**Ошибки/Edge**: деление на ноль; несогласованные валюты; потеря шаблона.

**Метрики**: средний ROI по сегментам; конверсия в гипотезы.

---
