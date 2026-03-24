/**
 * LifeStack Feedback Engine
 * Unified dispatcher that connects actions → sensory outputs (visual, sound, haptic).
 */

import { playSound, type SoundIntensity } from './soundEngine';
import { triggerHaptic } from './hapticEngine';

export type FeedbackEvent =
  | 'micro_move_complete'
  | 'milestone_reached'
  | 'mentor_response'
  | 'daily_signal'
  | 'mirror_moment'
  | 'app_open';

export interface FeedbackPreferences {
  soundIntensity: SoundIntensity;
  hapticsEnabled: boolean;
  visualMode: 'static' | 'dynamic';
}

const DEFAULT_PREFS: FeedbackPreferences = {
  soundIntensity: 'off',
  hapticsEnabled: true,
  visualMode: 'dynamic',
};

let currentPrefs: FeedbackPreferences = { ...DEFAULT_PREFS };

/** Visual pulse callbacks registered by the UI layer */
type PulseCallback = (event: FeedbackEvent) => void;
let pulseListener: PulseCallback | null = null;

export function setFeedbackPreferences(prefs: Partial<FeedbackPreferences>): void {
  currentPrefs = { ...currentPrefs, ...prefs };
}

export function getFeedbackPreferences(): FeedbackPreferences {
  return { ...currentPrefs };
}

export function registerPulseListener(cb: PulseCallback): () => void {
  pulseListener = cb;
  return () => { pulseListener = null; };
}

export function dispatchFeedback(event: FeedbackEvent): void {
  // Sound
  switch (event) {
    case 'micro_move_complete':
      playSound('micro_move_complete', currentPrefs.soundIntensity);
      triggerHaptic('micro_move_complete', currentPrefs.hapticsEnabled);
      break;
    case 'milestone_reached':
      playSound('milestone_reached', currentPrefs.soundIntensity);
      triggerHaptic('milestone_reached', currentPrefs.hapticsEnabled);
      break;
    case 'mentor_response':
      playSound('mentor_response', currentPrefs.soundIntensity);
      triggerHaptic('mentor_response', currentPrefs.hapticsEnabled);
      break;
    case 'daily_signal':
      playSound('daily_signal', currentPrefs.soundIntensity);
      break;
    case 'app_open':
      playSound('app_open', currentPrefs.soundIntensity);
      break;
    case 'mirror_moment':
      triggerHaptic('mentor_response', currentPrefs.hapticsEnabled);
      break;
  }

  // Visual pulse
  if (currentPrefs.visualMode === 'dynamic' && pulseListener) {
    pulseListener(event);
  }
}
