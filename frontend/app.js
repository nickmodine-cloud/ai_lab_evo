const apiBase = window.location.origin;
const stepConfig = [
  { id: 'welcome-step', label: 'Welcome & Consent' },
  { id: 'voice-step', label: 'Voice Interview' },
  { id: 'summary-step', label: 'Extracted Summary' },
  { id: 'roadmap-step', label: 'Roadmap' },
  { id: 'checklist-step', label: 'Checklist' },
  { id: 'finalize-step', label: 'Finalize' },
  { id: 'export-step', label: 'Export' },
];

let currentStep = 0;
let maxUnlockedStep = 0;
let activeSession = null;
let activeSessionId = null;
let recognition = null;
let isRecognizing = false;
let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let recordingStartedAt = null;
let lastRecordingBlob = null;
let lastRecordingDuration = null;

const stepButtons = [...document.querySelectorAll('.stepper__step')];
const stepPanes = stepConfig.map((step) => document.getElementById(step.id));
const stepLabel = document.getElementById('active-step');
const sessionLabel = document.getElementById('active-session-label');
const readinessLabel = document.getElementById('active-readiness');
const readinessGauge = document.getElementById('readiness-progress');
const readinessScore = document.getElementById('readiness-score');

const sessionForm = document.getElementById('session-form');
const sessionStatus = document.getElementById('session-status');
const voiceStatus = document.getElementById('voice-status');
const voiceTranscript = document.getElementById('voice-transcript');
const voiceArtifactsList = document.getElementById('voice-artifacts');
const sessionsList = document.getElementById('sessions-list');
const exportPdfLink = document.getElementById('export-pdf');
const exportMarkdownLink = document.getElementById('export-md');
const transcriptList = document.getElementById('transcript-list');
const eventsList = document.getElementById('events-list');
const summaryContent = document.getElementById('summary-content');
const roadmapContent = document.getElementById('roadmap-content');
const checklistContent = document.getElementById('checklist-content');

const startVoiceBtn = document.getElementById('start-voice');
const stopVoiceBtn = document.getElementById('stop-voice');
const uploadAudioBtn = document.getElementById('upload-audio');
const sendTranscriptBtn = document.getElementById('send-transcript');
const voiceCommandForm = document.getElementById('voice-command-form');

const filterForm = document.getElementById('session-filter-form');
const refreshSessionsBtn = document.getElementById('refresh-sessions');

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function goToStep(index) {
  if (index < 0 || index >= stepConfig.length) return;
  if (index > maxUnlockedStep) return;

  currentStep = index;
  stepButtons.forEach((button, btnIndex) => {
    const isActive = btnIndex === index;
    button.classList.toggle('active', isActive);
  });

  stepPanes.forEach((pane, paneIndex) => {
    pane.classList.toggle('active', paneIndex === index);
  });

  stepLabel.textContent = stepConfig[index].label;
}

function unlockStep(index) {
  if (index > maxUnlockedStep) {
    maxUnlockedStep = index;
    updateStepAvailability();
  }
}

