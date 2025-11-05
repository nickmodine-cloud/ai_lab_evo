# 5.13 File Storage Service

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

**Domain**: загрузка, версия, доступ, превью, подписанные ссылки, вирус‑скан.

**Views** (с UI: Bento Grid для списка, Animated Modal для истории)

1. **Attachments List** (внутри Hypothesis/Experiment): миниатюры/иконки, версия, uploader, дата (Bento Grid с hover эффектами).
2. **Version History Modal**: сравнение версий, restore (Animated List).
3. **Batch Upload**: dnd‑зона, прогресс, итоги (Drag & Drop с неоновыми индикаторами).

**Диалоги** (Animated Modal)

* *Upload*; *Upload Version*; *Delete/Restore*; *Download (signed URL)*.

**Валидаторы**: типы файлов (whitelist), размер, скан антивирусом.

**Фильтры/Поиск**: по владельцу/типу/объекту/дате.

**API**: `/files/upload`; `/files/{id}`; `/files/{id}/download`; `/files/{id}/upload-version`; `/files/{id}/versions`; `/files` (list).

**События**: `FileUploaded/Deleted`.

**Нотификации**: владельцу объекта при новых вложениях.

**Роли/Права**: доступ по видимости объекта; PRIVATE/INTERNAL/PUBLIC.

**Ошибки/Edge**: истёк токен загрузки; неудачный вирус‑скан.

**Метрики**: объём хранилища; топ‑типы файлов; время генерации preview.

---
