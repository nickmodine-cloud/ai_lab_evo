# 5.8 Governance Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: Wiki/Policies, Approvals, Risk Register, Knowledge base.

**Views**
1. **Wiki**: древо документов; версии; diff; публикации.
2. **Approvals**: список заявок (stage transitions, production deploys); фильтры по роли/статусу.
3. **Risk Register**: таблица рисков (категория, severity, owner, due); heatmap.

**Диалоги**: *Create/Edit Doc*; *Submit for Approval*; *Approve/Reject with comment*; *Create Risk*; *Mitigation Update*.

**Валидаторы**: обязательные поля; запрет удаления утверждённых; цифровые подписи (опционально).

**Фильтры/Поиск**: полнотекст по wiki; статус/категория по approvals/risks.

**API**: `/governance/wiki (CRUD)`; `/approvals (list/act)`; `/risks (CRUD)`.

**События**: `ApprovalRequested/Granted/Rejected`, `RiskCreated/Updated/Closed`.

**Нотификации**: апруверам/владельцам рисков.

**Роли/Права**: EDITOR/REVIEWER/APPROVER.

**Ошибки/Edge**: зависший апрув → эскалация; конфликт версий wiki.

**Метрики**: SLA approvals; #активных рисков; покрытие политиками.

---
