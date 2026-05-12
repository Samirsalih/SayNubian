import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icon, RecordRing, LiveWaveform, Waveform, NubianStrip } from '../lib/primitives.jsx';
import { useRecorder, playAudio } from '../lib/audio.js';
import { DIALECTS } from '../lib/data.js';
import {
  newId, emptyEntry, saveEntry, listEntries, getAudio, deleteEntry,
  clearAll, stats, extFromMime,
} from '../lib/adminDB.js';
import {
  isPasscodeSet, setPasscode, checkPasscode,
  startSession, isSessionValid, endSession,
} from '../lib/adminAuth.js';

const CATEGORIES = [
  '', 'family members', 'body', 'food', 'animal', 'plant', 'time',
  'place', 'feelings', 'colors', 'action', 'thing', 'phrase',
];

export default function Admin({ onExit }) {
  const [authed, setAuthed] = useState(() => isSessionValid());

  if (!authed) {
    return <AdminLock onUnlock={() => setAuthed(true)} onExit={onExit} />;
  }
  return <AdminMain onExit={onExit} onLogout={() => { endSession(); setAuthed(false); }} />;
}

/* ── Lock screen ──────────────────────────────────────────── */
function AdminLock({ onUnlock, onExit }) {
  const [setup] = useState(() => !isPasscodeSet());
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(''); setBusy(true);
    try {
      if (setup) {
        if (code.length < 4) throw new Error('Use at least 4 characters.');
        if (code !== confirm) throw new Error('Passcodes do not match.');
        await setPasscode(code);
        onUnlock();
      } else {
        const ok = await checkPasscode(code);
        if (!ok) throw new Error('Wrong passcode.');
        startSession();
        onUnlock();
      }
    } catch (e) {
      setErr(e.message || 'Failed.');
    } finally { setBusy(false); }
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--hero-1), var(--hero-3))',
            color: 'white', margin: '0 auto 12px',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-script)', fontSize: 32,
          }}>ⲛ</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>
            {setup ? 'Set admin passcode' : 'Admin lock'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.4 }}>
            {setup
              ? 'Pick a passcode for the admin tool on this device. Saved locally — no account required.'
              : 'Enter your passcode to access the recording tool.'}
          </p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="Passcode"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !setup && submit()}
          style={inputStyle()}
        />
        {setup && (
          <input
            type="password"
            placeholder="Confirm passcode"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ ...inputStyle(), marginTop: 10 }}
          />
        )}

        {err && (
          <div style={{ marginTop: 10, color: 'var(--bad)', fontSize: 13, textAlign: 'center' }}>{err}</div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          style={{ ...btnPrimary(), marginTop: 16, opacity: busy ? 0.6 : 1 }}
        >
          {setup ? 'Set passcode and enter' : 'Unlock'}
        </button>

        <button onClick={onExit} style={{ ...btnGhost(), marginTop: 8 }}>
          Back to app
        </button>
      </div>
    </div>
  );
}

