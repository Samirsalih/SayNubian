import React, { useState, useEffect, useRef } from 'react';
import { Icon, Waveform, LiveWaveform } from '../lib/primitives.jsx';

/* CHAT — talk to "Eeni", an AI tutor that replies from a memorized corpus. */

const CHAT_CORPUS = [
  { match: /^(hi|hello|hey|good\s*morning|masha)/i,
    reply: { script: 'ⲙⲁϣⲁ ⲥⲓⲣⲣⲓ! ⲙⲁ ⲁⲣⲣⲓⲕ?', nub: 'masha sirri! ma arrik?', en: 'Good morning! How are you?' } },
  { match: /(how are you|ma arrik|how r u)/i,
    reply: { script: 'ⲥⲓⲣⲣⲓ-ⲁⲓ, ⲁϣⲣⲓ. ⲩⲛⲇⲩ?', nub: 'sirri-ai, ashri. undu?', en: 'I am well, thank you. And you?' } },
  { match: /(i am fine|sirri|good|fine)/i,
    reply: { script: 'ⲇⲩⲩⲙⲓⲛ-ⲁⲓ! ⲁⲣⲣⲓⲕⲩⲛⲇⲩ?', nub: 'duumin-ai! arrikundu?', en: "I'm happy! What's your name?" } },
  { match: /(my name is|i am|aiyi nem|nem-ai)\s+(.+)/i,
    reply: ({ m }) => ({
      script: 'ⲁϣⲣⲓ, ' + (m[2] || 'tood') + '. ⲁⲓⲩⲓ ⲛⲉⲙ-ⲁⲓ ⲉⲉⲛⲓ.',
      nub: 'ashri, ' + (m[2] || 'friend') + '. aiyi nem-ai eeni.',
      en: 'Nice to meet you, ' + (m[2] || 'friend') + '. My name is Eeni.',
    }) },
  { match: /(what.*your name|nem-uk|whats your name)/i,
    reply: { script: 'ⲁⲓⲩⲓ ⲛⲉⲙ-ⲁⲓ ⲉⲉⲛⲓ.', nub: 'aiyi nem-ai eeni.', en: 'My name is Eeni.' } },
  { match: /(tired|gaaru|sleep)/i,
    reply: { script: 'ⲩⲗⲩ ⲁⲣⲣⲓⲕⲩ — ⲅⲁⲁⲣⲩ ⲩⲛ. ⲇⲱⲱ-ⲁⲓ ⲩⲛⲇⲩ.', nub: 'ulu arriku — gaaru un. dow-ai undu.', en: 'I see — you are tired. Rest well.' } },
  { match: /(happy|duumin|good)/i,
    reply: { script: 'ⲁϣⲣⲓ! ⲇⲩⲩⲙⲓⲛ ⲩⲛⲇⲩ.', nub: 'ashri! duumin undu.', en: 'Wonderful! You are happy.' } },
  { match: /(hungry|kaab|food)/i,
    reply: { script: 'ⲕⲁⲁⲃ ⲩⲛⲇⲩ? ⲣⲁⲙ-ⲁⲓ ⲇⲟⲗ.', nub: 'kaab undu? ram-ai dol.', en: "You're hungry? Let's eat together." } },
  { match: /(sick|koongir|ill|hurt)/i,
    reply: { script: 'ⲕⲟⲟⲛⲅⲓⲣ ⲩⲛⲇⲩ. ⲇⲟⲕⲧⲟⲣ ⲗⲁⲙ-ⲁⲓ.', nub: 'koongir undu. doctor lam-ai.', en: "You are sick. Let's see a doctor." } },
  { match: /(mother|eeni|mom|mama)/i,
    reply: { script: 'ⲉⲉⲛⲓ — "mother." ⲁⲓⲩⲓ ⲉⲉⲛⲓ ⲇⲩⲩⲙⲓⲛ.', nub: 'eeni — "mother." aiyi eeni duumin.', en: 'Eeni means "mother." My mother is happy.' } },
  { match: /(father|baaba|dad|papa)/i,
    reply: { script: 'ⲃⲁⲁⲃⲁ — "father." ⲁⲓⲩⲓ ⲃⲁⲁⲃⲁ ⲇⲁⲱⲓ.', nub: 'baaba — "father." aiyi baaba dawwi.', en: 'Baaba means "father." My father is great.' } },
  { match: /(family|home|noog|house)/i,
    reply: { script: 'ⲛⲟⲟⲅ — "house." ⲛⲟⲟⲅ-ⲁⲓ ⲇⲁⲱⲓ.', nub: 'noog — "house." noog-ai dawwi.', en: 'Noog means "house." My house is big.' } },
  { match: /(thank|ashri|thx)/i,
    reply: { script: 'ⲁϣⲣⲓ ⲩⲛⲇⲩ.', nub: 'ashri undu.', en: 'You are welcome.' } },
  { match: /(bye|goodbye|see you|salam)/i,
    reply: { script: 'ⲇⲱⲱ ⲩⲛⲇⲩ. ⲗⲁⲙ-ⲁⲓ ⲩⲛⲇⲩ ⲡⲏⲏⲗⲁ.', nub: 'dow undu. lam-ai undu peela.', en: 'Take care. See you tomorrow.' } },
  { match: /(help|what (do|should) i say|teach me|i don't know)/i,
    reply: { script: 'ⲁⲣⲣⲓⲕ — "ⲙⲁ ⲁⲣⲣⲓⲕ?"', nub: 'try saying "ma arrik?"', en: 'Try saying "ma arrik?" — that means "how are you?"' } },
];

const FALLBACK = {
  script: 'ⲩⲗⲩ ⲁⲣⲣⲓⲕⲩ. ⲗⲁⲙ-ⲁⲓ?',
  nub: 'ulu arriku. lam-ai?',
  en: 'I\'m not sure — can you try a greeting like "masha sirri" or ask about family, feelings, or food?',
};

function aiReply(userText) {
  for (const e of CHAT_CORPUS) {
    const m = userText.match(e.match);
    if (m) return typeof e.reply === 'function' ? e.reply({ m }) : e.reply;
  }
  return FALLBACK;
}

const PROMPTS = [
  { en: 'Greet me', user: 'hello' },
  { en: 'Ask my name', user: 'what is your name?' },
  { en: "Say I'm hungry", user: "I'm hungry" },
  { en: 'Talk about family', user: 'tell me about your mother' },
  { en: 'Say goodbye', user: 'bye' },
];

export default function Chat() {
  const [messages, setMessages] = useState([
    { who: 'ai', t: { script: 'ⲙⲁϣⲁ ⲥⲓⲣⲣⲓ!', nub: 'masha sirri!', en: "Good morning! I'm Eeni — I'll only reply in Nubian. Try saying hello." } },
  ]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [thinking, setThinking] = useState(false);
  const recordTimer = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  function send(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setMessages(m => [...m, { who: 'me', t: { en: trimmed } }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setMessages(m => [...m, { who: 'ai', t: aiReply(trimmed) }]);
      setThinking(false);
    }, 700 + Math.random() * 500);
  }

  function toggleRecord() {
    if (recording) {
      clearTimeout(recordTimer.current);
      setRecording(false);
      const samples = ['masha sirri', 'ma arrik?', 'ashri', 'I am hungry', 'tell me about my mother'];
      send(samples[Math.floor(Math.random() * samples.length)]);
    } else {
      setRecording(true);
      recordTimer.current = setTimeout(() => {
        setRecording(false);
        const samples = ['masha sirri', 'ma arrik?', 'ashri', 'I am hungry'];
        send(samples[Math.floor(Math.random() * samples.length)]);
      }, 2200);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{
        padding: '14px 16px 12px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--hero-1), var(--hero-3))',
          color: 'white',
          display: 'grid', placeItems: 'center',
          position: 'relative', flexShrink: 0,
        }}>
          <span className="nubian" style={{ fontSize: 22, lineHeight: 1 }}>ⲉⲉ</span>
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--ok)', border: '2px solid var(--surface)',
          }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>Eeni</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            AI TUTOR · KNOWS 4 DIALOGS
          </div>
        </div>
        <button onClick={() => setShowTranslation(s => !s)} style={{
          padding: '6px 10px', borderRadius: 999,
          background: showTranslation ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: showTranslation ? 'var(--accent-fg)' : 'var(--text-3)',
          fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
          border: `1px solid ${showTranslation ? 'var(--accent)' : 'var(--border)'}`,
        }}>EN {showTranslation ? 'ON' : 'OFF'}</button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <Bubble key={i} m={m} showTranslation={showTranslation} />
        ))}
        {thinking && <ThinkingBubble />}
        {messages.length <= 1 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8, padding: '0 4px' }}>TRY ASKING</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PROMPTS.map(p => (
                <button key={p.en} onClick={() => send(p.user)} style={{
                  padding: '8px 12px', borderRadius: 999,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
                }}>{p.en}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: '10px 12px 14px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}>
        {recording ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 22,
            background: 'var(--bad-soft)', border: '1px solid var(--bad)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bad)', color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="mic" size={16} color="white" />
            </div>
            <LiveWaveform listening height={32} />
            <button onClick={toggleRecord} style={{
              padding: '8px 12px', borderRadius: 12,
              background: 'var(--bad)', color: 'white',
              fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
              flexShrink: 0,
            }}>STOP</button>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            padding: '6px 6px 6px 14px', borderRadius: 22,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
          }}>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Type in Nubian or English…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', fontSize: 14, fontFamily: 'var(--font-sans)',
                padding: '8px 0', maxHeight: 80,
              }}
            />
            {input.trim() ? (
              <button onClick={() => send(input)} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--accent)', color: 'white',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name="send" size={16} color="white" />
              </button>
            ) : (
              <button onClick={toggleRecord} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--accent)', color: 'white',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name="mic" size={16} color="white" />
              </button>
            )}
          </div>
        )}
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 8 }}>
          EENI ANSWERS FROM A SET DIALOG MEMORY · NOT A FREE-FORM LLM
        </div>
      </div>
    </div>
  );
}