function updateStepAvailability() {
  stepButtons.forEach((button, index) => {
    const unlocked = index <= maxUnlockedStep;
    button.disabled = !unlocked;
  });
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function renderSummary(summary = {}) {
  const { role = [], goals = [], barriers = [], current_state: currentState = [] } = summary;
  summaryContent.innerHTML = `
    <div>
      <strong>Роли</strong>
      <p>${role.length ? role.join('<br>') : '—'}</p>
    </div>
    <div>
      <strong>Цели</strong>
      <p>${goals.length ? goals.join('<br>') : '—'}</p>
    </div>
    <div>
      <strong>Барьеры</strong>
      <p>${barriers.length ? barriers.join('<br>') : '—'}</p>
    </div>
    <div>
      <strong>Текущее состояние</strong>
      <p>${currentState.length ? currentState.join('<br>') : '—'}</p>
    </div>
  `;
}

function renderRoadmap(roadmap = {}) {
  if (!roadmap || !Object.keys(roadmap).length) {
    roadmapContent.innerHTML = '<p>Roadmap пока не сгенерирован. Укажите горизонт и запустите генерацию.</p>';
    return;
  }

  roadmapContent.innerHTML = Object.entries(roadmap)
    .map(
      ([phase, tasks]) => `
        <article class="roadmap-phase">
          <h3>${phase}</h3>
          <ul>
            ${tasks
              .map(
                (task) => `
                  <li>
                    <strong>${task.title}</strong><br />
                    Due: месяц ${task.due_month}
                    ${task.dependency ? `<br />Зависимость: ${task.dependency}` : ''}
                  </li>
                `,
              )
              .join('')}
          </ul>
        </article>
      `,
    )
    .join('');
}

function renderChecklist(checklist = []) {
  if (!Array.isArray(checklist) || !checklist.length) {
    checklistContent.innerHTML = '<p>Сгенерируйте чек-лист, чтобы отобразить прогресс по категориям.</p>';
    return;
  }

  checklistContent.innerHTML = checklist
    .map(
      (item) => `
        <article class="checklist-item">
          <header>
            <div>
              <strong>${item.category}</strong>
              <div>${item.title}</div>
              <small>Due: ${formatDate(item.due_date)} • Priority: ${item.priority}</small>
            </div>
            <select data-item-id="${item.id}" class="checklist-status">
              <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Ожидает</option>
              <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>В работе</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Готово</option>
            </select>
          </header>
          <p>${item.description || ''}</p>
        </article>
      `,
    )
    .join('');

  bindChecklistActions();
}

function renderVoiceArtifacts(artifacts = []) {
  if (!Array.isArray(artifacts) || !artifacts.length) {
    voiceArtifactsList.innerHTML = '<li>Пока нет загруженных записей. Сделайте запись и загрузите её в backend.</li>';
    return;
  }

  voiceArtifactsList.innerHTML = artifacts
    .map((artifact) => {
      const audioUrl = `/${artifact.audio_path}`;
      const duration = artifact.duration_seconds ? `${artifact.duration_seconds.toFixed(1)}s` : '—';
      const transcript = artifact.transcript_text || '—';
      return `
        <li>
          <strong>${new Date(artifact.created_at).toLocaleString()}</strong><br />
          ${artifact.audio_format.toUpperCase()} • ${duration}
          <div class="voice-artifact-audio">
            <audio controls src="${audioUrl}"></audio>
          </div>
          <small>Transcript: ${transcript}</small>
        </li>
      `;
    })
    .join('');
}

function bindChecklistActions() {
  document.querySelectorAll('.checklist-status').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const itemId = event.target.dataset.itemId;
      const status = event.target.value;
      if (!activeSessionId) return;
      try {
        const session = await api(`/onboarding/sessions/${activeSessionId}/checklist/status`, {
          method: 'POST',
          body: JSON.stringify({ item_id: itemId, status }),
        });
        setSession(session);
      } catch (error) {
        alert(`Не удалось обновить статус: ${error.message}`);
      }
    });
  });
}

function updateReadiness(session) {
  const readiness = session.readiness_score ?? 0;
  readinessLabel.textContent = `${readiness}%`;
  readinessScore.textContent = `${readiness}%`;
  readinessGauge.style.width = `${readiness}%`;
}

function updateExports(session) {
  exportPdfLink.href = `/onboarding/sessions/${session.id}/export-pdf`;
  exportMarkdownLink.href = `/onboarding/sessions/${session.id}/export-markdown`;
}

