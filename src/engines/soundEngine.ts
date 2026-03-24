/**
 * LifeStack Sound Engine v2
 * 
 * Enhanced sound slot system with semantic categories.
 * Supports future real audio file slots alongside synthesized fallbacks.
 */

export type SoundEvent =
  | 'app_open'
  | 'micro_move_complete'
  | 'mentor_response'
  | 'daily_signal'
  | 'milestone_reached'
  | 'warning_drift'
  | 'reflection_saved'
  | 'insight_arrival'
  | 'goal_created'
  | 'streak_continued';

export type SoundIntensity = 'off' | 'low' | 'normal';

export type SoundCategory = 'completion' | 'reward' | 'presence' | 'alert' | 'ambient';

interface SoundSlot {
  /** Synthesizer fallback config */
  synth: { freq: number; duration: number; type: OscillatorType; harmonics?: number[] };
  /** Optional real audio file URL — when set, plays instead of synth */
  fileUrl?: string;
  /** Semantic category for grouping */
  category: SoundCategory;
}

const SOUND_SLOTS: Record<SoundEvent, SoundSlot> = {
  app_open: {
    synth: { freq: 520, duration: 0.15, type: 'sine' },
    category: 'ambient',
  },
  micro_move_complete: {
    synth: { freq: 660, duration: 0.12, type: 'sine', harmonics: [1320] },
    category: 'completion',
  },
  mentor_response: {
    synth: { freq: 440, duration: 0.08, type: 'triangle' },
    category: 'presence',
  },
  daily_signal: {
    synth: { freq: 580, duration: 0.18, type: 'sine' },
    category: 'ambient',
  },
  milestone_reached: {
    synth: { freq: 780, duration: 0.3, type: 'sine', harmonics: [1170, 1560] },
    category: 'reward',
  },
  warning_drift: {
    synth: { freq: 320, duration: 0.2, type: 'triangle' },
    category: 'alert',
  },
  reflection_saved: {
    synth: { freq: 500, duration: 0.1, type: 'sine' },
    category: 'completion',
  },
  insight_arrival: {
    synth: { freq: 620, duration: 0.14, type: 'sine', harmonics: [930] },
    category: 'presence',
  },
  goal_created: {
    synth: { freq: 700, duration: 0.2, type: 'sine', harmonics: [1050] },
    category: 'reward',
  },
  streak_continued: {
    synth: { freq: 740, duration: 0.15, type: 'sine' },
    category: 'reward',
  },
};

// ─── Audio Context ──────────────────────────────────────────────────────────

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

// ─── File audio cache ───────────────────────────────────────────────────────

const audioBufferCache = new Map<string, AudioBuffer>();

async function loadAudioFile(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(url)) return audioBufferCache.get(url)!;
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buf);
    audioBufferCache.set(url, decoded);
    return decoded;
  } catch {
    return null;
  }
}

// ─── Debounce ───────────────────────────────────────────────────────────────

let lastPlayTime = 0;
const DEBOUNCE_MS = 150;

// ─── Play ───────────────────────────────────────────────────────────────────

export function playSound(event: SoundEvent, intensity: SoundIntensity = 'normal'): void {
  if (intensity === 'off') return;

  const now = Date.now();
  if (now - lastPlayTime < DEBOUNCE_MS) return;
  lastPlayTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const slot = SOUND_SLOTS[event];
  if (!slot) return;

  const volume = intensity === 'low' ? 0.06 : 0.12;

  // Try file-based audio first
  if (slot.fileUrl) {
    loadAudioFile(ctx, slot.fileUrl).then((buffer) => {
      if (!buffer) { playSynth(ctx, slot, volume); return; }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    });
    return;
  }

  playSynth(ctx, slot, volume);
}

function playSynth(ctx: AudioContext, slot: SoundSlot, volume: number): void {
  const { freq, duration, type, harmonics } = slot.synth;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  masterGain.connect(ctx.destination);

  // Fundamental
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

  // Harmonics (richer sound for rewards)
  if (harmonics) {
    for (const hFreq of harmonics) {
      const hOsc = ctx.createOscillator();
      const hGain = ctx.createGain();
      hOsc.type = type;
      hOsc.frequency.value = hFreq;
      hGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      hGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.8);
      hOsc.connect(hGain);
      hGain.connect(ctx.destination);
      hOsc.start(ctx.currentTime);
      hOsc.stop(ctx.currentTime + duration);
    }
  }
}

/** Preload a file-based sound into the buffer cache */
export function preloadSound(event: SoundEvent): void {
  const slot = SOUND_SLOTS[event];
  if (!slot?.fileUrl) return;
  const ctx = getAudioContext();
  if (ctx) loadAudioFile(ctx, slot.fileUrl);
}
