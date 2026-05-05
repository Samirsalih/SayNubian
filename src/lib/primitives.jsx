import React, { useState, useEffect, useMemo } from 'react';

/* Shared UI primitives — waveforms, record button, icons, layout chrome. */

/* ── Waveform (static, deterministic from seed) ─────────────── */
export function Waveform({ seed = 7, bars = 36, height = 40, progress = 0, active = false, color, dim, className = '', onClick }) {
  const heights = useMemo(() => {
    const arr = [];
    let s = seed * 9301 + 49297;
    for (let i = 0; i < bars; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4;
      arr.push(Math.max(0.18, r * env));
    }
    return arr;
  }, [seed, bars]);

  const c = color || 'var(--accent)';
  const d = dim || 'var(--border-2)';
  return (
    <div
      className={className}
      style={{ height, cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%' }}
      onClick={onClick}
    >
      {heights.map((h, i) => {
        const filled = i / bars <= progress;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              background: filled ? c : d,
              borderRadius: 2,
              transition: 'background 200ms, transform 300ms',
              transform: active && filled ? `scaleY(${0.7 + Math.random() * 0.6})` : 'scaleY(1)',
              animation: active ? `wave 0.${4 + (i % 5)}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 30}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Live recording waveform (animated) ─────────────────────── */
export function LiveWaveform({ height = 120, color, listening }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [listening]);
  const bars = 48;
  const c = color || 'var(--accent)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const env = Math.sin((i / bars) * Math.PI);
        const noise = listening ? (Math.sin(tick * 0.4 + i * 0.6) + 1) / 2 : 0.1;
        const h = listening ? Math.max(0.08, env * 0.4 + noise * 0.7) : 0.12;
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: `${h * 100}%`,
              background: c,
              borderRadius: 2,
              opacity: listening ? 1 : 0.35,
              transition: 'height 90ms ease-out',
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Record ring button ─────────────────────────────────────── */
export function RecordRing({ size = 84, listening, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: listening ? 'var(--bad)' : 'var(--accent)',
        boxShadow: 'var(--shadow-glow)',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 200ms',
        border: 'none',
      }}
      aria-label={label || 'Record'}
    >
      {listening && (
        <>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--bad)', animation: 'pulse-ring 1.4s ease-out infinite',
          }} />
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--bad)', animation: 'pulse-ring 1.4s ease-out infinite 0.5s',
          }} />
        </>
      )}
      <Icon name={listening ? 'square' : 'mic'} size={size * 0.4} color="white" />
    </button>
  );
}

/* ── Icons (line, modern) ───────────────────────────────────── */
export function Icon({ name, size = 22, color = 'currentColor', stroke = 1.8 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'mic':
      return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3" fill={color} stroke="none"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg>;
    case 'square':
      return <svg {...props}><rect x="6" y="6" width="12" height="12" rx="2" fill={color} stroke="none"/></svg>;
    case 'play':
      return <svg {...props}><path d="M7 5v14l12-7z" fill={color} stroke="none"/></svg>;
    case 'pause':
      return <svg {...props}><rect x="6" y="5" width="4" height="14" rx="1" fill={color} stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill={color} stroke="none"/></svg>;
    case 'home':
      return <svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>;
    case 'book':
      return <svg {...props}><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>;
    case 'sparkle':
      return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M18.5 5.5L16 8M8 16l-2.5 2.5"/></svg>;
    case 'wave':
      return <svg {...props}><path d="M3 12h2M7 8v8M11 4v16M15 8v8M19 12h2"/></svg>;
    case 'flame':
      return <svg {...props}><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 2 4-1-3 0-7 1-10z" fill={color} stroke="none"/></svg>;
    case 'star':
      return <svg {...props}><path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.6 6.7 19.5l1.1-6L3.4 9.3l6-.8z" fill={color} stroke="none"/></svg>;
    case 'heart':
      return <svg {...props}><path d="M12 20S4 14 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5-8 11-8 11z" fill={color} stroke="none"/></svg>;
    case 'check':
      return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'x':
      return <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case 'arrow-left':
      return <svg {...props}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
    case 'arrow-right':
      return <svg {...props}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'lock':
      return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case 'chevron-right':
      return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down':
      return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'sun':
      return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>;
    case 'moon':
      return <svg {...props}><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10z" fill={color} stroke="none"/></svg>;
    case 'people':
      return <svg {...props}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20a5 5 0 0 1 6.5-4.8"/></svg>;
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case 'message':
      return <svg {...props}><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4A8 8 0 1 1 21 12z"/></svg>;
    case 'send':
      return <svg {...props}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>;
    default: return null;
  }
}

export function StatPill({ icon, value, color, bg }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: bg || 'var(--surface-2)',
      border: '1px solid var(--border)',
      fontSize: 13, fontWeight: 700,
      color: color || 'var(--text)',
    }}>
      <Icon name={icon} size={14} color={color || 'var(--text)'} />
      <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

export function NubianStrip({ height = 18, color, className = '' }) {
  const c = color || 'var(--accent)';
  const id = useMemo(() => `nub-strip-${Math.random().toString(36).slice(2, 9)}`, []);
  return (
    <svg viewBox="0 0 200 18" preserveAspectRatio="none" style={{ width: '100%', height }} className={className}>
      <defs>
        <pattern id={id} width="20" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9 L10 1 L20 9 L10 17 Z" fill="none" stroke={c} strokeWidth="1" opacity="0.7"/>
          <circle cx="10" cy="9" r="1.5" fill={c}/>
        </pattern>
      </defs>
      <rect width="200" height="18" fill={`url(#${id})`}/>
    </svg>
  );
}

export function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'learn', label: 'Learn', icon: 'home' },
    { id: 'chat', label: 'Chat', icon: 'message' },
    { id: 'words', label: 'Words', icon: 'book' },
    { id: 'sounds', label: 'Sounds', icon: 'wave' },
  ];
  return (
    <div style={{
      padding: '8px 12px max(22px, env(safe-area-inset-bottom))',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      backdropFilter: 'blur(20px)',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '8px 4px', position: 'relative',
              color: active ? 'var(--accent)' : 'var(--text-3)',
            }}
          >
            <Icon name={t.icon} size={22} stroke={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>{t.label}</span>
            {active && <span style={{
              position: 'absolute', top: 0, width: 28, height: 3,
              background: 'var(--accent)', borderRadius: 2,
            }}/>}
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({ streak, xp, hearts }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px 12px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--hero-1), var(--hero-3))',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-script)', color: 'white', fontSize: 16,
        }}>ⲛ</div>
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>SayNubian</div>
          <div className="nubian" style={{ fontSize: 10, color: 'var(--accent)' }}>ⲛⲟⲩⲃⲓⲁ</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <StatPill icon="flame" value={streak} color="var(--streak)" bg="var(--bad-soft)" />
        <StatPill icon="star" value={xp} color="var(--accent)" bg="var(--accent-soft)" />
        <StatPill icon="heart" value={hearts} color="var(--bad)" bg="var(--bad-soft)" />
      </div>
    </div>
  );
}
