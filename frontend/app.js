'use strict';

// ── 상수 ─────────────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8000/api';

// ── 상태 (모듈 스코프 변수) ──────────────────────────────────
let tasks = [];
let pollingTimer = null;
let pendingDeleteId = null;

// ── API ─────────────────────────────────────────────────────

async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('목록 조회 실패');
  tasks = await res.json();
  renderTasks();
}

async function createTask(data) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const msg = err.detail?.[0]?.msg ?? err.detail ?? '생성 실패';
    throw new Error(msg);
  }
  await fetchTasks();
}

async function updateTask(id, data) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('수정 실패');
  await fetchTasks();
}

async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('삭제 실패');
  await fetchTasks();
}

// ── 컴포넌트 ─────────────────────────────────────────────────

function StatusBadge(status) {
  const config = {
    todo:        { label: '예정',   cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    in_progress: { label: '진행중', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    done:        { label: '완료',   cls: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  };
  const { label, cls } = config[status] ?? config.todo;
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}">${label}</span>`;
}

function DueLabel(dueAt) {
  if (!dueAt) return '';
  const now  = new Date();
  const due  = new Date(dueAt);
  const diff = Math.floor((due - now) / 86_400_000);
  const pad  = n => String(n).padStart(2, '0');
  const time = `${pad(due.getHours())}:${pad(due.getMinutes())}`;
  const day  = diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  const cls  = diff < 0 ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500';
  return `<span class="text-xs ${cls}">${day} ${time}</span>`;
}

function TaskCard(task) {
  return `
    <div class="task-card bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg
                px-4 py-3 flex items-center justify-between gap-3 cursor-pointer
                hover:shadow-xl transition-shadow min-h-[64px]"
         data-id="${task.id}" role="button" tabindex="0" aria-label="태스크 수정: ${escapeHtml(task.title)}">
      <div class="flex items-center gap-3 min-w-0">
        ${StatusBadge(task.status)}
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${escapeHtml(task.title)}</p>
          <div class="mt-0.5 flex items-center gap-2 flex-wrap">
            ${task.due_at ? DueLabel(task.due_at) : ''}
            <span class="text-xs text-gray-300 dark:text-gray-600">${FormatRelativeTime(task.created_at)}</span>
          </div>
        </div>
      </div>
      <button class="delete-btn flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center
                     rounded-xl text-gray-300 hover:text-red-500 dark:hover:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              data-id="${task.id}" aria-label="삭제">🗑</button>
    </div>`;
}

// ── 렌더링 ───────────────────────────────────────────────────

function renderTasks() {
  const container = document.getElementById('taskList');
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-gray-300 dark:text-gray-700">
        <p class="text-5xl mb-3">📋</p>
        <p class="text-sm">태스크가 없습니다. 위 폼에서 추가해보세요.</p>
      </div>`;
    return;
  }
  container.innerHTML = tasks.map(TaskCard).join('');
  bindCardEvents();
}

function renderFetchError() {
  document.getElementById('taskList').innerHTML = `
    <div class="text-center py-12 text-red-400">
      <p class="text-sm">서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.</p>
    </div>`;
}

function bindCardEvents() {
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.delete-btn')) return;
      const task = tasks.find(t => t.id === parseInt(card.dataset.id));
      if (task) openModal(task);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.target.closest('.delete-btn')) card.click();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      pendingDeleteId = parseInt(btn.dataset.id);
      document.getElementById('deleteModal').classList.remove('hidden');
    });
  });
}

// ── 수정 모달 ────────────────────────────────────────────────

function openModal(task) {
  const modal = document.getElementById('editModal');
  document.getElementById('modalTitle').value       = task.title;
  document.getElementById('modalDescription').value = task.description ?? '';
  document.getElementById('modalStatus').value      = task.status;
  document.getElementById('modalDue').value         = task.due_at ? toLocalDatetimeInput(task.due_at) : '';
  document.getElementById('modalError').classList.add('hidden');
  document.getElementById('modalMeta').textContent =
    `생성 ${FormatRelativeTime(task.created_at)}` +
    (task.updated_at !== task.created_at ? `  ·  수정 ${FormatRelativeTime(task.updated_at)}` : '');
  modal.dataset.taskId = task.id;
  modal.classList.remove('hidden');
  document.getElementById('modalTitle').focus();
}

function closeModal() {
  document.getElementById('editModal').classList.add('hidden');
}

// ── 폴링 ─────────────────────────────────────────────────────

function startPolling() {
  pollingTimer = setInterval(async () => {
    try { await fetchTasks(); } catch (_) { /* 폴링 실패 시 무시 */ }
  }, 3000);
}

// ── 테마 ─────────────────────────────────────────────────────

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
}

function initThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
}

// ── 유틸 ─────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ISO 문자열 → 상대 시간 (예: "5분 전", "어제", "2026. 5. 14.")
const _rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });
const _dtf = new Intl.DateTimeFormat('ko', { year: 'numeric', month: 'short', day: 'numeric' });

function FormatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const diffSec  = Math.round((new Date(isoStr) - Date.now()) / 1000);
  const diffMin  = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay  = Math.round(diffHour / 24);

  if (Math.abs(diffSec)  <  60) return _rtf.format(diffSec,  'second');
  if (Math.abs(diffMin)  <  60) return _rtf.format(diffMin,  'minute');
  if (Math.abs(diffHour) <  24) return _rtf.format(diffHour, 'hour');
  if (Math.abs(diffDay)  <  30) return _rtf.format(diffDay,  'day');
  return _dtf.format(new Date(isoStr));
}

// UTC ISO 문자열 → datetime-local 입력값 (로컬 시각)
function toLocalDatetimeInput(isoStr) {
  const d   = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local 입력값 → UTC ISO 문자열
function toUTCIso(localStr) {
  return localStr ? new Date(localStr).toISOString() : null;
}

// ── 이벤트 ───────────────────────────────────────────────────

function initEventListeners() {
  // 테마 토글
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // 태스크 추가 폼
  document.getElementById('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const title   = document.getElementById('titleInput').value.trim();
    const due     = document.getElementById('dueInput').value;
    const status  = document.getElementById('statusSelect').value;
    const errEl   = document.getElementById('formError');

    if (!title) {
      errEl.textContent = '제목을 입력해주세요.';
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');

    try {
      await createTask({ title, status, due_at: toUTCIso(due) });
      document.getElementById('addForm').reset();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // 수정 모달 — 저장
  document.getElementById('modalSaveBtn').addEventListener('click', async () => {
    const id          = parseInt(document.getElementById('editModal').dataset.taskId);
    const title       = document.getElementById('modalTitle').value.trim();
    const description = document.getElementById('modalDescription').value;
    const status      = document.getElementById('modalStatus').value;
    const due         = document.getElementById('modalDue').value;
    const errEl       = document.getElementById('modalError');

    if (!title) {
      errEl.textContent = '제목을 입력해주세요.';
      errEl.classList.remove('hidden');
      return;
    }

    try {
      await updateTask(id, { title, description, status, due_at: toUTCIso(due) });
      closeModal();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // 수정 모달 — 닫기 (X 버튼, 취소 버튼, 오버레이 클릭)
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('editModal').addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeModal();
  });

  // 삭제 확인 모달
  document.getElementById('deleteConfirmBtn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    pendingDeleteId = null;
    document.getElementById('deleteModal').classList.add('hidden');
    await deleteTask(id);
  });

  document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    pendingDeleteId = null;
    document.getElementById('deleteModal').classList.add('hidden');
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeModal();
    document.getElementById('deleteModal').classList.add('hidden');
  });
}

// ── 초기화 ───────────────────────────────────────────────────

async function init() {
  initThemeIcon();
  initEventListeners();
  try {
    await fetchTasks();
  } catch (_) {
    renderFetchError();
  }
  startPolling();
}

init();
