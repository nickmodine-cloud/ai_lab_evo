# 5.13 File Storage Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: загрузка, версия, доступ, превью, подписанные ссылки, вирус‑скан.

**Views**
1. **Attachments List** (внутри Hypothesis/Experiment): миниатюры/иконки, версия, uploader, дата.
2. **Version History Modal**: сравнение версий, restore.
3. **Batch Upload**: dnd‑зона, прогресс, итоги.

**Диалоги**: *Upload*; *Upload Version*; *Delete/Restore*; *Download (signed URL)*.

**Валидаторы**: типы файлов (whitelist), размер, скан антивирусом.

**Фильтры/Поиск**: по владельцу/типу/объекту/дате.

**API**: `/files/upload`; `/files/{id}`; `/files/{id}/download`; `/files/{id}/upload-version`; `/files/{id}/versions`; `/files` (list).

**События**: `FileUploaded/Deleted`.

**Нотификации**: владельцу объекта при новых вложениях.

**Роли/Права**: доступ по видимости объекта; PRIVATE/INTERNAL/PUBLIC.

**Ошибки/Edge**: истёк токен загрузки; неудачный вирус‑скан.

**Метрики**: объём хранилища; топ‑типы файлов; время генерации preview.

---
