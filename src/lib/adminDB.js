/* adminDB.js — IndexedDB wrapper for the local-only admin tool.

   Two object stores:
   - `entries` (keyPath: 'id')  — metadata records {id, nub, script, en, ar, …}
   - `audio`   (keyPath: 'id')  — { id, blob, mime }

   Both keyed by the same uuid so an entry and its audio blob travel together.
   Nothing here syncs anywhere — it's all in the browser. Export to ZIP via
   the export() helper. Clearing site data wipes everything.                */

const DB_NAME = 'saynubian-admin';
const DB_VERSION = 1;
const STORE_ENTRIES = 'entries';
const STORE_AUDIO = 'audio';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        const s = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
        s.createIndex('created_at', 'created_at');
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(db, stores, mode = 'readonly') {
  return db.transaction(stores, mode);
}

function awaitReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyEntry() {
  return {
    id: newId(),
    created_at: new Date().toISOString(),
    nub: '',
    script: '',
    en: '',
    ar: '',
    category: '',
    dialect: 'nobiin',
    speaker_id: '',
    notes: '',
    duration_sec: null,
    mime: '',
    has_audio: false,
  };
}

export async function saveEntry(entry, blob /* optional */) {
  const db = await openDB();
  const stores = blob ? [STORE_ENTRIES, STORE_AUDIO] : [STORE_ENTRIES];
  const t = tx(db, stores, 'readwrite');
  const rec = { ...entry, updated_at: new Date().toISOString() };
  if (blob) {
    rec.has_audio = true;
    rec.mime = blob.type || 'audio/webm';
    await awaitReq(t.objectStore(STORE_AUDIO).put({ id: entry.id, blob, mime: rec.mime }));
  }
  await awaitReq(t.objectStore(STORE_ENTRIES).put(rec));
  return rec;
}

export async function listEntries() {
  const db = await openDB();
  const t = tx(db, [STORE_ENTRIES]);
  const arr = await awaitReq(t.objectStore(STORE_ENTRIES).getAll());
  arr.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  return arr;
}

export async function getEntry(id) {
  const db = await openDB();
  const t = tx(db, [STORE_ENTRIES]);
  return awaitReq(t.objectStore(STORE_ENTRIES).get(id));
}

export async function getAudio(id) {
  const db = await openDB();
  const t = tx(db, [STORE_AUDIO]);
  const rec = await awaitReq(t.objectStore(STORE_AUDIO).get(id));
  return rec ? rec.blob : null;
}

export async function deleteEntry(id) {
  const db = await openDB();
  const t = tx(db, [STORE_ENTRIES, STORE_AUDIO], 'readwrite');
  await awaitReq(t.objectStore(STORE_ENTRIES).delete(id));
  await awaitReq(t.objectStore(STORE_AUDIO).delete(id));
}

export async function clearAll() {
  const db = await openDB();
  const t = tx(db, [STORE_ENTRIES, STORE_AUDIO], 'readwrite');
  await awaitReq(t.objectStore(STORE_ENTRIES).clear());
  await awaitReq(t.objectStore(STORE_AUDIO).clear());
}

export async function stats() {
  const db = await openDB();
  const t = tx(db, [STORE_ENTRIES, STORE_AUDIO]);
  const entries = await awaitReq(t.objectStore(STORE_ENTRIES).getAll());
  const audios = await awaitReq(t.objectStore(STORE_AUDIO).getAll());
  const audioBytes = audios.reduce((n, a) => n + (a.blob?.size || 0), 0);
  return { count: entries.length, withAudio: entries.filter(e => e.has_audio).length, audioBytes };
}

/* Extension from blob mime — best-effort, just for filenames. */
export function extFromMime(mime = '') {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4'))  return 'm4a';
  if (mime.includes('mpeg')) return 'mp3';
  if (mime.includes('aac'))  return 'aac';
  if (mime.includes('wav'))  return 'wav';
  if (mime.includes('ogg'))  return 'ogg';
  return 'bin';
}
