/* adminAuth.js — passcode gate for the local admin tool.

   The passcode is stored as a SHA-256 hex digest in localStorage. This
   gates the UI; it does NOT encrypt the IndexedDB data. Anyone with
   developer-tools access on this device could read the IDB directly.
   For solo local data collection that's fine; if multi-device or
   multi-contributor access is needed, swap this for Supabase Auth.   */

const HASH_KEY = 'saynubian.admin.passcode_hash';
const SESSION_KEY = 'saynubian.admin.session_expires';
const SESSION_MS = 24 * 60 * 60 * 1000;  // 24 hours

async function sha256Hex(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isPasscodeSet() {
  try { return !!localStorage.getItem(HASH_KEY); } catch { return false; }
}

export async function setPasscode(plain) {
  if (!plain || plain.length < 4) throw new Error('Passcode must be at least 4 characters.');
  const hex = await sha256Hex(plain);
  localStorage.setItem(HASH_KEY, hex);
  startSession();
}

export async function checkPasscode(plain) {
  const hex = await sha256Hex(plain || '');
  const stored = localStorage.getItem(HASH_KEY) || '';
  return hex && stored && hex === stored;
}

export function startSession() {
  try { localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_MS)); } catch {}
}

export function isSessionValid() {
  try {
    const exp = Number(localStorage.getItem(SESSION_KEY) || '0');
    return exp > Date.now();
  } catch { return false; }
}

export function endSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export function resetEverything() {
  try {
    localStorage.removeItem(HASH_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