async function refreshTimeline() {
  if (!activeSessionId) return;
  try {
    const [transcript, events] = await Promise.all([
      api(`/onboarding/sessions/${activeSessionId}/transcript`),
      api(`/onboarding/sessions/${activeSessionId}/events`),
    ]);

    transcriptList.innerHTML = transcript
      .map(
        (entry) => `
          <li>
            <strong>${new Date(entry.created_at).toLocaleString()}</strong><br />
            ${entry.text}
          </li>
        `,
      )
      .join('');

    eventsList.innerHTML = events
      .map(
        (event) => `
          <li>
            <strong>${event.event_type}</strong><br />
            ${new Date(event.created_at).toLocaleString()}
          </li>
        `,
      )
      .join('');
  } catch (error) {
    console.error(error);
  }
}

function deriveUnlockedStep(session) {
  if (!session) return 0;
  let step = 1;
  const hasSummary = session.extracted_summary && Object.keys(session.extracted_summary).length > 0;
  const hasRoadmap = session.roadmap && Object.keys(session.roadmap).length > 0;
  const hasChecklist = Array.isArray(session.checklist) && session.checklist.length > 0;

  if (hasSummary) step = 2;
  if (hasRoadmap) step = 3;
  if (hasChecklist) step = 4;
  if (session.status === 'completed') step = 6;

  return step;
}

function setSession(session) {
  const previousSessionId = activeSessionId;
  activeSession = session;
  activeSessionId = session?.id ?? null;

  if (!session) {
    sessionLabel.textContent = '—';
    readinessLabel.textContent = '0%';
    readinessGauge.style.width = '0%';
    exportPdfLink.href = '#';
    exportMarkdownLink.href = '#';
    summaryContent.innerHTML = '';
    roadmapContent.innerHTML = '';
    checklistContent.innerHTML = '';
    voiceArtifactsList.innerHTML = '';
    return;
  }

  if (previousSessionId !== session.id) {
    maxUnlockedStep = 0;
    updateStepAvailability();
  }

  sessionLabel.textContent = session.id;
  updateReadiness(session);
  renderSummary(session.extracted_summary || {});
  renderRoadmap(session.roadmap || {});
  renderChecklist(session.checklist || []);
  renderVoiceArtifacts(session.voice_assets || []);
  updateExports(session);
  refreshTimeline();

  const unlocked = deriveUnlockedStep(session);
  unlockStep(unlocked);
  if (currentStep === 0) {
    goToStep(1);
  } else if (currentStep > unlocked) {
    goToStep(unlocked);
  }

  loadSessions();
}

async function loadSessions() {
  const params = new URLSearchParams();
  const language = document.getElementById('filter-language').value;
  const status = document.getElementById('filter-status').value;
  const mode = document.getElementById('filter-mode').value;
  const industry = document.getElementById('filter-industry').value.trim();

  if (language) params.append('language', language);
  if (status) params.append('status', status);
  if (mode) params.append('mode', mode);
  if (industry) params.append('industry', industry);

  try {
    const sessions = await api(`/onboarding/sessions${params.toString() ? `?${params.toString()}` : ''}`);
    renderSessionList(sessions);
  } catch (error) {
    console.error('Не удалось загрузить сессии', error);
  }
}

