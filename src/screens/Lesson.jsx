import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon, Waveform, LiveWaveform, RecordRing, NubianStrip } from '../lib/primitives.jsx';
import { VOWELS, CONSONANTS, MINIMAL_PAIRS, SYLLABLES, WORDS, PHRASES } from '../lib/data.js';
import { speak, cancelSpeech, useRecorder, playAudio, pronounce } from '../lib/audio.js';

/* LESSON — pedagogy loop: HEAR → DISTINGUISH → PRODUCE → READ → USE */

function buildLesson(stage, unit) {
  if (stage.id === 'sounds') {
    let items = [];
    if (unit.id === 'vowels') items = VOWELS;
    if (unit.id === 'consonants') items = CONSONANTS.slice(0, 6);
    if (unit.id === 'pairs') return MINIMAL_PAIRS.flatMap(p => [
      { kind: 'pair-hear', pair: p },
      { kind: 'pair-discriminate', pair: p },
      { kind: 'pair-produce', pair: p },
    ]);
    return items.flatMap(it => [
      { kind: 'sound-hear', item: it },
      { kind: 'sound-discriminate', item: it, pool: items },
      { kind: 'sound-produce', item: it },
    ]);
  }
  if (stage.id === 'syllables') {
    return SYLLABLES.slice(0, 6).flatMap(s => [
      { kind: 'sound-hear', item: s },
      { kind: 'sound-produce', item: s },
    ]);
  }
  if (stage.id === 'words') {
    const items = WORDS[unit.id] || WORDS.basics;
    return items.flatMap((w, i) => [
      { kind: 'word-hear', word: w },
      { kind: 'word-produce', word: w },
      ...(i % 2 === 1 ? [{ kind: 'word-match', word: w, pool: items }] : []),
    ]);
  }
  if (stage.id === 'phrases') {
    return PHRASES.slice(0, 4).flatMap(p => [
      { kind: 'word-hear', word: { en: p.en, nub: p.nub, script: p.script, ipa: '' } },
      { kind: 'word-produce', word: { en: p.en, nub: p.nub, script: p.script, ipa: '' } },
    ]);
  }
  return [
    { kind: 'word-hear', word: { en: 'how are you?', nub: 'ma arrik?', script: 'ⲙⲁ ⲁⲣⲣⲓⲕ?', ipa: '' } },
    { kind: 'word-produce', word: { en: 'I am fine', nub: 'sirri-ai', script: 'ⲥⲓⲣⲣⲓ-ⲁⲓ', ipa: '' } },
  ];
}

