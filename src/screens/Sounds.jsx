import React, { useState, useRef, useEffect } from 'react';
import { Icon, Waveform } from '../lib/primitives.jsx';
import { ALPHABET, DIALOGS } from '../lib/data.js';
import { speak, cancelSpeech, pronounce, playAudio } from '../lib/audio.js';

export default function Sounds() {
  const [tab, setTab] = useState('alphabet');
  const [playGlyph, setPlayGlyph] = useState(null);
  const [openDialogId, setOpenDialogId] = useState(null);

  function handleGlyph(g) {
    if (playGlyph === g.glyph) {
      cancelSpeech();
      setPlayGlyph(null);
      return;
    }
    setPlayGlyph(g.glyph);
    pronounce(g, { onEnd: () => setPlayGlyph(p => (p === g.glyph ? null : p)) });
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
          {DIALOGS.map(d => (
            <DialogCard
              key={d.id}
              dialog={d}
              open={openDialogId === d.id}
              onToggle={() => setOpenDialogId(openDialogId === d.id ? null : d.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DialogCard({ dialog, open, onToggle }) {
  const [playingFull, setPlayingFull] = useState(false);
  const [playingLine, setPlayingLine] = useState(null);
  const audioRef = useRef(null);

  function stopAll() {
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} audioRef.current = null; }
    setPlayingFull(false);
    setPlayingLine(null);
  }

  useEffect(() => () => stopAll(), []);

  function playFull(e) {
    e?.stopPropagation();
    if (playingFull) { stopAll(); return; }
    stopAll();
    setPlayingFull(true);
    audioRef.current = playAudio(dialog.audio, {
      onEnd: () => { setPlayingFull(false); audioRef.current = null; },
    });
  }

  function playLine(idx) {
    if (playingLine === idx) { stopAll(); return; }
    stopAll();
    setPlayingLine(idx);
    audioRef.current = playAudio(dialog.lines[idx].audio, {
      onEnd: () => { setPlayingLine(p => (p === idx ? null : p)); audioRef.current = null; },
    });
  }

  return (
    <div style={{
      borderRadius: 22,
      background: 'var(--surface)',
      border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
      padding: 16,
      transition: 'all 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={playFull} style={{
          width: 52, height: 52, borderRadius: '50%',
          background: playingFull ? 'var(--accent)' : 'var(--accent-soft)',
          color: playingFull ? 'white' : 'var(--accent)',
          display: 'grid', placeItems: 'center', flexShrink: 0, border: 'none',
        }}>
          <Icon name={playingFull ? 'pause' : 'play'} size={22} color={playingFull ? 'white' : 'var(--accent)'} />
        </button>
        <button onClick={onToggle} style={{
          flex: 1, minWidth: 0, textAlign: 'left',
          background: 'transparent', border: 'none', padding: 0,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{dialog.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{dialog.theme}</div>
        </button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-3)' }}>~{dialog.minutes} min</div>
          <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{dialog.lines.length} LINES</div>
        </div>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} color="var(--text-3)" />
      </div>

      <div style={{ marginTop: 12 }}>
        <Waveform seed={dialog.id * 13} bars={50} height={24} progress={playingFull ? 0.4 : 0} active={playingFull} />
      </div>

      {open && (
        <div className="slide-up" style={{
          marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {dialog.lines.map((line, i) => {
            const active = playingLine === i;
            return (
              <button key={i} onClick={() => playLine(i)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                textAlign: 'left',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <Icon name={active ? 'pause' : 'play'} size={12} color={active ? 'white' : 'var(--accent)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    color: 'var(--text)',
                  }}>"{line.en}"</div>
                </div>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: 'var(--text-3)', letterSpacing: '0.08em',
                }}>{String(i + 1).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
