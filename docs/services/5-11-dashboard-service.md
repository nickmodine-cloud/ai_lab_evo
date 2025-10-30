# 5.11 Dashboard Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: KPI‑панели для разных аудиторий; виджеты; кэш.

**Views**
1. **CEO Dashboard**: KPI‑карточки (active hypotheses, in experimentation, in production, success rate, avg time‑to‑prod, total investment YTD, realized ROI YTD, critical risks), воронка стадий, action required, time‑to‑market по стадиям, ROI scatter/matrix, risks heatmap, team performance.
2. **Portfolio Dashboard**: агрегированные портфельные метрики, распределения по департаментам/типам AI, карта проектов.
3. **Team Dashboard**: эффективность команд, прогресс по задачам, загрузка GPU.
4. **Resources Dashboard**: утилизация узлов, очереди, прогноз потребностей.

**Диалоги**: *Configure Widgets* (метрика, период, фильтры, размер); *Set Targets/SLA*; *Export PDF*.

**Валидаторы**: допустимые агрегаты/диапазоны; права на источники.

**Фильтры/Поиск**: по лаборатории/департаменту/периоду/типу AI.

**API**: `/dashboards/ceo`; `/dashboards/portfolio`; `/dashboards/team`; `/dashboards/resources`; `/dashboards/set-targets`.

**События**: `DashboardViewed`, `TargetsUpdated`.

**Нотификации**: дайджесты (еженедельно/ежемесячно) владельцам.

**Роли/Права**: CEO/ADMIN/CURATOR — полный; остальные по видимости.

**Ошибки/Edge**: пустые данные → placeholder; истёк кэш → lazy rebuild.

**Метрики**: частота просмотров; TTFB; % виджетов в кэше.

---
