/**
 * LifeStack Environment Engine v2
 * 
 * Enhanced: now supports subject-aware visual routing via sensory content map.
 * Resolves environment from life phase + screen + optional subject context.
 */

import {
  type SensoryMood,
  type SensoryProfile,
  type SubjectContext,
  getSubjectProfile,
  MOOD_PROFILES,
} from './sensoryContentMap';
import { loadAssetSlot, type AssetSlot } from './assetSlotSystem';

export type LifePhase = 'student_early_career' | 'builder' | 'family_home' | 'explorer' | 'legacy_impact';

export type ScreenContext =
  | 'home' | 'mentor' | 'journal' | 'goals' | 'habits'
  | 'calendar' | 'community' | 'mirror' | 'cinematics'
  | 'vault' | 'settings' | 'micro_moves' | 'daily_signal'
  | 'milestone' | 'share_studio' | 'insights' | 'life_events'
  | 'default';

export type AnimationProfile = 'static' | 'slow' | 'dynamic';
export type EmotionalContext = 'positive' | 'neutral' | 'low' | 'unknown';

export interface EnvironmentTheme {
  id: string;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  overlayOpacity: number;
  animationProfile: AnimationProfile;
  pulseHue: string;
  /** Transition duration in ms for entering this theme */
  transitionMs: number;
}

// ─── Life-phase base themes ─────────────────────────────────────────────────

const LIFE_PHASE_MOODS: Record<string, SensoryMood> = {
  builder: 'discipline',
  student_early_career: 'momentum',
  family_home: 'warmth',
  explorer: 'clarity',
  legacy_impact: 'breakthrough',
};

// ─── Screen default moods (when no subject context is provided) ─────────────

const SCREEN_DEFAULT_MOODS: Partial<Record<ScreenContext, SensoryMood>> = {
  mentor: 'reflection',
  journal: 'reflection',
  goals: 'discipline',
  habits: 'discipline',
  micro_moves: 'momentum',
  daily_signal: 'momentum',
  milestone: 'breakthrough',
  mirror: 'reflection',
  cinematics: 'breakthrough',
  vault: 'wealth',
  community: 'warmth',
  share_studio: 'momentum',
  insights: 'clarity',
  life_events: 'warmth',
  calendar: 'clarity',
  settings: 'clarity',
  home: 'clarity',
};

// ─── Screen overlay tints ───────────────────────────────────────────────────

const SCREEN_OVERLAYS: Partial<Record<ScreenContext, string>> = {
  mentor: '260 30% 20%',
  journal: '180 25% 18%',
  goals: '43 40% 18%',
  habits: '215 30% 18%',
  home: '220 20% 10%',
  micro_moves: '38 35% 16%',
  daily_signal: '35 30% 16%',
  milestone: '45 40% 20%',
  mirror: '255 20% 16%',
  cinematics: '40 30% 16%',
  vault: '230 18% 14%',
  community: '22 22% 15%',
  share_studio: '38 28% 16%',
  insights: '200 22% 16%',
  life_events: '20 25% 16%',
};

// ─── Time-of-day ────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

// ─── Resolve ────────────────────────────────────────────────────────────────

export interface EnvironmentState {
  theme: EnvironmentTheme;
  screenOverlay: string | null;
  timeOfDay: TimeOfDay;
  mood: SensoryMood;
  assets: AssetSlot;
}

/**
 * Resolve the full environment state.
 * Priority: subject context > screen default > life phase > neutral
 */
export function resolveEnvironment(
  lifePhase?: LifePhase | null,
  screen: ScreenContext = 'default',
  _emotionalContext: EmotionalContext = 'unknown',
  subjectContext?: SubjectContext,
): EnvironmentState {
  let profile: SensoryProfile;
  let mood: SensoryMood;

  // 1. Subject context takes priority (goal category, journal mood, etc.)
  if (subjectContext && Object.values(subjectContext).some(Boolean)) {
    profile = getSubjectProfile(subjectContext);
    mood = profile.mood;
  }
  // 2. Screen default mood
  else if (SCREEN_DEFAULT_MOODS[screen]) {
    mood = SCREEN_DEFAULT_MOODS[screen]!;
    profile = MOOD_PROFILES[mood];
  }
  // 3. Life phase base
  else if (lifePhase && LIFE_PHASE_MOODS[lifePhase]) {
    mood = LIFE_PHASE_MOODS[lifePhase];
    profile = MOOD_PROFILES[mood];
  }
  // 4. Neutral fallback
  else {
    mood = 'clarity';
    profile = MOOD_PROFILES.clarity;
  }

  const theme: EnvironmentTheme = {
    id: mood,
    label: mood.charAt(0).toUpperCase() + mood.slice(1),
    gradientFrom: profile.gradientFrom,
    gradientTo: profile.gradientTo,
    overlayOpacity: profile.overlayOpacity,
    animationProfile: profile.animation,
    pulseHue: profile.pulseHue,
    transitionMs: profile.transitionMs,
  };

  const screenOverlay = SCREEN_OVERLAYS[screen] ?? null;
  const timeOfDay = getTimeOfDay();
  const assets = loadAssetSlot(mood);

  return { theme, screenOverlay, timeOfDay, mood, assets };
}
