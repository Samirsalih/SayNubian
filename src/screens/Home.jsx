import React, { useState } from 'react';
import { Icon, NubianStrip } from '../lib/primitives.jsx';
import { STAGES, REVIEW_DUE } from '../lib/data.js';

/* HOME — stage-based curriculum + spaced-repetition review. */

export default function Home({ streak, xp, onStartUnit, onStartReview, dailyMinutes, dailyGoal }) {
  const pct = Math.min(1, dailyMinutes / dailyGoal);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Hero — daily goal */}
      <div style={{
        margin: '14px 16px 18px',
        borderRadius: 28,
        background: 'linear-gradient(135deg, var(--hero-1) 0%, var(--hero-2) 60%, var(--hero-3) 100%)',
        color: 'white', padding: 22, position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}>
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', right: -60, top: -60, width: 240, opacity: 0.18 }}>
          <defs>
            <pattern id="diam" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#diam)"/>
        </svg>

        <div className="nubian" style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.2em', marginBottom: 4 }}>ⲡⲏⲏⲗⲁ · TODAY</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Speak Nubian for<br/><em style={{ fontStyle: 'italic' }}>{dailyGoal} minutes</em> today.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="6"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26 * pct} ${2 * Math.PI * 26}`}
              strokeLinecap="round" transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dasharray 0.6s' }}/>
            <text x="32" y="36" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">{Math.round(pct * 100)}%</text>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 600 }}>{dailyMinutes} of {dailyGoal} min</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2, fontFamily: 'var(--font-mono)' }}>{streak}-DAY STREAK · +{xp} XP</div>
          </div>
        </div>
      </div>

      {REVIEW_DUE.length > 0 && (
        <div style={{ padding: '0 16px 18px' }}>
          <button onClick={onStartReview} style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 18,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            textAlign: 'left',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--gold-soft)', color: 'var(--gold-deep)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              position: 'relative',
            }}>
              <Icon name="sparkle" size={20} color="var(--gold)" />
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--bad)', color: 'white',
                display: 'grid', placeItems: 'center',
                fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)',
              }}>{REVIEW_DUE.length}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Review · {REVIEW_DUE.length} cards due</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                {REVIEW_DUE.slice(0, 3).map(c => c.label).join(' · ')}
              </div>
            </div>
            <Icon name="chevron-right" size={18} color="var(--text-3)" />
          </button>
        </div>
      )}

      <div style={{ padding: '0 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', flex: 1, minWidth: 0 }}>Your path</h2>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', flexShrink: 0 }}>5 STAGES</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STAGES.map((stage, i) => (
            <StageCard key={stage.id} stage={stage} onStartUnit={onStartUnit} expandedDefault={i === 0} />
          ))}
        </div>

        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <NubianStrip height={10} />
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.16em', marginTop: 8, fontWeight: 700 }}>HEAR · DISTINGUISH · PRODUCE · READ · USE</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Every lesson, in that order.</div>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage, onStartUnit, expandedDefault }) {
  const totalLessons = stage.units.reduce((a, u) => a + u.lessons, 0);
  const doneLessons = stage.units.reduce((a, u) => a + u.done, 0);
  const progress = totalLessons ? doneLessons / totalLessons : 0;
  const stageLocked = stage.units.every(u => u.status === 'locked');
  const stageActive = stage.units.some(u => u.status === 'active' || (u.status === 'unlocked' && doneLessons > 0));
  const [open, setOpen] = useState(expandedDefault || stageActive);

  return (
    <div style={{
      borderRadius: 22,
      background: 'var(--surface)',
      border: `1px solid ${stageActive ? stage.color : 'var(--border)'}`,
      overflow: 'hidden',
      opacity: stageLocked ? 0.6 : 1,
      boxShadow: stageActive ? 'var(--shadow-sm)' : 'none',
    }}>
      <button onClick={() => !stageLocked && setOpen(o => !o)} style={{
        width: '100%', padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12,
        textAlign: 'left',
      }}>
        <div style={{
          width: 56, minHeight: 56, borderRadius: 14,
          background: stageActive ? stage.color : 'var(--surface-2)',
          color: stageActive ? 'white' : stage.color,
          display: 'grid', placeItems: 'center', flexShrink: 0,
          position: 'relative',
        }}>
          <span className="nubian" style={{ fontSize: 28, lineHeight: 1 }}>{stage.glyph}</span>
          <span style={{
            position: 'absolute', top: -5, left: -5,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--bg)', color: stage.color,
            display: 'grid', placeItems: 'center',
            fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)',
            border: `1.5px solid ${stage.color}`,
          }}>{stage.n}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{stage.title}</h3>
            {stageLocked && <Icon name="lock" size={12} color="var(--text-3)" />}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{stage.subtitle} · <em style={{ fontFamily: 'var(--font-serif)' }}>{stage.why}</em></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: stage.color, borderRadius: 2, transition: 'width 0.4s' }}/>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em' }}>
              {doneLessons}/{totalLessons}
            </span>
          </div>
        </div>
        <Icon name="chevron-down" size={18} color="var(--text-3)" stroke={2} />
      </button>

      {open && !stageLocked && (
        <div className="fade-in" style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stage.units.map(u => <UnitRow key={u.id} unit={u} stage={stage} onStart={() => onStartUnit(stage, u)} />)}
        </div>
      )}
    </div>
  );
}

function UnitRow({ unit, stage, onStart }) {
  const locked = unit.status === 'locked';
  const done = unit.status === 'done';
  const active = unit.status === 'active';

  return (
    <button onClick={onStart} disabled={locked} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 14,
      background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
      border: `1px solid ${active ? stage.color : 'var(--border)'}`,
      textAlign: 'left',
      opacity: locked ? 0.55 : 1,
      cursor: locked ? 'not-allowed' : 'pointer',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        display: 'grid', placeItems: 'center', flexShrink: 0,
        background: done ? stage.color : 'var(--surface)',
        border: `1.5px solid ${done ? stage.color : active ? stage.color : 'var(--border-2)'}`,
        color: done ? 'white' : stage.color,
      }}>
        {done ? <Icon name="check" size={14} color="white" stroke={3}/>
              : locked ? <Icon name="lock" size={12} color="var(--text-3)" />
              : <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{unit.done}/{unit.lessons}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{unit.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 1, letterSpacing: '0.04em' }}>{unit.desc}</div>
      </div>
      {active && (
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: stage.color, fontFamily: 'var(--font-mono)' }}>CONTINUE ›</span>
      )}
      {(unit.status === 'unlocked' && !active) && (
        <Icon name="chevron-right" size={16} color="var(--text-3)" />
      )}
    </button>
  );
}
