/**
 * LifeStack Sound Engine
 * Intentional, minimal audio cues. All sounds are opt-in.
 */

export type SoundEvent =
  | 'app_open'
  | 'micro_move_complete'
  | 'mentor_response'
  | 'daily_signal'
  | 'milestone_reached';

export type SoundIntensity = 'off' | 'low' | 'normal';

// Inline tiny base64 tones (< 2KB each) so we ship zero network requests.
// These are sine-wave blips generated programmatically.
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

const SOUND_PROFILES: Record<SoundEvent, { freq: number; duration: number; type: OscillatorType }> = {
  app_open: { freq: 520, duration: 0.15, type: 'sine' },
  micro_move_complete: { freq: 660, duration: 0.12, type: 'sine' },
  mentor_response: { freq: 440, duration: 0.08, type: 'triangle' },
  daily_signal: { freq: 580, duration: 0.18, type: 'sine' },
  milestone_reached: { freq: 780, duration: 0.25, type: 'sine' },
};

let lastPlayTime = 0;
const DEBOUNCE_MS = 200;

export function playSound(event: SoundEvent, intensity: SoundIntensity = 'normal'): void {
  if (intensity === 'off') return;

  const now = Date.now();
  if (now - lastPlayTime < DEBOUNCE_MS) return;
  lastPlayTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const profile = SOUND_PROFILES[event];
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();

  osc.type = profile.type;
  osc.frequency.value = profile.freq;

  const volume = intensity === 'low' ? 0.08 : 0.15;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + profile.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + profile.duration);
}
