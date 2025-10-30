# 5.10 Laboratory Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: лаборатории (рабпространства), членство, приглашения, видимость.

**Views**
1. **Labs List**: карточки (описание, owner, counts, статус, visibility).
2. **Lab Detail**: *Overview*, *Members* (roles), *Settings*, *Stats*.
3. **Invitations**: отправка, статусы, повтор.

**Диалоги**: *Create Lab*; *Invite Member*; *Change Role*; *Remove Member*; *Archive Lab*.

**Валидаторы**: уникальность slug; валидность email; роль только из списка.

**Фильтры/Поиск**: по отделу/статусу/видимости/моей роли.

**API**: `/laboratories (CRUD)`; `/laboratories/{id}/members (CRUD)`; `/invitations (create/accept)`.

**События**: `LaboratoryCreated`, `InvitationSent/Accepted`.

**Нотификации**: приглашённому; owner при принятии.

**Роли/Права**: OWNER/ADMIN/MEMBER/VIEWER.

**Ошибки/Edge**: истёк токен приглашения; конфликт видимости.

**Метрики**: #labs; средний размер; активность участников.

---
