# 5.5 Value Case Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: каталог value‑кейсов (отраслевые), метрики, ROI‑шаблоны, связь с Hypothesis.

**Views**
1. **Cases Catalog**: карточки со сводкой (ROI, payback, maturity), фильтры по индустрии/типу AI.
2. **Case Detail**: описание, результаты, метрики, «Посчитать ROI», «Создать гипотезу».
3. **Matrix View (Impact vs Complexity)**: расстановка кейсов для ориентира.

**Диалоги**: *Create/Update/Delete Case* (контент‑менеджеры), *Add Metrics*, *Attach ROI Template*.

**Валидаторы**: уникальность slug; корректность процента/валют; статус публикации.

**Фильтры/Поиск**: индустрия, тип ИИ, категория, ROI диапазон, теги; полнотекстовый.

**API**: `GET /value-cases`; `GET /value-cases/{slug}`; `POST /value-cases`; `PATCH /value-cases/{id}`; `DELETE /value-cases/{id}`; `GET /value-cases/matrix`.

**События**: `ValueCaseCreated/Updated/Viewed`.

**Нотификации**: редакторам при модерации.

**Роли/Права**: VIEW всем; EDIT — CONTENT_ADMIN.

**Ошибки/Edge**: кейс скрыт (draft); конфликт slug.

**Метрики**: просмотры, конверсия «ROI calc» → «Create Hypothesis».

---