function renderSessionList(sessions) {
  if (!Array.isArray(sessions) || !sessions.length) {
    sessionsList.innerHTML = '<li>Сессий не найдено.</li>';
    return;
  }

  sessionsList.innerHTML = sessions
    .map(
      (session) => `
        <li class="session-card ${activeSessionId === session.id ? 'active' : ''}" data-session-id="${session.id}">
          <strong>${session.user_id}</strong>
          <span>${new Date(session.created_at).toLocaleString()}</span>
          <span>Lang: ${session.language.toUpperCase()} • Mode: ${session.mode}</span>
          <span>Status: ${session.status}</span>
        </li>
      `,
    )
    .join('');

  sessionsList.querySelectorAll('.session-card').forEach((card) => {
    card.addEventListener('click', async (event) => {
      const sessionId = event.currentTarget.dataset.sessionId;
      try {
        const session = await api(`/onboarding/sessions/${sessionId}`);
        setSession(session);
        goToStep(Math.max(1, deriveUnlockedStep(session)));
      } catch (error) {
        alert(`Не удалось загрузить сессию: ${error.message}`);
      }
    });
  });
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.textContent = 'Браузер не поддерживает Web Speech API. Используйте ручной ввод.';
    startVoiceBtn.disabled = true;
    return null;
  }
  const recognitionInstance = new SpeechRecognition();
  recognitionInstance.lang = document.getElementById('language').value === 'en' ? 'en-US' : 'ru-RU';
  recognitionInstance.interimResults = true;
  recognitionInstance.continuous = true;
  recognitionInstance.onresult = (event) => {
    let transcript = '';
    for (const result of event.results) {
      transcript += result[0].transcript;
    }
    voiceTranscript.value = transcript;
  };
  recognitionInstance.onerror = (event) => {
    voiceStatus.textContent = `Ошибка распознавания: ${event.error}`;
    stopRecording();
  };
  recognitionInstance.onend = () => {
    isRecognizing = false;
    startVoiceBtn.disabled = false;
    stopVoiceBtn.disabled = true;
  };
  return recognitionInstance;
}

async function startRecording() {
  if (!activeSessionId) {
    alert('Сначала создайте сессию.');
    return;
  }

  if (!recognition) {
    recognition = initRecognition();
  }

  if (recognition && !isRecognizing) {
    recognition.start();
    isRecognizing = true;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);
    audioChunks = [];
    recordingStartedAt = Date.now();
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      if (!audioChunks.length) return;
      lastRecordingBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const elapsedMs = Date.now() - recordingStartedAt;
      lastRecordingDuration = elapsedMs / 1000;
      uploadAudioBtn.disabled = false;
      voiceStatus.textContent = 'Запись готова к отправке. Проверьте транскрипт и загрузите.';
      mediaStream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorder.start();
    startVoiceBtn.disabled = true;
    stopVoiceBtn.disabled = false;
    uploadAudioBtn.disabled = true;
    voiceStatus.textContent = 'Идёт запись и распознавание…';
  } catch (error) {
    voiceStatus.textContent = `Ошибка доступа к микрофону: ${error.message}`;
  }
}

function stopRecording() {
  if (recognition && isRecognizing) {
    recognition.stop();
  }
  isRecognizing = false;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  startVoiceBtn.disabled = false;
  stopVoiceBtn.disabled = true;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Не удалось преобразовать аудио.'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function uploadRecording() {
  if (!activeSessionId || !lastRecordingBlob) {
    alert('Нет записи для отправки.');
    return;
  }

  try {
    const base64 = await blobToBase64(lastRecordingBlob);
    const transcript = voiceTranscript.value.trim() || null;
    const session = await api(`/onboarding/sessions/${activeSessionId}/voice-input`, {
      method: 'POST',
      body: JSON.stringify({
        audio_base64: base64,
        audio_format: 'webm',
        duration_seconds: lastRecordingDuration,
        transcript,
      }),
    });
    voiceStatus.textContent = 'Запись отправлена и проанализирована.';
    lastRecordingBlob = null;
    uploadAudioBtn.disabled = true;
    voiceTranscript.value = '';
    setSession(session);
  } catch (error) {
    voiceStatus.textContent = `Ошибка загрузки: ${error.message}`;
  }
}

