/**
 * LifeStack Sound Engine v3
 * 
 * Production-grade sound system with real WAV assets as primary path
 * and synthesized fallbacks for offline/error scenarios.
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

interface SynthConfig {
  freq: number;
  duration: number;
  type: OscillatorType;
  harmonics?: number[];
}

interface SoundSlot {
  /** Real audio file path (relative to public/) */
  fileUrl: string;
  /** Synthesizer fallback config */
  synth: SynthConfig;
  /** Semantic category */
  category: SoundCategory;
}

/**
 * Sound slot registry — file-based assets are primary, synth is fallback.
 * 
 * Sound design intent per event:
 * - app_open:            grounded C major arrival (C4+G4+C5)
 * - mentor_response:     light high-register presence ping
 * - micro_move_complete: rising E5→G5 completion cue
 * - daily_signal:        bell-like F5 chime
 * - milestone_reached:   C5→E5→G5 major arpeggio with shimmer
 * - warning_drift:       low Bb3 triangle-wave caution tone
 * - reflection_saved:    gentle D5→C5 descending confirmation
 * - goal_created:        G4→B4→D5 ascending initiation
 * - streak_continued:    quick bright G5 tap
 * - insight_arrival:     crystalline A5 shimmer chord
 */
const SOUND_SLOTS: Record<SoundEvent, SoundSlot> = {
  app_open: {
    fileUrl: '/sounds/app-open.wav',
    synth: { freq: 261.6, duration: 0.5, type: 'sine' },
    category: 'ambient',
  },
  mentor_response: {
    fileUrl: '/sounds/mentor-response.wav',
    synth: { freq: 880, duration: 0.25, type: 'sine' },
    category: 'presence',
  },
  micro_move_complete: {
    fileUrl: '/sounds/micro-move-complete.wav',
    synth: { freq: 660, duration: 0.3, type: 'sine', harmonics: [1320] },
    category: 'completion',
  },
  daily_signal: {
    fileUrl: '/sounds/daily-signal.wav',
    synth: { freq: 698, duration: 0.6, type: 'sine' },
    category: 'ambient',
  },
  milestone_reached: {
    fileUrl: '/sounds/milestone-reached.wav',
    synth: { freq: 523, duration: 0.7, type: 'sine', harmonics: [659, 784] },
    category: 'reward',
  },
  warning_drift: {
    fileUrl: '/sounds/warning-drift.wav',
    synth: { freq: 233, duration: 0.4, type: 'triangle' },
    category: 'alert',
  },
  reflection_saved: {
    fileUrl: '/sounds/reflection-saved.wav',
    synth: { freq: 587, duration: 0.3, type: 'sine' },
    category: 'completion',
  },
  goal_created: {
    fileUrl: '/sounds/goal-created.wav',
    synth: { freq: 392, duration: 0.4, type: 'sine', harmonics: [494, 587] },
    category: 'reward',
  },
  streak_continued: {
    fileUrl: '/sounds/streak-continued.wav',
    synth: { freq: 784, duration: 0.2, type: 'sine' },
    category: 'reward',
  },
  insight_arrival: {
    fileUrl: '/sounds/insight-arrival.wav',
    synth: { freq: 880, duration: 0.45, type: 'sine', harmonics: [1109, 1319] },
    category: 'presence',
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

// ─── File audio buffer cache ────────────────────────────────────────────────

const audioBufferCache = new Map<string, AudioBuffer>();
const failedUrls = new Set<string>();

async function loadAudioFile(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  if (failedUrls.has(url)) return null;
  if (audioBufferCache.has(url)) return audioBufferCache.get(url)!;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buf);
    audioBufferCache.set(url, decoded);
    return decoded;
  } catch {
    failedUrls.add(url);
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

  // File-based audio is the primary path
  loadAudioFile(ctx, slot.fileUrl).then((buffer) => {
    if (!buffer) {
      // Fallback to synth if file fails
      playSynth(ctx, slot.synth, volume);
      return;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  });
}

function playSynth(ctx: AudioContext, synth: SynthConfig, volume: number): void {
  const { freq, duration, type, harmonics } = synth;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  masterGain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

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

/** Preload sound files into the buffer cache for zero-latency playback */
export function preloadSound(event: SoundEvent): void {
  const slot = SOUND_SLOTS[event];
  if (!slot?.fileUrl) return;
  const ctx = getAudioContext();
  if (ctx) loadAudioFile(ctx, slot.fileUrl);
}

/** Preload the most commonly used sounds */
export function preloadCoreSounds(): void {
  const core: SoundEvent[] = ['micro_move_complete', 'mentor_response', 'daily_signal', 'milestone_reached'];
  for (const event of core) preloadSound(event);
}
