/**
 * Web Speech API hook — voice in (recognition) + voice out (synthesis).
 * No keys, no servers. Works on iOS Safari 14+, Chrome, Edge, Android.
 * Gracefully no-ops on unsupported browsers (`supported === false`).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type SR = any;

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface UseVoiceMentorOptions {
  /** Called once recognition finalizes a user utterance. */
  onTranscript?: (text: string) => void;
  /** Continuous = stays on between phrases. */
  continuous?: boolean;
  lang?: string;
}

export function useVoiceMentor(opts: UseVoiceMentorOptions = {}) {
  const { onTranscript, continuous = false, lang } = opts;

  const SRImpl =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

  const supported = !!SRImpl && typeof window !== 'undefined' && 'speechSynthesis' in window;

  const recognitionRef = useRef<SR | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ── Setup recognition lazily on first start
  const ensureRecognition = useCallback(() => {
    if (!SRImpl) return null;
    if (recognitionRef.current) return recognitionRef.current;
    const r: SR = new SRImpl();
    r.continuous = continuous;
    r.interimResults = true;
    r.lang = lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
    r.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim('');
        onTranscriptRef.current?.(finalText.trim());
      }
    };
    r.onerror = (e: any) => {
      setError(e?.error || 'recognition_error');
      setListening(false);
    };
    r.onend = () => {
      setListening(false);
      setInterim('');
    };
    recognitionRef.current = r;
    return r;
  }, [SRImpl, continuous, lang]);

  const start = useCallback(async () => {
    if (!supported) {
      setError('Voice not supported on this device.');
      return;
    }
    setError(null);
    try {
      // Prompt for mic perms early so iOS doesn't fail silently
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      setError('Microphone access denied.');
      return;
    }
    const r = ensureRecognition();
    if (!r) return;
    try {
      r.start();
      setListening(true);
    } catch {
      // already-started errors are safe to ignore
    }
  }, [supported, ensureRecognition]);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  // ── Speech synthesis
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text?.trim()) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text.replace(/[*_`#>]/g, ''));
      utt.lang = lang || navigator.language || 'en-US';
      utt.rate = 1;
      utt.pitch = 1;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    } catch {
      setSpeaking(false);
    }
  }, [lang]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => () => { stop(); stopSpeaking(); }, [stop, stopSpeaking]);

  return { supported, listening, speaking, interim, error, start, stop, speak, stopSpeaking };
}
