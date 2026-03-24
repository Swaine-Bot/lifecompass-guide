/**
 * LifeStack Sensory Choreography Engine
 * 
 * Defines per-screen and per-action sensory rules to ensure
 * emotional precision without sensory fatigue.
 * 
 * Philosophy:
 * - Silence is a sensory choice
 * - Reward must feel earned
 * - Presence stays subtle
 * - Reflection stays quiet
 */

import { dispatchFeedback, type FeedbackEvent } from './feedbackEngine';

/* ── Screen choreography rules ──────────────────────────── */

export type ChoreographyScreen =
  | 'home' | 'mentor' | 'goals' | 'goal_detail'
  | 'habits' | 'journal' | 'daily_signal'
  | 'mirror' | 'cinematics' | 'vault'
  | 'share_studio' | 'insight_library'
  | 'life_events' | 'settings' | 'calendar'
  | 'community';

interface ScreenChoreography {
  /** Fire app_open feedback on screen entry */
  entryFeedback: boolean;
  /** Actions that trigger full sound+haptic+visual */
  fullFeedbackActions: FeedbackEvent[];
  /** Actions that trigger haptic-only (silent) */
  hapticOnlyActions: FeedbackEvent[];
  /** Actions that are completely silent */
  silentActions: FeedbackEvent[];
}

/**
 * Per-screen choreography rules.
 * 
 * Default behavior for unlisted actions: full feedback.
 * Listed in silentActions → no output at all.
 * Listed in hapticOnlyActions → haptic only, no sound.
 */
const SCREEN_RULES: Record<ChoreographyScreen, ScreenChoreography> = {
  home: {
    entryFeedback: false, // app_open fires once globally, not per screen visit
    fullFeedbackActions: [
      'micro_move_complete',
      'milestone_reached',
      'streak_continued',
      'daily_signal',
    ],
    hapticOnlyActions: [
      'goal_created',
    ],
    silentActions: [
      'mentor_response',  // not on home screen
      'mirror_moment',
    ],
  },

  mentor: {
    entryFeedback: false,  // no loud entry — calm presence
    fullFeedbackActions: [
      'mentor_response',   // subtle presence cue
      'insight_arrival',
    ],
    hapticOnlyActions: [],
    silentActions: [
      'micro_move_complete', // micro moves created from mentor stay quiet
      'daily_signal',
      'mirror_moment',
    ],
  },

  goals: {
    entryFeedback: false,
    fullFeedbackActions: [
      'goal_created',
      'milestone_reached',
    ],
    hapticOnlyActions: [
      'micro_move_complete',
    ],
    silentActions: [
      'mentor_response',
      'daily_signal',
    ],
  },

  goal_detail: {
    entryFeedback: false,
    fullFeedbackActions: [
      'milestone_reached',
      'micro_move_complete',
    ],
    hapticOnlyActions: [
      'goal_created', // editing a goal = quiet confirmation
    ],
    silentActions: [],
  },

  habits: {
    entryFeedback: false,
    fullFeedbackActions: [
      'streak_continued',
    ],
    hapticOnlyActions: [
      'micro_move_complete', // individual habit check = haptic only, no sound spam
    ],
    silentActions: [
      'mentor_response',
      'daily_signal',
    ],
  },

  journal: {
    entryFeedback: false,  // journal is a quiet space
    fullFeedbackActions: [
      'reflection_saved',  // the one meaningful moment
    ],
    hapticOnlyActions: [],
    silentActions: [
      'micro_move_complete',
      'mentor_response',
      'daily_signal',
      'milestone_reached',
    ],
  },

  daily_signal: {
    entryFeedback: false,
    fullFeedbackActions: [
      'daily_signal',      // meaningful reveal
      'insight_arrival',
    ],
    hapticOnlyActions: [],
    silentActions: [
      'micro_move_complete',
      'mentor_response',
    ],
  },

  mirror: {
    entryFeedback: false,
    fullFeedbackActions: [
      'mirror_moment',
      'insight_arrival',
    ],
    hapticOnlyActions: [],
    silentActions: [
      'micro_move_complete',
    ],
  },

  cinematics: {
    entryFeedback: false,
    fullFeedbackActions: [
      'milestone_reached',
      'insight_arrival',
    ],
    hapticOnlyActions: [],
    silentActions: [],
  },

  vault: {
    entryFeedback: false,
    fullFeedbackActions: [
      'reflection_saved',
    ],
    hapticOnlyActions: [],
    silentActions: [],
  },

  share_studio: {
    entryFeedback: false,
    fullFeedbackActions: [],
    hapticOnlyActions: [
      'micro_move_complete', // share completed = light haptic
    ],
    silentActions: [],
  },

  insight_library: {
    entryFeedback: false,
    fullFeedbackActions: [
      'insight_arrival',
    ],
    hapticOnlyActions: [],
    silentActions: [],
  },

  life_events: {
    entryFeedback: false,
    fullFeedbackActions: [
      'goal_created',  // event creation
    ],
    hapticOnlyActions: [],
    silentActions: [],
  },

  settings: {
    entryFeedback: false,
    fullFeedbackActions: [],
    hapticOnlyActions: [
      'reflection_saved', // settings saved = quiet confirm
    ],
    silentActions: [],
  },

  calendar: {
    entryFeedback: false,
    fullFeedbackActions: [],
    hapticOnlyActions: [
      'micro_move_complete',
    ],
    silentActions: [],
  },

  community: {
    entryFeedback: false,
    fullFeedbackActions: [],
    hapticOnlyActions: [
      'micro_move_complete',
    ],
    silentActions: [],
  },
};

/* ── Current screen tracking ─────────────────────────────── */

let _currentScreen: ChoreographyScreen = 'home';

export function setChoreographyScreen(screen: ChoreographyScreen): void {
  _currentScreen = screen;
}

/* ── Choreographed dispatch ──────────────────────────────── */

import { triggerHaptic, type HapticEvent } from './hapticEngine';
import { getFeedbackPreferences } from './feedbackEngine';

/** Event → haptic mapping (subset needed for haptic-only mode) */
const EVENT_TO_HAPTIC: Record<FeedbackEvent, HapticEvent> = {
  app_open:            'arrival',
  micro_move_complete: 'completion',
  milestone_reached:   'reward',
  mentor_response:     'mentor_presence',
  daily_signal:        'insight',
  mirror_moment:       'insight',
  goal_created:        'confirmation',
  reflection_saved:    'confirmation',
  streak_continued:    'reward',
  warning_drift:       'warning',
  insight_arrival:     'insight',
};

/**
 * Context-aware sensory dispatch.
 * 
 * Checks the current screen's choreography rules before deciding
 * whether to fire full feedback, haptic-only, or stay silent.
 */
export function choreographedDispatch(event: FeedbackEvent): void {
  const rules = SCREEN_RULES[_currentScreen];

  // Silent — no output
  if (rules?.silentActions.includes(event)) {
    return;
  }

  // Haptic-only — no sound, no visual pulse
  if (rules?.hapticOnlyActions.includes(event)) {
    const prefs = getFeedbackPreferences();
    const hapticEvent = EVENT_TO_HAPTIC[event];
    if (hapticEvent) {
      triggerHaptic(hapticEvent, prefs.hapticsEnabled);
    }
    return;
  }

  // Full feedback (default for listed + unlisted actions)
  dispatchFeedback(event);
}
