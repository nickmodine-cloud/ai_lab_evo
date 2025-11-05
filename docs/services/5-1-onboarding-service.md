# 5.1 Onboarding Service

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

**Domain**: голосовой/текстовый онбординг топ‑менеджера; сбор контекста; генерация *Roadmap*/*Checklist*; старт лаборатории.

**Views** (с UI: shadcn-ui для базовых, Aceternity для анимаций и неона)

1. **Welcome & Consent**: выбор языка, политика, согласие на запись голоса (Bento Grid для карточек, Animated Input для чекбоксов).
2. **Voice Interview**: крупная кнопка микрофона (Neon Button с анимацией); live‑транскрипт; этапный прогресс (shadcn-ui Progress с неоновым градиентом).
3. **Extracted Summary**: роль, цели, барьеры, текущее состояние (editable) (Animated List для редактирования).
4. **Generated Roadmap (Gantt‑like)**: этапы 1–6, задачи с зависимостями, бюджет (Bento Grid + Gantt с анимациями hover).
5. **Readiness Checklist**: категории (Команда/Данные/Инфра/Методология/Бюджет), прогресс, due‑dates (Acceternity Checklist с неоновыми чекбоксами).
6. **Finalize**: кнопка *Complete Onboarding* → создание лаборатории, первичных гипотез, уведомления (Animated Button с контурным эффектом).
7. **Export**: PDF/Markdown; поделиться ссылкой; запланировать ревизию (shadcn-ui Button с Neon Gradient).

**Диалоги** (все в Animated Modal из Aceternity с неоновыми формами)

* *Start Session* (Create): подтверждение языка/режима (demo/standard), старт таймера.
* *Voice Input* (Update): запись, STT, NLU, извлечение сущностей → обновление `extracted_data`.
* *Generate Roadmap* (Create): параметры горизонта (3/6/12 мес), сохранение как `roadmap_data`.
* *Generate Checklist* (Create): авто‑чеклист с приоритетами, датами.
* *Voice Edit* (Update): NLU‑команды (ADD_CHECKLIST_ITEM, UPDATE_BUDGET, ...).
* *Complete* (Transition): завершение сессии, создание Lab + базовых гипотез, событие `OnboardingCompleted`.
* *Delete Session* (Delete): soft delete с подтверждением и причиной.

**Валидаторы**: обязательный язык; длина аудио ≤ N минут; лимит попыток; валидация дат при checklist; уникальность задач в roadmap.

**Фильтры/Поиск (для админов)**: статус, язык, индустрия, дата, режим, readiness score, сортировки (shadcn-ui DataTable с Bento Grid).

**API (основное)**

* `POST /onboarding/sessions { user_id, language, mode }`
* `POST /onboarding/sessions/{id}/voice-input { audio_base64, audio_format }`
* `POST /onboarding/sessions/{id}/text-input { text }`
* `POST /onboarding/sessions/{id}/generate-roadmap { time_horizon_months }`
* `POST /onboarding/sessions/{id}/generate-checklist`
* `POST /onboarding/sessions/{id}/voice-edit`
* `POST /onboarding/sessions/{id}/complete`
* `GET /onboarding/sessions/{id}/export-pdf`

**События**: `OnboardingSessionCreated`, `OnboardingVoiceProcessed`, `RoadmapGenerated`, `ChecklistGenerated`, `OnboardingCompleted`.

**Нотификации**: «Сессия завершена», «Создана лаборатория», «Добавлены гипотезы».

**Роли/Права**: USER (свой онбординг); ADMIN (все); CURATOR (read облачный PDF для презентации).

**Ошибки/Edge**: плохое аудио → повтор; таймаут LLM; конфликт редактирования → last‑write‑wins с журналом.

**Метрики**: avg processing time; % завершённых сессий; средний readiness score; NPS онбординга.

---
