import { useState, useEffect, useRef, useCallback } from 'react';

/* ============================================================
   audio.js — TTS + microphone recording

   Notes:
   - speechSynthesis works in web, iOS WKWebView, and Android WebView.
     There's no Nubian voice anywhere, so we speak the romanized form
     ("nub" field) using the system's default voice. It's an
     approximation, not authoritative pronunciation.
   - MediaRecorder works the same way on all three. iOS additionally
     needs NSMicrophoneUsageDescription in Info.plist; Android needs
     RECORD_AUDIO in AndroidManifest.xml.
   ============================================================ */

const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, { rate = 0.85, pitch = 1, lang, onStart, onEnd } = {}) {
  if (!hasSpeech || !text) return null;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text));
  u.rate = rate;
  u.pitch = pitch;
  if (lang) u.lang = lang;
  if (onStart) u.addEventListener('start', onStart);
  if (onEnd) {
    u.addEventListener('end', onEnd);
    u.addEventListener('error', onEnd);
  }
  window.speechSynthesis.speak(u);
  return u;
}

export function cancelSpeech() {
  if (hasSpeech) window.speechSynthesis.cancel();
}

/* React hook: tracks playing state while speak() runs.
   Returns [playing, play] where play(text, opts?) starts an utterance. */
export function useSpeak() {
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => () => {
    cancelSpeech();
    setPlaying(false);
  }, []);

  const play = useCallback((text, opts = {}) => {
    setPlaying(true);
    utteranceRef.current = speak(text, {
      ...opts,
      onStart: () => { opts.onStart?.(); setPlaying(true); },
      onEnd: () => { opts.onEnd?.(); setPlaying(false); },
    });
  }, []);

  return [playing, play];
}

/* ── Recording ────────────────────────────────────────────── */

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/aac',
    '',
  ];
  for (const m of candidates) {
    if (m === '' || MediaRecorder.isTypeSupported?.(m)) return m;
  }
  return '';
}

/* React hook: useRecorder()
   Returns:
   - recording: boolean
   - audioUrl: string|null  (object URL of last recording)
   - error: string|null
   - start(): begin recording, requests mic permission if needed
   - stop(): stop recording (audioUrl populates)
   - reset(): clear current recording */
export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const urlRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch {}
    }
    stopStream();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      setAudioUrl(null);
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone not available on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setAudioUrl(url);
        stopStream();
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (e) {
      setError(e?.message || 'Microphone permission denied.');
      stopStream();
      setRecording(false);
    }
  }, []);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state === 'recording') {
      try { r.stop(); } catch {}
    }
    setRecording(false);
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
    setError(null);
  }, []);

  return { recording, audioUrl, error, start, stop, reset };
}

/* Play an Audio URL. Returns the HTMLAudioElement so callers can hook events. */
export function playAudio(url, { onEnd } = {}) {
  if (!url) return null;
  const audio = new Audio(url);
  if (onEnd) {
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onEnd);
  }
  audio.play().catch(() => onEnd?.());
  return audio;
}
