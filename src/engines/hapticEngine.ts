/**
 * LifeStack Haptic Engine
 * Maps events to device haptics with graceful fallback.
 */

export type HapticEvent =
  | 'micro_move_complete'
  | 'milestone_reached'
  | 'mentor_response'
  | 'warning';

type HapticPattern = { style: 'light' | 'medium' | 'heavy'; duration?: number } | { pattern: number[] };

const HAPTIC_MAP: Record<HapticEvent, HapticPattern> = {
  micro_move_complete: { style: 'medium' },
  milestone_reached: { pattern: [0, 80, 60, 80] }, // double pulse
  mentor_response: { style: 'light' },
  warning: { pattern: [0, 120, 80, 120] }, // slow pulse
};

function vibrateSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function triggerHaptic(event: HapticEvent, enabled: boolean = true): void {
  if (!enabled || !vibrateSupported()) return;

  const haptic = HAPTIC_MAP[event];

  if ('pattern' in haptic) {
    navigator.vibrate(haptic.pattern);
  } else {
    const ms = haptic.style === 'light' ? 10 : haptic.style === 'medium' ? 25 : 40;
    navigator.vibrate(ms);
  }
}
