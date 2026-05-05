import React, { useState, useEffect, useRef } from 'react';
import { Icon, RecordRing, LiveWaveform, NubianStrip } from '../lib/primitives.jsx';
import { NUBIAN_WORDS } from '../lib/data.js';
import { speak, cancelSpeech, useRecorder, playAudio } from '../lib/audio.js';

export default function Speak({ onExit }) {
  const all = [...NUBIAN_WORDS.family, ...NUBIAN_WORDS.feelings];
  const [idx, setIdx] = useState(0);
  const word = all[idx];

  const { recording, audioUrl, error, start, stop, reset } = useRecorder();
  const [playingTarget, setPlayingTarget] = useState(false);
  const [playingSelf, setPlayingSelf] = useState(false);
  const audioRef = useRef(null);

  function playTarget() {
    cancelSpeech();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingSelf(false); }
    setPlayingTarget(true);
    speak(word.nub, { rate: 0.7, onEnd: () => setPlayingTarget(false) });
  }

  function playSelf() {
    if (!audioUrl) return;
    cancelSpeech();
    setPlayingTarget(false);
    setPlayingSelf(true);
    audioRef.current = playAudio(audioUrl, {
      onEnd: () => { setPlayingSelf(false); audioRef.current = null; },
    });
  }

  function toggleRecord() {
    if (recording) { stop(); }
    else {
      cancelSpeech();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingSelf(false); }
      start();
    }
  }

  function nextWord() {
    cancelSpeech();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingTarget(false); setPlayingSelf(false);
    reset();
    setIdx(i => (i + 1) % all.length);
  }

  // Auto-play the target when the word changes
  useEffect(() => {
    playTarget();
    return cancelSpeech;
  }, [idx]);

  useEffect(() => () => {
    cancelSpeech();
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const hasRecording = !!audioUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        <button onClick={onExit}><Icon name="x" size={22} color="var(--text-3)" /></button>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.16em', color: 'var(--text-3)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          SPEAK · {idx + 1}/{all.length}
        </div>
        <div style={{ width: 22 }} />
      </div>

      <div className="fade-in" key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.12em', fontWeight: 700 }}>SAY THIS WORD</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontStyle: 'italic', fontWeight: 400, marginTop: 2 }}>"{word.en}"</h2>
        </div>

        <button onClick={playTarget} style={{
          margin: '24px 0', padding: '28px 20px', borderRadius: 28,
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center', position: 'relative',
        }}>
          <NubianStrip height={12} />
          <div className="nubian" style={{ fontSize: 64, color: 'var(--accent)', lineHeight: 1, margin: '14px 0 8px' }}>{word.script}</div>
          <div style={{ fontSize: 24, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{word.nub}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginTop: 4 }}>{word.ipa}</div>
          <div style={{
            marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
            letterSpacing: '0.12em', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name={playingTarget ? 'pause' : 'play'} size={12} color="var(--accent)" />
            TAP TO HEAR
          </div>
        </button>

        <div style={{
          padding: 18, borderRadius: 24,
          background: hasRecording ? 'var(--ok-soft)' : 'var(--surface-2)',
          border: `1px solid ${hasRecording ? 'var(--ok)' : 'var(--border)'}`,
          minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
        }}>
          {hasRecording ? (
            <div className="scale-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CompareButton label="Target" active={playingTarget} onClick={playTarget} color="var(--accent)" />
              <CompareButton label="You" active={playingSelf} onClick={playSelf} color="var(--ok)" />
            </div>
          ) : (
            <>
              <LiveWaveform listening={recording} height={56} />
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 700 }}>
                {error ? error.toUpperCase() : recording ? 'LISTENING...' : 'TAP MIC TO SPEAK'}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 8px' }}>
          <button onClick={playTarget} style={{
            padding: 12, borderRadius: '50%', width: 48, height: 48,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center',
          }} aria-label="Replay target">
            <Icon name={playingTarget ? 'pause' : 'play'} size={18} color="var(--text-2)" />
          </button>
          <RecordRing size={86} listening={recording} onClick={toggleRecord} />
          <button onClick={nextWord} style={{
            padding: 12, borderRadius: '50%', width: 48, height: 48,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center',
          }} aria-label="Next word">
            <Icon name="arrow-right" size={18} color="var(--text-2)" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareButton({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '12px 14px', borderRadius: 14,
      background: active ? color : 'var(--surface)',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      color: active ? 'white' : 'var(--text)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 14, fontWeight: 700,
    }}>
      <Icon name={active ? 'pause' : 'play'} size={14} color={active ? 'white' : color} />
      {label}
    </button>
  );
}
