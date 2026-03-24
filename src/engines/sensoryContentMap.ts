/**
 * LifeStack Sensory Content Taxonomy
 * 
 * Maps semantic categories to visual, audio, and haptic identities.
 * This is the "meaning layer" — it sits between user data (goals, moods, 
 * mentor topics) and the raw sensory engines.
 */

// ─── Visual Mood Categories ─────────────────────────────────────────────────

export type SensoryMood =
  | 'discipline'    // ascent, structure, early morning
  | 'recovery'      // softness, ocean, warmth
  | 'momentum'      // movement, kinetic, forward
  | 'reflection'    // introspection, stillness, low light
  | 'wealth'        // architecture, precision, city
  | 'warmth'        // relationships, golden, amber
  | 'clarity'       // openness, sky, light blue
  | 'struggle'      // shadow, contrast, muted
  | 'breakthrough'; // light, expansion, radiance

export interface SensoryProfile {
  mood: SensoryMood;
  /** HSL gradient start */
  gradientFrom: string;
  /** HSL gradient end */
  gradientTo: string;
  /** Overlay opacity 0–0.20 */
  overlayOpacity: number;
  /** Accent pulse HSL */
  pulseHue: string;
  /** Radial overlay tint HSL */
  overlayTint: string;
  /** Animation feel */
  animation: 'static' | 'slow' | 'dynamic';
  /** Transition class — how we enter this mood */
  transitionMs: number;
}

/** Master palette — each mood maps to a complete sensory profile */
export const MOOD_PROFILES: Record<SensoryMood, SensoryProfile> = {
  discipline: {
    mood: 'discipline',
    gradientFrom: '215 30% 10%',
    gradientTo: '210 25% 16%',
    overlayOpacity: 0.14,
    pulseHue: '210 55% 48%',
    overlayTint: '215 30% 18%',
    animation: 'slow',
    transitionMs: 800,
  },
  recovery: {
    mood: 'recovery',
    gradientFrom: '195 28% 9%',
    gradientTo: '180 22% 14%',
    overlayOpacity: 0.10,
    pulseHue: '180 45% 42%',
    overlayTint: '185 25% 16%',
    animation: 'slow',
    transitionMs: 1000,
  },
  momentum: {
    mood: 'momentum',
    gradientFrom: '30 22% 9%',
    gradientTo: '38 28% 14%',
    overlayOpacity: 0.13,
    pulseHue: '38 65% 50%',
    overlayTint: '35 30% 16%',
    animation: 'dynamic',
    transitionMs: 600,
  },
  reflection: {
    mood: 'reflection',
    gradientFrom: '250 18% 8%',
    gradientTo: '260 15% 13%',
    overlayOpacity: 0.09,
    pulseHue: '260 35% 45%',
    overlayTint: '255 20% 15%',
    animation: 'static',
    transitionMs: 1000,
  },
  wealth: {
    mood: 'wealth',
    gradientFrom: '230 20% 7%',
    gradientTo: '225 18% 12%',
    overlayOpacity: 0.14,
    pulseHue: '43 70% 52%',
    overlayTint: '230 18% 14%',
    animation: 'slow',
    transitionMs: 800,
  },
  warmth: {
    mood: 'warmth',
    gradientFrom: '25 20% 9%',
    gradientTo: '18 18% 14%',
    overlayOpacity: 0.11,
    pulseHue: '20 55% 50%',
    overlayTint: '22 22% 15%',
    animation: 'slow',
    transitionMs: 800,
  },
  clarity: {
    mood: 'clarity',
    gradientFrom: '200 22% 8%',
    gradientTo: '195 18% 14%',
    overlayOpacity: 0.12,
    pulseHue: '200 50% 52%',
    overlayTint: '198 20% 16%',
    animation: 'slow',
    transitionMs: 700,
  },
  struggle: {
    mood: 'struggle',
    gradientFrom: '220 22% 6%',
    gradientTo: '225 20% 10%',
    overlayOpacity: 0.08,
    pulseHue: '220 30% 40%',
    overlayTint: '222 20% 12%',
    animation: 'static',
    transitionMs: 1000,
  },
  breakthrough: {
    mood: 'breakthrough',
    gradientFrom: '40 25% 10%',
    gradientTo: '45 30% 16%',
    overlayOpacity: 0.16,
    pulseHue: '45 75% 58%',
    overlayTint: '42 30% 18%',
    animation: 'dynamic',
    transitionMs: 600,
  },
};

