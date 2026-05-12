import React, { useState, useEffect, lazy, Suspense } from 'react';
import { TopBar, TabBar, Icon } from './lib/primitives.jsx';
import Home from './screens/Home.jsx';
import { Lesson, LessonComplete } from './screens/Lesson.jsx';
import Words from './screens/Words.jsx';
import Sounds from './screens/Sounds.jsx';
import Speak from './screens/Speak.jsx';
import Chat from './screens/Chat.jsx';
import { STAGES, DIALECTS, DEFAULT_DIALECT } from './lib/data.js';

const Admin = lazy(() => import('./screens/Admin.jsx'));

function isAdminHash() {
  return typeof window !== 'undefined' && window.location.hash === '#admin';
}

const THEMES = ['nile', 'sand', 'indigo', 'reed'];

function loadPrefs() {
  try {
    const raw = localStorage.getItem('saynubian.prefs');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { theme: 'nile', mode: 'light', dailyGoal: 10, dialect: DEFAULT_DIALECT };
}

function savePrefs(p) {
  try { localStorage.setItem('saynubian.prefs', JSON.stringify(p)); } catch {}
}

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [tab, setTab] = useState('learn');
  const [screen, setScreen] = useState('home');
  const [adminMode, setAdminMode] = useState(isAdminHash);

  useEffect(() => {
    const sync = () => setAdminMode(isAdminHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  function exitAdmin() {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setAdminMode(false);
  }
  const [activeStage, setActiveStage] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [lessonResult, setLessonResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [streak] = useState(5);
  const [xp, setXp] = useState(640);
  const [hearts] = useState(5);
  const [dailyMinutes] = useState(7);

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.mode = prefs.mode;
    savePrefs(prefs);
  }, [prefs]);

  function setPref(key, val) {
    setPrefs(p => ({ ...p, [key]: val }));
  }

  function startUnit(stage, unit) {
    setActiveStage(stage);
    setActiveUnit(unit);
    setScreen('lesson');
  }

  function startReview() {
    setActiveStage(STAGES[0]);
    setActiveUnit({ ...STAGES[0].units[0], id: 'vowels', title: 'Quick review' });
    setScreen('lesson');
  }

  function completeLesson(result) {
    setLessonResult(result);
    setXp(x => x + result.xp);
    setScreen('complete');
  }

  function backHome() {
    setScreen('home');
    setTab('learn');
  }

  let body;
  if (screen === 'lesson') {
    body = <Lesson stage={activeStage} unit={activeUnit} onExit={backHome} onComplete={completeLesson} />;
  } else if (screen === 'complete') {
    body = <LessonComplete result={lessonResult} onContinue={backHome} />;
  } else if (screen === 'speak') {
    body = <Speak onExit={backHome} />;
  } else {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TopBarWithSettings
          streak={streak} xp={xp} hearts={hearts}
          onSettings={() => setShowSettings(s => !s)}
        />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {tab === 'learn' && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Home
                streak={streak} xp={xp}
                dailyMinutes={dailyMinutes} dailyGoal={prefs.dailyGoal}
                onStartUnit={startUnit} onStartReview={startReview}
              />
            </div>
          )}
          {tab === 'chat' && <Chat />}
          {tab === 'words' && <div style={{ flex: 1, overflow: 'auto' }}><Words /></div>}
          {tab === 'sounds' && <div style={{ flex: 1, overflow: 'auto' }}><Sounds /></div>}
        </div>
        <TabBar tab={tab} setTab={setTab} />
      </div>
    );
  }

  return (
    <div className="app-root" style={{
      width: '100%', height: '100dvh', minHeight: '100dvh',
      background: 'var(--bg)', color: 'var(--text)',
      paddingTop: 'env(safe-area-inset-top)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {adminMode ? (
          <Suspense fallback={<AdminLoading />}>
            <Admin onExit={exitAdmin} />
          </Suspense>
        ) : body}
      </div>
      {!adminMode && showSettings && <SettingsSheet prefs={prefs} setPref={setPref} onClose={() => setShowSettings(false)} onOpenAdmin={() => { window.location.hash = '#admin'; setAdminMode(true); }} />}
    </div>
  );
}

function AdminLoading() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'grid', placeItems: 'center',
      color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-mono)',
    }}>Loading admin…</div>
  );
}

function TopBarWithSettings({ streak, xp, hearts, onSettings }) {
  return (
    <div style={{ position: 'relative' }}>
      <TopBar streak={streak} xp={xp} hearts={hearts} />
      <button
        onClick={onSettings}
        aria-label="Settings"
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 28, height: 28, borderRadius: 8,
          display: 'grid', placeItems: 'center',
          background: 'transparent', border: 'none',
          color: 'var(--text-3)',
        }}
      >
        <Icon name="settings" size={18} color="var(--text-3)" />
      </button>
    </div>
  );
}

function SettingsSheet({ prefs, setPref, onClose, onOpenAdmin }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480,
        background: 'var(--surface)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '20px 20px max(20px, env(safe-area-inset-bottom))',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400 }}>Settings</h3>
          <button onClick={onClose} style={{ padding: 4 }}>
            <Icon name="x" size={22} color="var(--text-3)" />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 8 }}>THEME</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {THEMES.map(t => (
              <button key={t} onClick={() => setPref('theme', t)} style={{
                padding: '10px 8px', borderRadius: 12,
                background: prefs.theme === t ? 'var(--accent)' : 'var(--surface-2)',
                color: prefs.theme === t ? 'white' : 'var(--text-2)',
                border: `1px solid ${prefs.theme === t ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 8 }}>MODE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {['light', 'dark'].map(m => (
              <button key={m} onClick={() => setPref('mode', m)} style={{
                padding: '10px 8px', borderRadius: 12,
                background: prefs.mode === m ? 'var(--text)' : 'var(--surface-2)',
                color: prefs.mode === m ? 'var(--bg)' : 'var(--text-2)',
                border: `1px solid ${prefs.mode === m ? 'var(--text)' : 'var(--border)'}`,
                fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name={m === 'dark' ? 'moon' : 'sun'} size={14} color={prefs.mode === m ? 'var(--bg)' : 'var(--text-2)'} />
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 8 }}>DIALECT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DIALECTS.map(d => {
              const selected = prefs.dialect === d.id;
              return (
                <button
                  key={d.id}
                  disabled={!d.available}
                  onClick={() => d.available && setPref('dialect', d.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12,
                    background: selected ? 'var(--accent-soft)' : 'var(--surface-2)',
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    color: d.available ? 'var(--text)' : 'var(--text-3)',
                    opacity: d.available ? 1 : 0.6,
                    textAlign: 'left',
                    cursor: d.available ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: selected ? 'var(--accent)' : 'transparent',
                    border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-2)'}`,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{d.notes}</div>
                  </div>
                  {!d.available && <Icon name="lock" size={12} color="var(--text-3)" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>DAILY GOAL</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{prefs.dailyGoal} min</span>
          </div>
          <input
            type="range" min={5} max={30} step={5}
            value={prefs.dailyGoal}
            onChange={e => setPref('dailyGoal', Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </div>

        {onOpenAdmin && (
          <button
            onClick={() => { onClose(); onOpenAdmin(); }}
            style={{
              marginTop: 20, width: '100%', padding: '10px 14px',
              borderRadius: 12, background: 'var(--surface-2)',
              border: '1px dashed var(--border-2)', color: 'var(--text-2)',
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name="lock" size={12} color="var(--text-3)" />
            OPEN ADMIN TOOL
          </button>
        )}
      </div>
    </div>
  );
}
