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

/** Capacitor Haptics impact styles (mapped to native UIImpactFeedbackGenerator / HapticFeedbackConstants) */
type ImpactStyle = 'light' | 'medium' | 'heavy';

/** Capacitor Haptics notification types */
type NotificationType = 'success' | 'warning' | 'error';

interface HapticSpec {
  /** Primary: Capacitor-native impact */
  impact?: ImpactStyle;
  /** Primary: Capacitor-native notification */
  notification?: NotificationType;
  /** Fallback: browser Vibration API pattern (ms array: wait, vibrate, wait, …) */
  vibrationPattern: number[];
  /** Minimum interval between firings (ms) to prevent spam */
  debounceMs: number;
}

/**
 * Refined haptic specifications per semantic event.
 * 
 * Each maps to the best native API where available,
 * with a vibration-API fallback for browsers.
 */
const HAPTIC_SPECS: Record<HapticEvent, HapticSpec> = {
  arrival: {
    impact: 'light',
    vibrationPattern: [0, 6],
    debounceMs: 2000,
  },
  completion: {
    impact: 'medium',
    vibrationPattern: [0, 15],
    debounceMs: 200,
  },
  reward: {
    notification: 'success',
    vibrationPattern: [0, 12, 50, 12, 50, 20],   // ascending triple pulse
    debounceMs: 400,
  },
  mentor_presence: {
    impact: 'light',
    vibrationPattern: [0, 6],
    debounceMs: 800,
  },
  warning: {
    notification: 'warning',
    vibrationPattern: [0, 30, 80, 30],            // slow restrained double
    debounceMs: 1000,
  },
  insight: {
    impact: 'light',
    vibrationPattern: [0, 8, 40, 8],              // elegant double light tap
    debounceMs: 500,
  },
  confirmation: {
    impact: 'medium',
    vibrationPattern: [0, 12],
    debounceMs: 300,
  },
  navigation: {
    impact: 'light',
    vibrationPattern: [0, 4],
    debounceMs: 150,
  },
};

/* ── Platform detection ──────────────────────────────────── */

interface CapacitorHapticsPlugin {
  impact: (opts: { style: string }) => Promise<void>;
  notification: (opts: { type: string }) => Promise<void>;
  vibrate: (opts: { duration: number }) => Promise<void>;
}

let _capacitorHaptics: CapacitorHapticsPlugin | null | undefined; // undefined = not checked yet

async function getCapacitorHaptics(): Promise<CapacitorHapticsPlugin | null> {
  if (_capacitorHaptics !== undefined) return _capacitorHaptics;

  try {
    // Dynamic import so this module works in plain browsers without Capacitor
    const { Haptics } = await import('@capacitor/haptics' as string);
    if (Haptics?.impact) {
      _capacitorHaptics = Haptics as unknown as CapacitorHapticsPlugin;
    } else {
      _capacitorHaptics = null;
    }
  } catch {
    _capacitorHaptics = null;
  }
  return _capacitorHaptics;
}

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
 * 
 * Priority: Capacitor native → browser Vibration API → silent no-op.
 */
export async function triggerHaptic(event: HapticEvent, enabled: boolean = true): Promise<void> {
  if (!enabled) return;

  const spec = HAPTIC_SPECS[event];
  if (!spec) return;
  if (shouldDebounce(event, spec)) return;

  // Try Capacitor native first
  const haptics = await getCapacitorHaptics();
  if (haptics) {
    try {
      if (spec.notification) {
        await haptics.notification({ type: spec.notification });
      } else if (spec.impact) {
        await haptics.impact({ style: spec.impact.toUpperCase() });
      }
      return; // native succeeded
    } catch {
      // fall through to browser
    }
  }

  // Browser Vibration API fallback
  if (vibrateSupported()) {
    navigator.vibrate(spec.vibrationPattern);
  }
  // else: silent — no haptics available, no error
}
