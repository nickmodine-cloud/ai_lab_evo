# 5.15 Admin/Marketplace Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: системные настройки, словари, workflows, интеграции, брендирование, каталог модулей.

**Views**
1. **Dictionaries**: индустрии, департаменты, валюты, типы AI, бизнес‑категории; drag‑n‑drop order; bulk import/export CSV.
2. **Workflows**: визуальный редактор стадий (порядок, required fields, approvals, SLA/targets).
3. **Integrations**: SendGrid/SES, Slack, LDAP/AD/SSO, SIEM, GitLab/Jenkins, MLflow.
4. **Branding**: лого, цвета, favicon, email‑хедер.
5. **Marketplace**: список модулей/коннекторов; install/enable; статусы.

**Диалоги**: *Add/Edit Dictionary Item*; *Bulk Import*; *Update Setting*; *Test Connection*; *Install Module*; *Reorder Stages*.

**Валидаторы**: уникальность кодов; правила min/max; скрытие sensitive.

**Фильтры/Поиск**: по типам словарей; статусам интеграций; категориям модулей.

**API**: `/admin/dictionaries`; `/admin/settings`; `/admin/workflows`; `/admin/branding`; `/marketplace/modules`.

**События**: `SettingsUpdated`, `WorkflowChanged`, `ModuleInstalled`.

**Нотификации**: предупреждения об опасных изменениях (2FA, prod‑keys).

**Роли/Права**: только ADMIN/OWNER.

**Ошибки/Edge**: удаление используемого словаря → reassign/soft‑delete; падение интеграции.

**Метрики**: покрытие справочниками; статусы интеграций; uptake модулей.

---
