import React, { useState } from 'react';
import { Icon, Waveform } from '../lib/primitives.jsx';
import { ALPHABET, DIALOGS } from '../lib/data.js';
import { speak, cancelSpeech, pronounce } from '../lib/audio.js';

export default function Sounds() {
  const [tab, setTab] = useState('alphabet');
  const [playGlyph, setPlayGlyph] = useState(null);
  const [playDialog, setPlayDialog] = useState(null);

  function handleGlyph(g) {
    if (playGlyph === g.glyph) {
      cancelSpeech();
      setPlayGlyph(null);
      return;
    }
    setPlayGlyph(g.glyph);
    pronounce(g, { onEnd: () => setPlayGlyph(p => (p === g.glyph ? null : p)) });
  }

  function handleDialog(d) {
    if (playDialog === d.id) {
      cancelSpeech();
      setPlayDialog(null);
      return;
    }
    setPlayDialog(d.id);
    speak('ma arrik?', { onEnd: () => setPlayDialog(p => (p === d.id ? null : p)) });
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--accent)', fontWeight: 700 }}>SOUNDS</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4 }}>
          The voice of<br/><em style={{ fontStyle: 'italic' }}>Nubia.</em>
        </h1>
      </div>

      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 6 }}>
        {[['alphabet', 'Alphabet'], ['dialogues', 'Dialogues']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: tab === k ? 'var(--text)' : 'var(--surface)',
            color: tab === k ? 'var(--bg)' : 'var(--text-2)',
            border: `1px solid ${tab === k ? 'var(--text)' : 'var(--border)'}`,
          }}>{l}</button>
        ))}
      </div>

      {tab === 'alphabet' && (
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>Tap any glyph to hear its sound.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {ALPHABET.map(g => {
              const active = playGlyph === g.glyph;
              return (
                <button key={g.glyph} onClick={() => handleGlyph(g)} style={{
                  aspectRatio: '1', borderRadius: 16,
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: 6, transition: 'all 200ms',
                  color: active ? 'white' : 'var(--text)',
                }}>
                  <div className="nubian" style={{ fontSize: 32, lineHeight: 1 }}>{g.glyph}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{g.sound}</div>
                </button>
              );
            })}
          </div>
          {playGlyph && (
            <div className="slide-up" style={{
              marginTop: 16, padding: 18, borderRadius: 20,
              background: 'var(--accent-soft)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div className="nubian" style={{ fontSize: 56, color: 'var(--accent-fg)', lineHeight: 1 }}>{playGlyph}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-fg)', fontWeight: 700, letterSpacing: '0.12em' }}>NOW PLAYING</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-fg)', marginTop: 2 }}>{ALPHABET.find(a => a.glyph === playGlyph)?.hint}</div>
                <div style={{ marginTop: 8 }}>
                  <Waveform seed={playGlyph.charCodeAt(0)} bars={20} height={20} progress={0.5} active color="var(--accent-fg)" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'dialogues' && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DIALOGS.map(d => {
            const active = playDialog === d.id;
            return (
              <div key={d.id} style={{
                borderRadius: 22,
                background: 'var(--surface)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                padding: 16,
                transition: 'all 200ms',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button onClick={() => handleDialog(d)} style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: active ? 'var(--accent)' : 'var(--accent-soft)',
                    color: active ? 'white' : 'var(--accent)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <Icon name={active ? 'pause' : 'play'} size={22} color={active ? 'white' : 'var(--accent)'} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{d.theme}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-3)' }}>{d.minutes}:00</div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{d.lines} LINES</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Waveform seed={d.id * 13} bars={50} height={24} progress={active ? 0.4 : 0} active={active} />
                </div>
                {active && (
                  <div className="slide-up" style={{
                    marginTop: 12, padding: 12, borderRadius: 14,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4 }}>NOW</div>
                    <div className="nubian" style={{ fontSize: 18 }}>ⲙⲁ ⲁⲣⲣⲓⲕ?</div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)' }}>"How are you?"</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
