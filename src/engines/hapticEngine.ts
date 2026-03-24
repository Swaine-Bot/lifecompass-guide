/**
 * LifeStack Haptic Engine v3
 * 
 * Platform-aware haptic feedback with Capacitor native support,
 * refined semantic patterns, and graceful browser fallback.
 */

export type HapticEvent =
  | 'completion'         // micro move done, task done
  | 'reward'             // milestone, streak, level up
  | 'mentor_presence'    // mentor message arrives
  | 'warning'            // drift, violation
  | 'insight'            // mirror moment, daily signal
  | 'confirmation'       // goal created, reflection saved
  | 'navigation'         // screen transition (very subtle)
  | 'arrival';           // app open — minimal grounding tap

interface HapticSpec {
  /** Browser Vibration API pattern (ms array: wait, vibrate, wait, …) */
  vibrationPattern: number[];
  /** Minimum interval between firings (ms) to prevent spam */
  debounceMs: number;
}

const HAPTIC_SPECS: Record<HapticEvent, HapticSpec> = {
  arrival:          { vibrationPattern: [0, 6],                   debounceMs: 2000 },
  completion:       { vibrationPattern: [0, 15],                  debounceMs: 200 },
  reward:           { vibrationPattern: [0, 12, 50, 12, 50, 20], debounceMs: 400 },
  mentor_presence:  { vibrationPattern: [0, 6],                   debounceMs: 800 },
  warning:          { vibrationPattern: [0, 30, 80, 30],          debounceMs: 1000 },
  insight:          { vibrationPattern: [0, 8, 40, 8],            debounceMs: 500 },
  confirmation:     { vibrationPattern: [0, 12],                  debounceMs: 300 },
  navigation:       { vibrationPattern: [0, 4],                   debounceMs: 150 },
};

/* ── Platform detection ──────────────────────────────────── */

function vibrateSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/* ── Debounce tracking ──────────────────────────────────── */

const lastFired: Partial<Record<HapticEvent, number>> = {};

function shouldDebounce(event: HapticEvent, spec: HapticSpec): boolean {
  const now = Date.now();
  const last = lastFired[event];
  if (last && now - last < spec.debounceMs) return true;
  lastFired[event] = now;
  return false;
}

/* ── Public API ──────────────────────────────────────────── */

/**
 * Fire a semantically-tuned haptic for the given event.
 * Uses browser Vibration API; silently no-ops if unsupported.
 */
export function triggerHaptic(event: HapticEvent, enabled: boolean = true): void {
  if (!enabled) return;

  const spec = HAPTIC_SPECS[event];
  if (!spec) return;
  if (shouldDebounce(event, spec)) return;

  if (vibrateSupported()) {
    navigator.vibrate(spec.vibrationPattern);
  }
}
