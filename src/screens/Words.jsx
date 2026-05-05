import React, { useState, useEffect, useMemo } from 'react';
import { Icon, Waveform } from '../lib/primitives.jsx';
import { DICT as STARTER_DICT } from '../lib/data.js';
import { speak, cancelSpeech } from '../lib/audio.js';

const DICTIONARY_URL = 'data/dictionary.json';

export default function Words() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [playing, setPlaying] = useState(null);
  const [entries, setEntries] = useState(null);   // null = loading; array once loaded
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState(null);

  // Lazy-load the full dictionary on mount; show STARTER_DICT meanwhile
  useEffect(() => {
    let alive = true;
    fetch(DICTIONARY_URL)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (!alive) return;
        setEntries(d.entries || []);
        setMeta({
          dialect: d.dialect,
          source: d.source,
          total: d.total ?? (d.entries?.length || 0),
        });
      })
      .catch(e => {
        if (!alive) return;
        // Fall back to the small starter dict so the screen is never empty
        setEntries(STARTER_DICT);
        setErr(e.message || 'Failed to load full dictionary');
      });
    return () => { alive = false; };
  }, []);

  function handlePlay(w) {
    if (playing === keyOf(w)) {
      cancelSpeech();
      setPlaying(null);
      return;
    }
    setPlaying(keyOf(w));
    speak(w.nub, { onEnd: () => setPlaying(p => (p === keyOf(w) ? null : p)) });
  }

  const list = entries ?? STARTER_DICT;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return list.filter(d => {
      if (filter === 'noun')   return d.cat === 'noun' || /thing|family|body|food|place|animal|insect|plant|building/.test(d.cat || '');
      if (filter === 'verb')   return d.cat === 'verb' || /action|go|cooking/.test(d.cat || '');
      if (filter === 'adj')    return d.cat === 'adj' || /feeling|color/.test(d.cat || '');
      if (filter === 'phrase') return d.cat === 'phrase';
      // 'all'
      if (!ql) return true;
      return (d.en || '').toLowerCase().includes(ql)
          || (d.nub || '').toLowerCase().includes(ql)
          || (d.script || '').includes(q.trim())
          || (d.ar || '').includes(q.trim());
    }).filter(d => {
      if (!ql || filter !== 'all') {
        if (!ql) return true;
        return (d.en || '').toLowerCase().includes(ql)
            || (d.nub || '').toLowerCase().includes(ql)
            || (d.script || '').includes(q.trim())
            || (d.ar || '').includes(q.trim());
      }
      return true;
    });
  }, [list, q, filter]);

  // Cap rendering for perf — show first 200 with a "showing N of M" footer
  const RENDER_CAP = 200;
  const visible = filtered.slice(0, RENDER_CAP);

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--accent)', fontWeight: 700 }}>DICTIONARY</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
          {meta?.total ? meta.total.toLocaleString() : '—'} words<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>at your fingertips.</em>
        </h1>
        {meta && (
          <div style={{
            marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent-fg)',
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
          }}>
            <Icon name="globe" size={11} color="var(--accent-fg)" />
            {meta.dialect?.toUpperCase() || 'NUBIAN'}
          </div>
        )}
        {err && (
          <div style={{
            marginTop: 8, fontSize: 11, color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}>(showing starter set — {err})</div>
        )}
      </div>

      <div style={{ padding: 16, position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderRadius: 16,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <Icon name="search" size={18} color="var(--text-3)" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search Nubian, English, Arabic…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15 }}
          />
          {q && <button onClick={() => setQ('')}><Icon name="x" size={16} color="var(--text-3)" /></button>}
        </div>

        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
          {[['all', 'All'], ['noun', 'Nouns'], ['verb', 'Verbs'], ['adj', 'Adjectives'], ['phrase', 'Phrases']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: filter === k ? 'var(--text)' : 'var(--surface)',
              color: filter === k ? 'var(--bg)' : 'var(--text-2)',
              border: `1px solid ${filter === k ? 'var(--text)' : 'var(--border)'}`,
              flexShrink: 0,
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries === null && <Skeleton />}
        {visible.map((w, i) => {
          const k = keyOf(w);
          const active = playing === k;
          return (
            <div key={k + i} className="fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px', borderRadius: 18,
              background: 'var(--surface)', border: '1px solid var(--border)',
              animationDelay: `${Math.min(i, 30) * 20}ms`,
            }}>
              <button onClick={() => handlePlay(w)} style={{
                width: 42, height: 42, borderRadius: 14,
                background: active ? 'var(--accent)' : 'var(--accent-soft)',
                color: active ? 'white' : 'var(--accent-fg)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name={active ? 'pause' : 'play'} size={16} color={active ? 'white' : 'var(--accent)'} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span className="nubian" style={{ fontSize: 18, color: 'var(--text)' }}>{w.script}</span>
                  {w.nub && <span style={{ fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)' }}>{w.nub}</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  {w.en && <span>{w.en}</span>}
                  {w.ar && <span style={{ direction: 'rtl', fontFamily: 'serif' }}>{w.ar}</span>}
                </div>
              </div>
              <Waveform seed={(w.en || w.script || '?').length * 5} bars={14} height={22} progress={active ? 0.5 : 0} active={active} color="var(--text-3)" />
              {w.cat && (
                <span style={{
                  fontSize: 9, padding: '3px 6px', borderRadius: 6,
                  background: 'var(--surface-2)', color: 'var(--text-3)',
                  fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>{shortCat(w.cat)}</span>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && entries !== null && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No matches.</div>
        )}
        {filtered.length > RENDER_CAP && (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            Showing {RENDER_CAP} of {filtered.length}. Search to narrow.
          </div>
        )}
      </div>
    </div>
  );
}

function keyOf(w) {
  return (w.script || '') + '|' + (w.en || w.nub || '');
}

function shortCat(cat) {
  if (cat.length <= 8) return cat;
  return cat.split(/\s+|-/)[0];
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          padding: 14, borderRadius: 18,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          height: 64,
        }} />
      ))}
    </div>
  );
}
