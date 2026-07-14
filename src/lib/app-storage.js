const API_PATH = '/.netlify/functions/app-state';
const LOCAL_PREFIX = 'nexdu-fallback-';

function localKey(key) {
  return `${LOCAL_PREFIX}${key}`;
}

function readLocal(key) {
  try {
    const value = window.localStorage.getItem(localKey(key));
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(localKey(key), JSON.stringify(value));
  } catch {
    // Server persistence remains the source of truth if local storage is full.
  }
}

export async function loadSharedState(key) {
  try {
    const response = await fetch(`${API_PATH}?key=${encodeURIComponent(key)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.value) writeLocal(key, payload.value);
    return payload.value ?? readLocal(key);
  } catch {
    return readLocal(key);
  }
}

export async function saveSharedState(key, value) {
  writeLocal(key, value);
  const response = await fetch(`${API_PATH}?key=${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export function loadSession(key) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveSession(key, session) {
  try {
    if (session) window.localStorage.setItem(key, JSON.stringify(session));
    else window.localStorage.removeItem(key);
  } catch {
    // A blocked local storage should not prevent the app from running.
  }
}