// ─── Subject → Mood Routing ─────────────────────────────────────────────────

/** Goal category keywords → mood */
const GOAL_CATEGORY_MAP: Record<string, SensoryMood> = {
  fitness: 'discipline',
  health: 'discipline',
  exercise: 'discipline',
  body: 'discipline',
  financial: 'wealth',
  money: 'wealth',
  investing: 'wealth',
  career: 'wealth',
  business: 'wealth',
  relationship: 'warmth',
  family: 'warmth',
  love: 'warmth',
  social: 'warmth',
  friendship: 'warmth',
  mental: 'clarity',
  mindfulness: 'clarity',
  meditation: 'clarity',
  focus: 'clarity',
  spiritual: 'reflection',
  purpose: 'reflection',
  meaning: 'reflection',
  identity: 'reflection',
  creative: 'breakthrough',
  art: 'breakthrough',
  writing: 'breakthrough',
  music: 'breakthrough',
  learning: 'momentum',
  education: 'momentum',
  skill: 'momentum',
  growth: 'momentum',
  recovery: 'recovery',
  rest: 'recovery',
  healing: 'recovery',
  sleep: 'recovery',
};

/** Journal mood score → sensory mood */
function moodScoreToSensoryMood(mood: number | null | undefined): SensoryMood {
  if (mood == null) return 'clarity';
  if (mood <= 2) return 'struggle';
  if (mood <= 4) return 'recovery';
  if (mood <= 6) return 'clarity';
  if (mood <= 8) return 'momentum';
  return 'breakthrough';
}

/** Daily signal type → sensory mood */
const SIGNAL_TYPE_MAP: Record<string, SensoryMood> = {
  momentum: 'momentum',
  drift: 'struggle',
  insight: 'clarity',
  celebration: 'breakthrough',
  reminder: 'discipline',
  reflection: 'reflection',
  encouragement: 'warmth',
};

// ─── Public API ─────────────────────────────────────────────────────────────

export interface SubjectContext {
  /** Goal category string if on a goal screen */
  goalCategory?: string | null;
  /** Journal mood score 1-10 */
  journalMood?: number | null;
  /** Daily signal type string */
  signalType?: string | null;
  /** Mentor conversation topic keywords */
  mentorTopic?: string | null;
  /** Milestone type */
  milestoneType?: string | null;
}

/**
 * Resolve a semantic subject context into a SensoryMood.
 * Priority: explicit goal category > journal mood > signal type > mentor topic > default
 */
export function resolveSubjectMood(ctx: SubjectContext): SensoryMood {
  // 1. Goal category
  if (ctx.goalCategory) {
    const lower = ctx.goalCategory.toLowerCase();
    for (const [keyword, mood] of Object.entries(GOAL_CATEGORY_MAP)) {
      if (lower.includes(keyword)) return mood;
    }
  }

  // 2. Journal mood
  if (ctx.journalMood != null) {
    return moodScoreToSensoryMood(ctx.journalMood);
  }

  // 3. Daily signal type
  if (ctx.signalType) {
    const mapped = SIGNAL_TYPE_MAP[ctx.signalType.toLowerCase()];
    if (mapped) return mapped;
  }

  // 4. Mentor topic keywords
  if (ctx.mentorTopic) {
    const lower = ctx.mentorTopic.toLowerCase();
    for (const [keyword, mood] of Object.entries(GOAL_CATEGORY_MAP)) {
      if (lower.includes(keyword)) return mood;
    }
  }

  return 'clarity'; // safe neutral default
}

/**
 * Get the full sensory profile for a subject context.
 */
export function getSubjectProfile(ctx: SubjectContext): SensoryProfile {
  const mood = resolveSubjectMood(ctx);
  return MOOD_PROFILES[mood];
}