export function Lesson({ stage, unit, onExit, onComplete }) {
  const exercises = useMemo(() => buildLesson(stage, unit), [stage, unit]);
  const [step, setStep] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xpRun, setXpRun] = useState(0);
  const [combo, setCombo] = useState(0);

  const ex = exercises[step];
  const total = exercises.length;
  const progress = step / total;

  function next(success) {
    if (success) { setXpRun(x => x + 12); setCombo(c => c + 1); }
    else { setHearts(h => Math.max(0, h - 1)); setCombo(0); }
    if (step + 1 >= total) {
      onComplete?.({
        xp: xpRun + (success ? 12 : 0),
        stars: hearts >= 4 ? 3 : hearts >= 2 ? 2 : 1,
        words: exercises.filter(e => e.word).map(e => e.word).slice(0, 4),
        stage, unit,
      });
    } else {
      setStep(s => s + 1);
    }
  }

  const phase = ex.kind.startsWith('sound-hear') || ex.kind === 'pair-hear' || ex.kind === 'word-hear' ? 'HEAR'
              : ex.kind.includes('discriminate') || ex.kind === 'word-match' ? 'DISTINGUISH'
              : ex.kind.includes('produce') ? 'PRODUCE'
              : 'READ';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 8px' }}>
        <button onClick={onExit} style={{ padding: 4 }}>
          <Icon name="x" size={22} color="var(--text-3)" />
        </button>
        <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: stage.color || 'var(--accent)',
            borderRadius: 999, transition: 'width 0.4s cubic-bezier(.2,.8,.2,1)',
          }}/>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="heart" size={16} color="var(--bad)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>{hearts}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '4px 16px 8px' }}>
        {['HEAR','DISTINGUISH','PRODUCE'].map(p => (
          <span key={p} style={{
            fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
            letterSpacing: '0.14em',
            padding: '3px 8px', borderRadius: 999,
            background: phase === p ? (stage.color || 'var(--accent)') : 'transparent',
            color: phase === p ? 'white' : 'var(--text-3)',
            border: `1px solid ${phase === p ? (stage.color || 'var(--accent)') : 'var(--border)'}`,
          }}>{p}</span>
        ))}
      </div>

      {combo >= 2 && (
        <div className="scale-in" style={{
          alignSelf: 'center', marginTop: 2,
          padding: '4px 10px', borderRadius: 999,
          background: stage.color || 'var(--accent)', color: 'white',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)',
        }}>×{combo} COMBO</div>
      )}

      <div key={step} className="fade-in" style={{ flex: 1, overflow: 'auto', padding: '12px 16px 20px' }}>
        {ex.kind === 'sound-hear' && <SoundHear item={ex.item} stage={stage} onNext={() => next(true)} />}
        {ex.kind === 'sound-discriminate' && <SoundDiscriminate item={ex.item} pool={ex.pool} stage={stage} onNext={ok => next(ok)} />}
        {ex.kind === 'sound-produce' && <SoundProduce item={ex.item} stage={stage} onNext={ok => next(ok)} />}
        {ex.kind === 'pair-hear' && <PairHear pair={ex.pair} stage={stage} onNext={() => next(true)} />}
        {ex.kind === 'pair-discriminate' && <PairDiscriminate pair={ex.pair} stage={stage} onNext={ok => next(ok)} />}
        {ex.kind === 'pair-produce' && <SoundProduce item={ex.pair.b} stage={stage} onNext={ok => next(ok)} />}
        {ex.kind === 'word-hear' && <ListenExercise word={ex.word} stage={stage} onNext={() => next(true)} />}
        {ex.kind === 'word-produce' && <MimicExercise word={ex.word} stage={stage} onNext={ok => next(ok)} />}
        {ex.kind === 'word-match' && <MatchExercise word={ex.word} pool={ex.pool} stage={stage} onNext={ok => next(ok)} />}
      </div>
    </div>
  );
}

