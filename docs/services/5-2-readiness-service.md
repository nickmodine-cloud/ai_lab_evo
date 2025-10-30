# 5.2 Readiness Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: AI Readiness Assessment; расчёт Overall & Category Scores; план действий на 3 мес.

**Views**
1. **Wizard 6 категорий**: бизнес‑стратегия, люди/скиллы, данные, инфраструктура, процессы, культура.
2. **Progress Panel**: #вопросов, overall score, maturity level.
3. **Results**: radar‑chart, топ сильных/слабых, рекомендации.
4. **Action Plan** (3‑месячный): помесячно, задачи, impact, приоритет.
5. **Export**: PDF, отправить в Hypothesis/Dashboard.

**Диалоги**: *Create Assessment*; *Answer Question*; *Recalculate Score*; *Generate Action Plan*; *Complete Assessment*; *Delete*.

**Валидаторы**: веса вопросов, типы ответов, вычисление категор. максимумов, консистентность процентов.

**Фильтры/Поиск**: по пользователю/лабе, статусам, уровням зрелости.

**API**: `POST /readiness/assessments`; `GET /readiness/questions`; `POST /readiness/assessments/{id}/answers`; `POST /readiness/assessments/{id}/calculate-score`; `POST /readiness/assessments/{id}/generate-action-plan`; `GET /.../export-pdf`.

**События**: `AssessmentCreated`, `AssessmentCompleted`.

**Нотификации**: «Action Plan готов», «Результаты отправлены в CEO Dashboard».

**Роли/Права**: USER (своё), CURATOR (все), ADMIN (все).

**Ошибки/Edge**: частично отвеченные; изменение вопросов админом после старта → версионирование вопросников.

**Метрики**: средний overall score; распределение по maturity; конверсия в action plan; влияние плана на KPI через 3 мес.

---
