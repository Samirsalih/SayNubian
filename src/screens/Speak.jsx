import React, { useState, useRef } from 'react';
import { Icon, RecordRing, LiveWaveform, NubianStrip } from '../lib/primitives.jsx';
import { NUBIAN_WORDS } from '../lib/data.js';

export default function Speak({ onExit }) {
  const all = [...NUBIAN_WORDS.family, ...NUBIAN_WORDS.feelings];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const word = all[idx];
  const recordTimer = useRef();

  function toggleRecord() {
    if (phase === 'recording') {
      clearTimeout(recordTimer.current);
      finishRecording();
    } else {
      setPhase('recording');
      recordTimer.current = setTimeout(finishRecording, 2000);
    }
  }
  function finishRecording() {
    setScore(75 + Math.floor(Math.random() * 22));
    setPhase('scored');
  }
  function nextWord() {
    setPhase('idle');
    setScore(0);
    setIdx(i => (i + 1) % all.length);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        <button onClick={onExit}><Icon name="x" size={22} color="var(--text-3)" /></button>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.16em', color: 'var(--text-3)', fontWeight: 700, whiteSpace: 'nowrap' }}>SPEAK · {idx + 1}/{all.length}</div>
        <div style={{ width: 22 }} />
      </div>

      <div className="fade-in" key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.12em', fontWeight: 700 }}>SAY THIS WORD</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontStyle: 'italic', fontWeight: 400, marginTop: 2 }}>"{word.en}"</h2>
        </div>

        <div style={{
          margin: '24px 0', padding: '28px 20px', borderRadius: 28,
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <NubianStrip height={12} />
          <div className="nubian" style={{ fontSize: 64, color: 'var(--accent)', lineHeight: 1, margin: '14px 0 8px' }}>{word.script}</div>
          <div style={{ fontSize: 24, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{word.nub}</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginTop: 4 }}>{word.ipa}</div>
        </div>

        <div style={{
          padding: 18, borderRadius: 24,
          background: phase === 'scored'
            ? (score >= 80 ? 'var(--ok-soft)' : 'var(--bad-soft)')
            : 'var(--surface-2)',
          border: `1px solid ${phase === 'scored' ? (score >= 80 ? 'var(--ok)' : 'var(--bad)') : 'var(--border)'}`,
          minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {phase === 'scored' ? (
            <div className="scale-in" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: score >= 80 ? 'var(--ok)' : 'var(--bad)', color: 'white',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name={score >= 80 ? 'check' : 'x'} size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.12em', color: score >= 80 ? 'var(--ok)' : 'var(--bad)' }}>
                  {score >= 80 ? 'GREAT MATCH' : 'KEEP TRYING'}
                </div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{score}<span style={{ color: 'var(--text-3)', fontSize: 13 }}>/100</span></div>
              </div>
              <button onClick={nextWord} style={{
                padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: 'var(--text)', color: 'var(--bg)',
              }}>Next</button>
            </div>
          ) : (
            <>
              <LiveWaveform listening={phase === 'recording'} height={56} />
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 700 }}>
                {phase === 'recording' ? 'LISTENING...' : 'TAP MIC TO SPEAK'}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 8px' }}>
          <button style={{
            padding: 12, borderRadius: '50%', width: 48, height: 48,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="play" size={18} color="var(--text-2)" />
          </button>
          <RecordRing size={86} listening={phase === 'recording'} onClick={toggleRecord} />
          <button onClick={nextWord} style={{
            padding: 12, borderRadius: '50%', width: 48, height: 48,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="arrow-right" size={18} color="var(--text-2)" />
          </button>
        </div>
      </div>
    </div>
  );
}
