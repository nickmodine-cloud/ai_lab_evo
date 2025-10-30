# 5.1 Onboarding Service

> Автоматически сгенерировано из файла `k_2_tech_ai_lab_полная_спецификация_v_1 (1).md`.
> Вносите правки в исходный документ и перезапустите скрипт для повторной генерации.

**Domain**: голосовой/текстовый онбординг топ‑менеджера; сбор контекста; генерация *Roadmap*/*Checklist*; старт лаборатории.

**Views**
1. **Welcome & Consent**: выбор языка, политика, согласие на запись голоса.
2. **Voice Interview**: крупная кнопка микрофона; live‑транскрипт; этапный прогресс.
3. **Extracted Summary**: роль, цели, барьеры, текущее состояние (editable).
4. **Generated Roadmap (Gantt‑like)**: этапы 1–6, задачи с зависимостями, бюджет.
5. **Readiness Checklist**: категории (Команда/Данные/Инфра/Методология/Бюджет), прогресс, due‑dates.
6. **Finalize**: кнопка *Complete Onboarding* → создание лаборатории, первичных гипотез, уведомления.
7. **Export**: PDF/Markdown; поделиться ссылкой; запланировать ревизию.

**Диалоги**
- *Start Session* (Create): подтверждение языка/режима (demo/standard), старт таймера.
- *Voice Input* (Update): запись, STT, NLU, извлечение сущностей → обновление `extracted_data`.
- *Generate Roadmap* (Create): параметры горизонта (3/6/12 мес), сохранение как `roadmap_data`.
- *Generate Checklist* (Create): авто‑чеклист с приоритетами, датами.
- *Voice Edit* (Update): NLU‑команды (ADD_CHECKLIST_ITEM, UPDATE_BUDGET, ...).
- *Complete* (Transition): завершение сессии, создание Lab + базовых гипотез, событие `OnboardingCompleted`.
- *Delete Session* (Delete): soft delete с подтверждением и причиной.

**Валидаторы**: обязательный язык; длина аудио ≤ N минут; лимит попыток; валидация дат при checklist; уникальность задач в roadmap.

**Фильтры/Поиск (для админов)**: статус, язык, индустрия, дата, режим, readiness score, сортировки.

**API (основное)**
- `POST /onboarding/sessions { user_id, language, mode }`
- `POST /onboarding/sessions/{id}/voice-input { audio_base64, audio_format }`
- `POST /onboarding/sessions/{id}/text-input { text }`
- `POST /onboarding/sessions/{id}/generate-roadmap { time_horizon_months }`
- `POST /onboarding/sessions/{id}/generate-checklist`
- `POST /onboarding/sessions/{id}/voice-edit`
- `POST /onboarding/sessions/{id}/complete`
- `GET /onboarding/sessions/{id}/export-pdf`

**События**: `OnboardingSessionCreated`, `OnboardingVoiceProcessed`, `RoadmapGenerated`, `ChecklistGenerated`, `OnboardingCompleted`.

**Нотификации**: «Сессия завершена», «Создана лаборатория», «Добавлены гипотезы».

**Роли/Права**: USER (свой онбординг); ADMIN (все); CURATOR (read облачный PDF для презентации).

**Ошибки/Edge**: плохое аудио → повтор; таймаут LLM; конфликт редактирования → last‑write‑wins с журналом.

**Метрики**: avg processing time; % завершённых сессий; средний readiness score; NPS онбординга.

---
