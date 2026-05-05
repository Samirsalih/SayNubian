import React, { useState } from 'react';
import { Icon, Waveform } from '../lib/primitives.jsx';
import { DICT } from '../lib/data.js';
import { speak, cancelSpeech } from '../lib/audio.js';

export default function Words() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [playing, setPlaying] = useState(null);

  function handlePlay(w) {
    if (playing === w.en) {
      cancelSpeech();
      setPlaying(null);
      return;
    }
    setPlaying(w.en);
    speak(w.nub, { onEnd: () => setPlaying(p => (p === w.en ? null : p)) });
  }

  const filtered = DICT.filter(d => {
    if (filter !== 'all' && d.cat !== filter) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return d.en.toLowerCase().includes(ql) || d.nub.toLowerCase().includes(ql);
  });

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--accent)', fontWeight: 700 }}>DICTIONARY</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
          2,000+ words<br/><em style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>at your fingertips.</em>
        </h1>
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
            placeholder="Search Nubian, English…"
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
        {filtered.map((w, i) => (
          <div key={w.en} className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 14px', borderRadius: 18,
            background: 'var(--surface)', border: '1px solid var(--border)',
            animationDelay: `${i * 30}ms`,
          }}>
            <button onClick={() => handlePlay(w)} style={{
              width: 42, height: 42, borderRadius: 14,
              background: playing === w.en ? 'var(--accent)' : 'var(--accent-soft)',
              color: playing === w.en ? 'white' : 'var(--accent-fg)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name={playing === w.en ? 'pause' : 'play'} size={16} color={playing === w.en ? 'white' : 'var(--accent)'} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="nubian" style={{ fontSize: 18, color: 'var(--text)' }}>{w.script}</span>
                <span style={{ fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)' }}>{w.nub}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{w.en}</div>
            </div>
            <Waveform seed={w.en.length * 5} bars={14} height={22} progress={playing === w.en ? 0.5 : 0} active={playing === w.en} color="var(--text-3)" />
            <span style={{
              fontSize: 9, padding: '3px 6px', borderRadius: 6,
              background: 'var(--surface-2)', color: 'var(--text-3)',
              fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>{w.cat}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No matches.</div>
        )}
      </div>
    </div>
  );
}
