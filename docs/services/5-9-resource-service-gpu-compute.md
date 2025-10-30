# 5.9 Resource Service (GPU & Compute)

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: узлы ресурсов, очереди, резервации, использование, стоимость.

**Views**
1. **Queue**: запросы на ресурсы (requested type/count/duration, priority, ETA).
2. **Reservations**: активные/завершённые; продление; досрочный release.
3. **Nodes**: список узлов (gpu type/count, utilization, temp, cost), stat cards.
4. **Costs**: отчёты по gpu‑часам, стоимости, разбивки по пользователям/проектам.

**Диалоги**: *Check Availability*; *Reserve*; *Extend*; *Release*; *Cancel*; *Queue Request*.

**Валидаторы**: лимиты квот; пересечение бронирований; стоимость ≈ duration× тариф.

**Фильтры/Поиск**: по типу GPU, статусу, пользователю, периоду.

**API**: `/resources/nodes`; `/resources/availability`; `/resources/reservations (CRUD)`; `/resources/queue`; `/resources/usage-metrics`; `/resources/costs/summary`.

**События**: `ResourceReserved/Released/Expired`, `QueueAdded/Promoted`.

**Нотификации**: «ресурсы доступны», «очередь продвинута», «резервация истекает».

**Роли/Права**: DS/MLE — запрос своих; IT_ADMIN — всё.

**Ошибки/Edge**: недоступность узлов; перегрев; внезапный down‑node.

**Метрики**: утилизация; среднее ожидание; экономия от досрочных релизов.

---