function SoundHear({ item, stage, onNext }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function play() {
    setPlaying(true); setProgress(1);
    pronounce(item, { onEnd: () => setPlaying(false) });
  }
  useEffect(() => { play(); return cancelSpeech; }, [item]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700, textTransform: 'uppercase' }}>Listen carefully</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>
          This sound is <em style={{ fontStyle: 'italic' }}>"{item.sound || item.nub}"</em>
        </h2>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 28, textAlign: 'center' }}>
        <NubianStrip height={12} />
        <button onClick={play} className="nubian" style={{
          fontSize: 120, lineHeight: 1, fontWeight: 400, color: stage.color, marginTop: 14, marginBottom: 10,
          display: 'block', width: '100%',
        }}>{item.glyph || item.script}</button>
        <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)' }}>
          {item.nub || `"${item.sound}"`}
        </div>
        {item.hint && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginTop: 6 }}>{item.hint}</div>}
        <div style={{ marginTop: 14 }}>
          <Waveform seed={(item.glyph || item.script || 'a').charCodeAt(0)} bars={28} height={32} progress={progress} active={playing} />
        </div>
        <button onClick={play} style={{
          marginTop: 14, padding: '10px 18px', borderRadius: 999,
          background: 'var(--accent-soft)', color: 'var(--accent-fg)',
          fontSize: 13, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name={playing ? 'pause' : 'play'} size={14} /> Hear again
        </button>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button onClick={onNext} className="btn btn-accent" style={{ width: '100%', borderRadius: 16, padding: 16, fontSize: 15, background: stage.color, borderColor: stage.color }}>
          Got it — next <Icon name="arrow-right" size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
}

function SoundDiscriminate({ item, pool, stage, onNext }) {
  const options = useMemo(() => {
    const others = pool.filter(p => (p.glyph || p.script) !== (item.glyph || item.script));
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 2);
    return [...shuffled, item].sort(() => Math.random() - 0.5);
  }, [item, pool]);
  const [picked, setPicked] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function play() {
    setPlaying(true); setProgress(1);
    pronounce(item, { onEnd: () => setPlaying(false) });
  }
  useEffect(() => { play(); return cancelSpeech; }, [item]);

  const correct = picked === (item.glyph || item.script);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>WHICH SOUND?</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>Tap the glyph you hear</h2>
      </div>

      <button onClick={play} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 22, padding: 18,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: stage.color, color: 'white',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name={playing ? 'pause' : 'play'} size={20} color="white" />
        </div>
        <Waveform seed={(item.glyph || 'a').charCodeAt(0)} bars={26} height={32} progress={progress} active={playing} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {options.map(opt => {
          const k = opt.glyph || opt.script;
          const sel = picked === k;
          const done = picked != null;
          const isCorrect = k === (item.glyph || item.script);
          let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
          if (done && isCorrect) { bg = 'var(--ok-soft)'; border = 'var(--ok)'; color = 'var(--ok)'; }
          else if (sel && !isCorrect) { bg = 'var(--bad-soft)'; border = 'var(--bad)'; color = 'var(--bad)'; }
          return (
            <button key={k} disabled={done} onClick={() => setPicked(k)} style={{
              padding: 16, borderRadius: 18,
              background: bg, border: `1.5px solid ${border}`, color,
              minHeight: 92, transition: 'all 200ms',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span className="nubian" style={{ fontSize: 36, lineHeight: 1 }}>{k}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, opacity: 0.7 }}>{opt.sound || opt.nub}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button disabled={!picked} onClick={() => onNext(correct)} style={{
          width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
          opacity: picked ? 1 : 0.4,
          background: picked ? (correct ? 'var(--ok)' : 'var(--bad)') : stage.color,
          color: 'white', border: 'none',
        }}>
          {!picked ? 'Choose a glyph' : correct ? 'Correct — continue' : 'Try again'}
        </button>
      </div>
    </div>
  );
}

function SoundProduce({ item, stage, onNext }) {
  return (
    <ProduceCard
      stage={stage}
      title={<>Say <em style={{ fontStyle: 'italic' }}>"{item.sound || item.nub}"</em></>}
      glyph={item.glyph || item.script}
      hint={item.nub || `"${item.sound}"`}
      target={item}
      onNext={onNext}
      glyphSize={80}
    />
  );
}

function PairHear({ pair, stage, onNext }) {
  const [played, setPlayed] = useState({ a: false, b: false });
  function tap(which) {
    cancelSpeech();
    const w = which === 'a' ? pair.a : pair.b;
    speak(w.nub, { rate: 0.7 });
    setPlayed(p => ({ ...p, [which]: true }));
  }
  useEffect(() => () => cancelSpeech(), []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>MINIMAL PAIR</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>
          Two words. <em style={{ fontStyle: 'italic' }}>One sound apart.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{pair.note}</p>
      </div>

      {[pair.a, pair.b].map((w, i) => (
        <button key={i} onClick={() => tap(i === 0 ? 'a' : 'b')} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 22, padding: 16, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: stage.color, color: 'white',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name="play" size={18} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nubian" style={{ fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>{w.script}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginTop: 4 }}>
              <span style={{ fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{w.nub}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· {w.en}</span>
            </div>
          </div>
          <Waveform seed={w.nub.charCodeAt(0)} bars={14} height={20} progress={played[i === 0 ? 'a' : 'b'] ? 1 : 0} color="var(--text-3)" />
        </button>
      ))}

      <div style={{ marginTop: 'auto' }}>
        <button onClick={onNext} style={{
          width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
          background: stage.color, color: 'white', border: 'none',
        }}>I hear the difference</button>
      </div>
    </div>
  );
}

function PairDiscriminate({ pair, stage, onNext }) {
  const target = useMemo(() => Math.random() > 0.5 ? pair.a : pair.b, [pair]);
  const [picked, setPicked] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function play() {
    cancelSpeech();
    setPlaying(true); setProgress(1);
    speak(target.nub, { rate: 0.7, onEnd: () => setPlaying(false) });
  }
  useEffect(() => { play(); return cancelSpeech; }, [target]);
  const correct = picked && picked === target.script;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>WHICH ONE?</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>Tap what you heard</h2>
      </div>

      <button onClick={play} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 22, padding: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: stage.color, color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name={playing ? 'pause' : 'play'} size={18} color="white" />
        </div>
        <Waveform seed={target.nub.charCodeAt(0)} bars={26} height={32} progress={progress} active={playing} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[pair.a, pair.b].map((w, i) => {
          const sel = picked === w.script;
          const done = picked != null;
          const isCorrect = w.script === target.script;
          let bg = 'var(--surface)', border = 'var(--border)';
          if (done && isCorrect) { bg = 'var(--ok-soft)'; border = 'var(--ok)'; }
          else if (sel && !isCorrect) { bg = 'var(--bad-soft)'; border = 'var(--bad)'; }
          return (
            <button key={i} disabled={done} onClick={() => setPicked(w.script)} style={{
              padding: 16, borderRadius: 18,
              background: bg, border: `1.5px solid ${border}`, color: 'var(--text)',
              minHeight: 100, transition: 'all 200ms',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span className="nubian" style={{ fontSize: 28, lineHeight: 1 }}>{w.script}</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{w.nub}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{w.en}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button disabled={!picked} onClick={() => onNext(correct)} style={{
          width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
          opacity: picked ? 1 : 0.4,
          background: picked ? (correct ? 'var(--ok)' : 'var(--bad)') : stage.color,
          color: 'white', border: 'none',
        }}>
          {!picked ? 'Choose an answer' : correct ? 'Correct — continue' : 'Not quite'}
        </button>
      </div>
    </div>
  );
}

function ListenExercise({ word, stage, onNext }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function play() {
    cancelSpeech();
    setPlaying(true); setProgress(1);
    speak(word.nub, { onEnd: () => setPlaying(false) });
  }
  useEffect(() => { play(); return cancelSpeech; }, [word]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>NEW WORD</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>Listen — what does this mean?</h2>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 22, textAlign: 'center' }}>
        <NubianStrip height={10} />
        <div className="nubian" style={{ fontSize: 56, lineHeight: 1, marginTop: 12, color: 'var(--text)' }}>{word.script}</div>
        <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)', marginTop: 6 }}>{word.nub}</div>
        {word.ipa && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{word.ipa}</div>}
        <div style={{ marginTop: 12 }}>
          <Waveform seed={word.en.length * 3} bars={28} height={36} progress={progress} active={playing} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={play} style={{
            padding: '8px 16px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent-fg)',
            fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="play" size={12} /> Play
          </button>
        </div>
      </div>

      <div style={{
        padding: 12, borderRadius: 14, background: 'var(--surface-2)',
        border: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text-3)',
      }}>
        It means <strong style={{ color: 'var(--text)', fontSize: 17, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>"{word.en}"</strong>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button onClick={onNext} style={{
          width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
          background: stage.color, color: 'white', border: 'none',
        }}>
          Got it — next
        </button>
      </div>
    </div>
  );
}

function MimicExercise({ word, stage, onNext }) {
  return (
    <ProduceCard
      stage={stage}
      title={<>Say <em style={{ fontStyle: 'italic' }}>"{word.en}"</em> in Nubian</>}
      glyph={word.script}
      hint={word.nub}
      target={word}
      onNext={onNext}
      glyphSize={44}
    />
  );
}

/* Shared "produce" exercise: speak target → record self → A/B compare.
   `target` is a curriculum item ({ audio?, nub?, sound? }) — pronounce()
   prefers item.audio if present, falls back to TTS. */
function ProduceCard({ stage, title, glyph, hint, target, onNext, glyphSize = 80 }) {
  const { recording, audioUrl, error, start, stop } = useRecorder();
  const [playingTarget, setPlayingTarget] = useState(false);
  const [playingSelf, setPlayingSelf] = useState(false);
  const audioRef = useRef(null);
  const targetTeardownRef = useRef(null);

  function playTarget() {
    targetTeardownRef.current?.();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingSelf(false); }
    setPlayingTarget(true);
    targetTeardownRef.current = pronounce(target, {
      onEnd: () => setPlayingTarget(false),
    });
  }

  function playSelf() {
    if (!audioUrl) return;
    targetTeardownRef.current?.();
    setPlayingTarget(false);
    setPlayingSelf(true);
    audioRef.current = playAudio(audioUrl, {
      onEnd: () => { setPlayingSelf(false); audioRef.current = null; },
    });
  }

  function toggleRecord() {
    if (recording) { stop(); }
    else {
      targetTeardownRef.current?.();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingSelf(false); }
      start();
    }
  }

  useEffect(() => () => {
    targetTeardownRef.current?.();
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const hasRecording = !!audioUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>YOUR TURN</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>
          {title}
        </h2>
      </div>

      <button onClick={playTarget} style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 22, padding: 18,
        textAlign: 'center', position: 'relative',
      }}>
        <NubianStrip height={10} />
        <div className="nubian" style={{ fontSize: glyphSize, lineHeight: 1, color: stage.color, marginTop: 10, marginBottom: 6 }}>{glyph}</div>
        <div style={{ fontSize: 18, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{hint}</div>
        <div style={{
          marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
          letterSpacing: '0.12em', color: 'var(--text-3)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name={playingTarget ? 'pause' : 'play'} size={12} color="var(--text-3)" />
          TAP TO HEAR TARGET
        </div>
      </button>

      <div style={{
        background: hasRecording ? 'var(--ok-soft)' : 'var(--surface-2)',
        border: `1px solid ${hasRecording ? 'var(--ok)' : 'var(--border)'}`,
        borderRadius: 22, padding: 14, transition: 'all 240ms', minHeight: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
      }}>
        {!hasRecording ? (
          <>
            <LiveWaveform listening={recording} height={56} />
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 700 }}>
              {error ? error.toUpperCase() : recording ? 'LISTENING...' : 'TAP MIC TO SPEAK'}
            </div>
          </>
        ) : (
          <div className="scale-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CompareButton label="Target" icon="play" active={playingTarget} onClick={playTarget} color={stage.color} />
            <CompareButton label="You" icon="play" active={playingSelf} onClick={playSelf} color="var(--ok)" />
            <button onClick={toggleRecord} style={{
              padding: '10px 12px', borderRadius: 12, fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)',
              flexShrink: 0,
            }}>RETRY</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {!hasRecording ? (
          <RecordRing size={78} listening={recording} onClick={toggleRecord} />
        ) : (
          <button onClick={() => onNext(true)} style={{
            width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
            background: stage.color, color: 'white', border: 'none',
          }}>Continue</button>
        )}
      </div>
    </div>
  );
}

function CompareButton({ label, icon, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 12px', borderRadius: 14,
      background: active ? color : 'var(--surface)',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      color: active ? 'white' : 'var(--text)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 13, fontWeight: 700,
    }}>
      <Icon name={active ? 'pause' : icon} size={14} color={active ? 'white' : color} />
      {label}
    </button>
  );
}

function MatchExercise({ word, pool, stage, onNext }) {
  const options = useMemo(() => {
    const others = pool.filter(w => w.en !== word.en);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffled, word].sort(() => Math.random() - 0.5);
  }, [word, pool]);
  const [picked, setPicked] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  function play() {
    cancelSpeech();
    setPlaying(true); setProgress(1);
    speak(word.nub, { onEnd: () => setPlaying(false) });
  }
  useEffect(() => { play(); return cancelSpeech; }, [word]);
  const correct = picked && picked === word.en;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: stage.color, fontWeight: 700 }}>MATCH MEANING</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>What did you hear?</h2>
      </div>

      <button onClick={play} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 22, padding: 18,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: stage.color, color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name={playing ? 'pause' : 'play'} size={20} color="white" />
        </div>
        <Waveform seed={word.en.length * 3} bars={28} height={36} progress={progress} active={playing} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {options.map(opt => {
          const sel = picked === opt.en;
          const done = picked != null;
          const isCorrect = opt.en === word.en;
          let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
          if (done && isCorrect) { bg = 'var(--ok-soft)'; border = 'var(--ok)'; color = 'var(--ok)'; }
          else if (sel && !isCorrect) { bg = 'var(--bad-soft)'; border = 'var(--bad)'; color = 'var(--bad)'; }
          return (
            <button key={opt.en} disabled={done} onClick={() => setPicked(opt.en)} style={{
              padding: 14, borderRadius: 16,
              background: bg, border: `1.5px solid ${border}`, color,
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              minHeight: 60, transition: 'all 200ms',
            }}>{opt.en}</button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button disabled={!picked} onClick={() => onNext(correct)} style={{
          width: '100%', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
          opacity: picked ? 1 : 0.4,
          background: picked ? (correct ? 'var(--ok)' : 'var(--bad)') : stage.color,
          color: 'white', border: 'none',
        }}>{!picked ? 'Choose' : correct ? 'Correct — continue' : 'Not quite'}</button>
      </div>
    </div>
  );
}

export function LessonComplete({ result, onContinue }) {
  const stars = result?.stars || 3;
  const xp = result?.xp || 60;
  const words = result?.words || [];
  const stage = result?.stage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', padding: '20px 16px', overflow: 'auto' }}>
      <div className="scale-in" style={{
        marginTop: 12, borderRadius: 28,
        background: stage ? `linear-gradient(135deg, ${stage.color}, var(--hero-3))` : 'linear-gradient(135deg, var(--hero-1), var(--hero-3))',
        color: 'white', padding: 26, textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <defs>
            <pattern id="dim2" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M12 0 L24 12 L12 24 L0 12 Z" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dim2)"/>
        </svg>
        <div className="nubian" style={{ fontSize: 72, lineHeight: 1 }}>ⲁϣⲣⲓ</div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', opacity: 0.85, letterSpacing: '0.2em', marginTop: 6 }}>"THANK YOU"</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 12, lineHeight: 1 }}>
          Lesson complete.
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          {[1, 2, 3].map(i => <Icon key={i} name="star" size={26} color={i <= stars ? '#FCD34D' : 'rgba(255,255,255,0.3)'} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        <StatBlock label="XP" value={`+${xp}`} icon="star" color="var(--accent)" />
        <StatBlock label="Accuracy" value="92%" icon="check" color="var(--ok)" />
        <StatBlock label="Streak" value="6🔥" icon="flame" color="var(--streak)" />
      </div>

      {words.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: 'var(--text-3)', fontWeight: 700, marginBottom: 8 }}>SAVED FOR REVIEW</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {words.slice(0, 4).map(w => (
              <div key={w.en} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, borderRadius: 12,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="play" size={12} color="var(--accent)" />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nubian" style={{ fontSize: 16 }}>{w.script}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{w.nub} · {w.en}</div>
                </div>
                <Waveform seed={w.en.length * 3} bars={12} height={18} progress={1} color="var(--text-3)" />
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onContinue} style={{
        width: '100%', marginTop: 18, borderRadius: 16, padding: 16, fontSize: 15, fontWeight: 700,
        background: 'var(--text)', color: 'var(--bg)', border: 'none',
      }}>Continue</button>
    </div>
  );
}

function StatBlock({ label, value, icon, color }) {
  return (
    <div style={{
      padding: 12, borderRadius: 14,
      background: 'var(--surface)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <Icon name={icon} size={14} color={color} />
      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{label.toUpperCase()}</div>
    </div>
  );
}