/* ── Main admin (list + bottom bar) ───────────────────────── */
function AdminMain({ onExit, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [info, setInfo] = useState({ count: 0, withAudio: 0, audioBytes: 0 });
  const [editing, setEditing] = useState(null);   // entry object or null
  const [toast, setToast] = useState('');

  async function refresh() {
    setEntries(await listEntries());
    setInfo(await stats());
  }

  useEffect(() => { refresh(); }, []);

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function handleSave(entry, blob) {
    await saveEntry(entry, blob);
    await refresh();
    setEditing(null);
    flash(entry.nub || entry.en ? `Saved "${entry.nub || entry.en}"` : 'Entry saved');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry and its recording?')) return;
    await deleteEntry(id);
    await refresh();
  }

  async function handleClearAll() {
    if (!confirm(`Wipe all ${info.count} admin entries from this device? Cannot be undone.`)) return;
    await clearAll();
    await refresh();
  }

  async function handleExport() {
    try {
      flash('Building ZIP…');
      const { downloadZip } = await import('../lib/adminExport.js');
      const fname = await downloadZip();
      flash(`Exported ${fname}`);
    } catch (e) {
      flash('Export failed: ' + (e.message || e));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <button onClick={onExit} aria-label="Exit admin" style={iconBtn()}>
          <Icon name="arrow-left" size={20} color="var(--text-2)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>Admin tool</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {info.count} entries · {info.withAudio} recordings · {(info.audioBytes / 1024 / 1024).toFixed(1)} MB
          </div>
        </div>
        <button onClick={onLogout} aria-label="Lock" style={iconBtn()}>
          <Icon name="lock" size={18} color="var(--text-3)" />
        </button>
      </div>

      {/* Body — list of entries */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <button onClick={() => setEditing(emptyEntry())} style={{
          width: '100%', padding: 18, borderRadius: 18,
          background: 'var(--accent)', color: 'white', border: 'none',
          fontSize: 16, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <Icon name="mic" size={20} color="white" />
          New recording
        </button>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
            <NubianStrip height={10} />
            <p style={{ marginTop: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18 }}>
              No entries yet.
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Tap "New recording" to capture your first word.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(e => (
              <EntryRow
                key={e.id}
                entry={e}
                onEdit={() => setEditing(e)}
                onDelete={() => handleDelete(e.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <button onClick={handleExport} disabled={info.count === 0} style={{
          ...btnPrimary(), flex: 2,
          opacity: info.count === 0 ? 0.4 : 1,
          cursor: info.count === 0 ? 'not-allowed' : 'pointer',
        }}>
          <Icon name="arrow-right" size={14} color="white" />
          Export ZIP
        </button>
        <button onClick={handleClearAll} disabled={info.count === 0} style={{
          ...btnGhost(), flex: 1,
          opacity: info.count === 0 ? 0.4 : 1,
        }}>
          Clear all
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 16px', borderRadius: 999,
          background: 'var(--text)', color: 'var(--bg)',
          fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
          boxShadow: 'var(--shadow-md)',
        }}>{toast}</div>
      )}

      {/* Entry sheet */}
      {editing && (
        <EntrySheet
          entry={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ── Single entry row ─────────────────────────────────────── */
function EntryRow({ entry, onEdit, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  async function togglePlay(e) {
    e.stopPropagation();
    if (playing) {
      audioRef.current?.pause(); audioRef.current = null; setPlaying(false); return;
    }
    const blob = await getAudio(entry.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setPlaying(true);
    audioRef.current = playAudio(url, {
      onEnd: () => { URL.revokeObjectURL(url); audioRef.current = null; setPlaying(false); },
    });
  }

  return (
    <button onClick={onEdit} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 16,
      background: 'var(--surface)', border: '1px solid var(--border)',
      textAlign: 'left',
    }}>
      {entry.has_audio ? (
        <button onClick={togglePlay} style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: playing ? 'var(--accent)' : 'var(--accent-soft)',
          display: 'grid', placeItems: 'center', border: 'none',
        }}>
          <Icon name={playing ? 'pause' : 'play'} size={14} color={playing ? 'white' : 'var(--accent)'} />
        </button>
      ) : (
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: 'var(--surface-2)', border: '1px dashed var(--border-2)',
          display: 'grid', placeItems: 'center', color: 'var(--text-3)',
        }}>
          <Icon name="mic" size={14} color="var(--text-3)" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          {entry.script && (
            <span className="nubian" style={{ fontSize: 17, color: 'var(--text)' }}>{entry.script}</span>
          )}
          {entry.nub && (
            <span style={{ fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)' }}>{entry.nub}</span>
          )}
          {!entry.script && !entry.nub && (
            <span style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>(no romanization)</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 8 }}>
          {entry.en && <span>{entry.en}</span>}
          {entry.ar && <span style={{ direction: 'rtl' }}>{entry.ar}</span>}
        </div>
      </div>

      <span style={{
        fontSize: 9, padding: '3px 6px', borderRadius: 6,
        background: 'var(--surface-2)', color: 'var(--text-3)',
        fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>{entry.dialect || 'no dialect'}</span>

      <button onClick={e => { e.stopPropagation(); onDelete(); }} aria-label="Delete" style={iconBtn()}>
        <Icon name="x" size={16} color="var(--text-3)" />
      </button>
    </button>
  );
}

/* ── Entry sheet (new/edit) ───────────────────────────────── */
function EntrySheet({ entry: initial, onCancel, onSave }) {
  const [entry, setEntry] = useState(initial);
  const [existingAudioUrl, setExistingAudioUrl] = useState(null);
  const { recording, audioUrl, audioBlob, start, stop, reset } = useRecorder();
  const [playingExisting, setPlayingExisting] = useState(false);
  const [playingNew, setPlayingNew] = useState(false);
  const audioRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Load existing audio (when editing)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (initial.has_audio) {
        const blob = await getAudio(initial.id);
        if (alive && blob) setExistingAudioUrl(URL.createObjectURL(blob));
      }
    })();
    return () => {
      alive = false;
      if (existingAudioUrl) URL.revokeObjectURL(existingAudioUrl);
      audioRef.current?.pause();
    };
  }, []);

  function set(field, val) { setEntry(e => ({ ...e, [field]: val })); }

  function stopAll() {
    audioRef.current?.pause(); audioRef.current = null;
    setPlayingExisting(false); setPlayingNew(false);
  }

  function playUrl(url, which) {
    stopAll();
    if (which === 'existing') setPlayingExisting(true);
    if (which === 'new') setPlayingNew(true);
    audioRef.current = playAudio(url, {
      onEnd: () => { stopAll(); },
    });
  }

  async function handleSave() {
    setBusy(true);
    try {
      let durationSec = entry.duration_sec;
      const blobToSave = audioBlob; // only set when a new recording was made

      if (blobToSave) {
        durationSec = await measureDuration(blobToSave);
      }
      const rec = {
        ...entry,
        duration_sec: durationSec ?? entry.duration_sec ?? null,
      };
      await onSave(rec, blobToSave);
    } catch (e) {
      alert('Save failed: ' + (e.message || e));
    } finally { setBusy(false); }
  }

  const showExisting = !!existingAudioUrl && !audioBlob;
  const showNew = !!audioBlob;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'stretch', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: 'var(--bg)',
        width: '100%', maxWidth: 520, maxHeight: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* sheet header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        }}>
          <button onClick={onCancel} aria-label="Cancel" style={iconBtn()}>
            <Icon name="x" size={20} color="var(--text-2)" />
          </button>
          <div style={{ flex: 1, fontWeight: 800 }}>{initial.has_audio ? 'Edit entry' : 'New entry'}</div>
          <button onClick={handleSave} disabled={busy} style={{ ...btnPrimary(), padding: '8px 14px', width: 'auto', opacity: busy ? 0.5 : 1 }}>
            Save
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {/* Recording panel */}
          <div style={{
            padding: 16, borderRadius: 18,
            background: showNew ? 'var(--ok-soft)' : 'var(--surface-2)',
            border: `1px solid ${showNew ? 'var(--ok)' : 'var(--border)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <LiveWaveform listening={recording} height={48} />
            <div style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.14em',
              color: 'var(--text-3)',
            }}>
              {recording ? 'RECORDING...' : (showNew ? 'NEW RECORDING' : showExisting ? 'EXISTING RECORDING' : 'TAP TO RECORD')}
            </div>

            <RecordRing size={66} listening={recording} onClick={() => recording ? stop() : start()} />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {showNew && (
                <button onClick={() => playUrl(audioUrl, 'new')} style={btnGhostSmall()}>
                  <Icon name={playingNew ? 'pause' : 'play'} size={12} color="var(--text-2)" /> Play new
                </button>
              )}
              {showExisting && (
                <button onClick={() => playUrl(existingAudioUrl, 'existing')} style={btnGhostSmall()}>
                  <Icon name={playingExisting ? 'pause' : 'play'} size={12} color="var(--text-2)" /> Play saved
                </button>
              )}
              {showNew && (
                <button onClick={() => { reset(); stopAll(); }} style={btnGhostSmall()}>
                  <Icon name="x" size={12} color="var(--text-2)" /> Discard new
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Romanization (nub)" hint="e.g. fab, eeni, masha sirri">
              <input value={entry.nub} onChange={e => set('nub', e.target.value)} style={inputStyle()} placeholder="fab" />
            </Field>
            <Field label="Nubian script" hint="Coptic-derived characters, e.g. ⲫⲁ̄ⲡ">
              <input value={entry.script} onChange={e => set('script', e.target.value)} style={{ ...inputStyle(), fontFamily: 'var(--font-script)' }} placeholder="ⲫⲁ̄ⲡ" />
            </Field>
            <Field label="English">
              <input value={entry.en} onChange={e => set('en', e.target.value)} style={inputStyle()} placeholder="father" />
            </Field>
            <Field label="Arabic">
              <input value={entry.ar} onChange={e => set('ar', e.target.value)} style={{ ...inputStyle(), direction: 'rtl', textAlign: 'right' }} placeholder="أب" />
            </Field>

            <div style={{ display: 'flex', gap: 10 }}>
              <Field label="Category" style={{ flex: 1 }}>
                <select value={entry.category} onChange={e => set('category', e.target.value)} style={inputStyle()}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c || '— none —'}</option>)}
                </select>
              </Field>
              <Field label="Dialect" style={{ flex: 1 }}>
                <select value={entry.dialect} onChange={e => set('dialect', e.target.value)} style={inputStyle()}>
                  {DIALECTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Speaker id" hint="Anonymous label — same speaker should reuse the same id">
              <input value={entry.speaker_id} onChange={e => set('speaker_id', e.target.value)} style={inputStyle()} placeholder="speaker_001" />
            </Field>
            <Field label="Notes">
              <textarea
                value={entry.notes}
                onChange={e => set('notes', e.target.value)}
                rows={2}
                style={{ ...inputStyle(), height: 'auto', minHeight: 60, resize: 'vertical' }}
                placeholder="Consent, recording conditions, anything worth flagging…"
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <div style={{
        fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
        letterSpacing: '0.14em', color: 'var(--text-3)', textTransform: 'uppercase',
      }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{hint}</div>}
    </label>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */
function measureDuration(blob) {
  return new Promise(resolve => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = URL.createObjectURL(blob);
    const finish = (val) => { URL.revokeObjectURL(audio.src); resolve(val); };
    audio.addEventListener('loadedmetadata', () => {
      // Safari reports Infinity until seeked
      const d = audio.duration;
      if (isFinite(d) && d > 0) finish(d);
      else {
        audio.currentTime = 1e9;
        audio.addEventListener('timeupdate', () => finish(audio.duration), { once: true });
        setTimeout(() => finish(null), 1500);
      }
    });
    audio.addEventListener('error', () => finish(null));
  });
}

/* ── Tiny inline styles to keep the file standalone ───────── */
function inputStyle() {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 12,
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
    outline: 'none',
  };
}
function btnPrimary() {
  return {
    width: '100%', padding: '12px 16px', borderRadius: 14,
    background: 'var(--accent)', color: 'white', border: 'none',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
}
function btnGhost() {
  return {
    width: '100%', padding: '12px 16px', borderRadius: 14,
    background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };
}
function btnGhostSmall() {
  return {
    padding: '6px 10px', borderRadius: 999,
    background: 'var(--surface)', border: '1px solid var(--border)',
    color: 'var(--text-2)', fontSize: 12, fontWeight: 700,
    display: 'inline-flex', alignItems: 'center', gap: 6,
  };
}
function iconBtn() {
  return {
    width: 36, height: 36, borderRadius: 10,
    background: 'transparent', border: 'none',
    display: 'grid', placeItems: 'center', cursor: 'pointer',
  };
}
