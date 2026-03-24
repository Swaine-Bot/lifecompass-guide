/**
 * LifeStack Haptic Engine v2
 * 
 * Semantic haptic categories with refined patterns per event meaning.
 */

export type HapticEvent =
  | 'completion'         // micro move done, task done
  | 'reward'             // milestone, streak, level up
  | 'mentor_presence'    // mentor message arrives
  | 'warning'            // drift, violation
  | 'insight'            // mirror moment, daily signal
  | 'confirmation'       // goal created, reflection saved
  | 'navigation';        // screen transition (very subtle)

type HapticPattern =
  | { style: 'light' | 'medium' | 'heavy' }
  | { pattern: number[] };

const HAPTIC_MAP: Record<HapticEvent, HapticPattern> = {
  completion:       { style: 'medium' },
  reward:           { pattern: [0, 60, 40, 60, 40, 80] },  // triple ascending pulse
  mentor_presence:  { style: 'light' },
  warning:          { pattern: [0, 100, 60, 100] },          // slow double pulse
  insight:          { pattern: [0, 40, 30, 40] },            // gentle double tap
  confirmation:     { style: 'medium' },
  navigation:       { style: 'light' },
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
    const ms = haptic.style === 'light' ? 8 : haptic.style === 'medium' ? 20 : 35;
    navigator.vibrate(ms);
  }
}
