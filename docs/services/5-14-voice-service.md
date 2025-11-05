# 5.14 Voice Service

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

**Статус**: backlog (Wave 2). Реализация откладывается до стабилизации Hypothesis Core.

**Domain**: STT/TTS, NLU; voice‑команды; стриминг транскрипции.

**Views** (с UI: Floating Modal для записи, Animated List для истории)

1. **Voice Modal** (floating): запись, волны, partial/final transcript, команды (Aceternity Floating Dock с неоновыми кнопками).
2. **Requests History**: список, транскрипты, intent, статус исполнения (Bento Grid).

**Диалоги** (Animated Modal)

* *Transcribe (file/stream)*; *Process Command*; *Synthesize*.

**Валидаторы**: форматы аудио; max длительность; языки.

**Фильтры/Поиск**: по контексту (onboarding/hypothesis), дате, статусу.

**API**: `/voice/transcribe`; `/voice/transcribe-stream`; `/voice/process-command`; `/voice/synthesize`; `/voice/requests`.

**События**: `VoiceTranscribed`, `CommandExecuted`.

**Нотификации**: «команда выполнена» (success/error).

**Роли/Права**: любой пользователь в своей области.

**Ошибки/Edge**: низкое качество; неверный intent; безопасные слова.

**Метрики**: WER; avg processing; adoption голоса.

---
