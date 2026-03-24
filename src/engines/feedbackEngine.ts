/**
 * LifeStack Feedback Engine v3
 * 
 * Unified dispatcher with emotionally-coherent sound + haptic + visual pairings.
 */

import { playSound, type SoundIntensity, type SoundEvent } from './soundEngine';
import { triggerHaptic, type HapticEvent } from './hapticEngine';

export type FeedbackEvent =
  | 'micro_move_complete'
  | 'milestone_reached'
  | 'mentor_response'
  | 'daily_signal'
  | 'mirror_moment'
  | 'app_open'
  | 'goal_created'
  | 'reflection_saved'
  | 'streak_continued'
  | 'warning_drift'
  | 'insight_arrival';

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

/**
 * Event → sound + haptic routing table.
 * 
 * Coherence rules applied:
 * - reward sounds pair with reward haptics (rich pattern)
 * - warning sounds pair with warning haptics (restrained)
 * - presence cues stay light across both channels
 * - completion is grounded and precise
 * - app_open uses the dedicated 'arrival' haptic
 */
const EVENT_ROUTING: Record<FeedbackEvent, { sound: SoundEvent; haptic: HapticEvent }> = {
  app_open:            { sound: 'app_open',             haptic: 'arrival' },
  micro_move_complete: { sound: 'micro_move_complete',  haptic: 'completion' },
  milestone_reached:   { sound: 'milestone_reached',    haptic: 'reward' },
  mentor_response:     { sound: 'mentor_response',      haptic: 'mentor_presence' },
  daily_signal:        { sound: 'daily_signal',         haptic: 'insight' },
  mirror_moment:       { sound: 'insight_arrival',      haptic: 'insight' },
  goal_created:        { sound: 'goal_created',         haptic: 'confirmation' },
  reflection_saved:    { sound: 'reflection_saved',     haptic: 'confirmation' },
  streak_continued:    { sound: 'streak_continued',     haptic: 'reward' },
  warning_drift:       { sound: 'warning_drift',        haptic: 'warning' },
  insight_arrival:     { sound: 'insight_arrival',      haptic: 'insight' },
};

export function dispatchFeedback(event: FeedbackEvent): void {
  const route = EVENT_ROUTING[event];
  if (!route) return;

  playSound(route.sound, currentPrefs.soundIntensity);

  // triggerHaptic is now async but we fire-and-forget
  triggerHaptic(route.haptic, currentPrefs.hapticsEnabled);

  // Visual pulse
  if (currentPrefs.visualMode === 'dynamic' && pulseListener) {
    pulseListener(event);
  }
}
