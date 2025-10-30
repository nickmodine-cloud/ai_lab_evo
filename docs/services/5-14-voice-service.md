# 5.14 Voice Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: STT/TTS, NLU; voice‑команды; стриминг транскрипции.

**Views**
1. **Voice Modal** (floating): запись, волны, partial/final transcript, команды.
2. **Requests History**: список, транскрипты, intent, статус исполнения.

**Диалоги**: *Transcribe (file/stream)*; *Process Command*; *Synthesize*.

**Валидаторы**: форматы аудио; max длительность; языки.

**Фильтры/Поиск**: по контексту (onboarding/hypothesis), дате, статусу.

**API**: `/voice/transcribe`; `/voice/transcribe-stream`; `/voice/process-command`; `/voice/synthesize`; `/voice/requests`.

**События**: `VoiceTranscribed`, `CommandExecuted`.

**Нотификации**: «команда выполнена» (success/error).

**Роли/Права**: любой пользователь в своей области.

**Ошибки/Edge**: низкое качество; неверный intent; безопасные слова.

**Метрики**: WER; avg processing; adoption голоса.

---