function setupEventListeners() {
  stepButtons.forEach((button, index) => {
    button.addEventListener('click', () => goToStep(index));
  });

  sessionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      user_id: document.getElementById('user-id').value.trim(),
      industry: document.getElementById('industry').value.trim() || null,
      language: document.getElementById('language').value,
      mode: document.getElementById('mode').value,
      policy_consent: document.getElementById('policy-consent').checked,
      voice_consent: document.getElementById('voice-consent').checked,
    };

    try {
      const session = await api('/onboarding/sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      sessionStatus.textContent = `Сессия создана: ${session.id}`;
      setSession(session);
      goToStep(1);
    } catch (error) {
      sessionStatus.textContent = `Ошибка: ${error.message}`;
    }
  });

  startVoiceBtn.addEventListener('click', startRecording);
  stopVoiceBtn.addEventListener('click', stopRecording);
  uploadAudioBtn.addEventListener('click', uploadRecording);

  sendTranscriptBtn.addEventListener('click', async () => {
    if (!activeSessionId) {
      alert('Сначала создайте сессию.');
      return;
    }
    const text = voiceTranscript.value.trim();
    if (!text) {
      alert('Нет текста для отправки.');
      return;
    }
    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/text-input`, {
        method: 'POST',
        body: JSON.stringify({ text, source: 'voice' }),
      });
      voiceStatus.textContent = 'Транскрипт отправлен.';
      voiceTranscript.value = '';
      setSession(session);
    } catch (error) {
      voiceStatus.textContent = `Ошибка: ${error.message}`;
    }
  });

  document.getElementById('summary-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeSessionId) return;
    const role = document.getElementById('summary-role').value.trim();
    const goals = document
      .getElementById('summary-goals')
      .value.split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const barriers = document
      .getElementById('summary-barriers')
      .value.split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const currentState = document.getElementById('summary-state').value.trim();

    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/summary`, {
        method: 'PATCH',
        body: JSON.stringify({ role, goals, barriers, current_state: currentState }),
      });
      setSession(session);
    } catch (error) {
      alert(`Не удалось обновить резюме: ${error.message}`);
    }
  });

  document.getElementById('roadmap-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeSessionId) return;
    const horizon = Number(document.getElementById('roadmap-horizon').value);
    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/generate-roadmap`, {
        method: 'POST',
        body: JSON.stringify({ time_horizon_months: horizon }),
      });
      setSession(session);
      goToStep(3);
    } catch (error) {
      alert(`Не удалось построить roadmap: ${error.message}`);
    }
  });

  document.getElementById('checklist-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeSessionId) return;
    const horizon = Number(document.getElementById('checklist-horizon').value);
    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/generate-checklist`, {
        method: 'POST',
        body: JSON.stringify({ time_horizon_months: horizon }),
      });
      setSession(session);
      goToStep(4);
    } catch (error) {
      alert(`Не удалось построить чек-лист: ${error.message}`);
    }
  });

  voiceCommandForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeSessionId) return;
    const commandInput = document.getElementById('voice-command');
    const command = commandInput.value.trim();
    if (!command) {
      alert('Введите голосовую команду.');
      return;
    }
    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/voice-edit`, {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
      commandInput.value = '';
      setSession(session);
    } catch (error) {
      alert(`Команда не применена: ${error.message}`);
    }
  });

  document.getElementById('complete-session').addEventListener('click', async () => {
    if (!activeSessionId) return;
    const notes = document.getElementById('completion-notes').value.trim();
    try {
      const session = await api(`/onboarding/sessions/${activeSessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      setSession(session);
      goToStep(6);
      alert('Онбординг завершён. Readiness зафиксирован.');
    } catch (error) {
      alert(`Не удалось завершить: ${error.message}`);
    }
  });

  document.getElementById('delete-session').addEventListener('click', async () => {
    if (!activeSessionId) return;
    const reason = prompt('Укажите причину удаления (опционально):', '');
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    try {
      await api(`/onboarding/sessions/${activeSessionId}${params}`, { method: 'DELETE' });
      alert('Сессия удалена.');
      activeSessionId = null;
      activeSession = null;
      maxUnlockedStep = 0;
      updateStepAvailability();
      goToStep(0);
      setSession(null);
      loadSessions();
    } catch (error) {
      alert(`Не удалось удалить: ${error.message}`);
    }
  });

  filterForm.addEventListener('change', () => loadSessions());
  refreshSessionsBtn.addEventListener('click', () => loadSessions());
}

function init() {
  updateStepAvailability();
  setupEventListeners();
  loadSessions();
  setInterval(refreshTimeline, 8000);
}

init();