function Bubble({ m, showTranslation }) {
  const [playing, setPlaying] = useState(false);
  const isMe = m.who === 'me';
  const t = m.t;

  if (isMe) {
    return (
      <div className="fade-in" style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
        <div style={{
          padding: '10px 14px', borderRadius: '20px 20px 4px 20px',
          background: 'var(--accent)', color: 'white',
          fontSize: 14, lineHeight: 1.4,
        }}>{t.en}</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
      <div style={{
        padding: '12px 14px', borderRadius: '20px 20px 20px 4px',
        background: 'var(--surface)', border: '1px solid var(--border)',
      }}>
        <div className="nubian" style={{ fontSize: 22, lineHeight: 1.2, color: 'var(--text)' }}>{t.script}</div>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)', marginTop: 4 }}>{t.nub}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <button onClick={() => setPlaying(p => !p)} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: playing ? 'var(--accent)' : 'var(--accent-soft)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name={playing ? 'pause' : 'play'} size={12} color={playing ? 'white' : 'var(--accent)'} />
          </button>
          <Waveform seed={t.nub.charCodeAt(0) || 5} bars={20} height={18} progress={playing ? 0.5 : 0} active={playing} color="var(--text-3)" />
        </div>

        {showTranslation && (
          <div style={{
            marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)',
            fontSize: 12, color: 'var(--text-3)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', marginRight: 6 }}>EN</span>
            {t.en}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="fade-in" style={{ alignSelf: 'flex-start' }}>
      <div style={{
        padding: '12px 16px', borderRadius: '20px 20px 20px 4px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)',
            animation: `pulse-soft 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}/>
        ))}
      </div>
    </div>
  );
}
