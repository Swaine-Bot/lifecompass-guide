/**
 * LifeStack Environment Engine
 * Maps user context (life phase, screen, time, mood) to visual themes.
 */

export type LifePhase = 'student_early_career' | 'builder' | 'family_home' | 'explorer' | 'legacy_impact';
export type ScreenContext = 'home' | 'mentor' | 'journal' | 'goals' | 'habits' | 'calendar' | 'community' | 'mirror' | 'cinematics' | 'vault' | 'settings' | 'default';
export type AnimationProfile = 'static' | 'slow' | 'dynamic';
export type EmotionalContext = 'positive' | 'neutral' | 'low' | 'unknown';

export interface EnvironmentTheme {
  id: string;
  label: string;
  /** HSL values for the gradient start (without hsl() wrapper) */
  gradientFrom: string;
  /** HSL values for the gradient end */
  gradientTo: string;
  /** Overlay opacity 0–0.2 */
  overlayOpacity: number;
  animationProfile: AnimationProfile;
  /** Optional accent hue shift for feedback pulses */
  pulseHue: string;
}

const THEMES: Record<string, EnvironmentTheme> = {
  builder: {
    id: 'builder',
    label: 'Dawn Summit',
    gradientFrom: '220 30% 12%',
    gradientTo: '200 25% 18%',
    overlayOpacity: 0.12,
    animationProfile: 'slow',
    pulseHue: '200 60% 50%',
  },
  operator: {
    id: 'operator',
    label: 'City Night',
    gradientFrom: '240 20% 8%',
    gradientTo: '260 18% 14%',
    overlayOpacity: 0.15,
    animationProfile: 'dynamic',
    pulseHue: '260 50% 55%',
  },
  recovery: {
    id: 'recovery',
    label: 'Ocean Rest',
    gradientFrom: '195 30% 10%',
    gradientTo: '180 25% 16%',
    overlayOpacity: 0.1,
    animationProfile: 'slow',
    pulseHue: '180 50% 45%',
  },
  expansion: {
    id: 'expansion',
    label: 'Golden Light',
    gradientFrom: '35 25% 10%',
    gradientTo: '43 30% 15%',
    overlayOpacity: 0.12,
    animationProfile: 'slow',
    pulseHue: '43 70% 55%',
  },
  neutral: {
    id: 'neutral',
    label: 'Obsidian',
    gradientFrom: '220 20% 6%',
    gradientTo: '220 18% 12%',
    overlayOpacity: 0.08,
    animationProfile: 'static',
    pulseHue: '43 74% 52%',
  },
};

/** Screen-specific overlay tints (HSL, low opacity applied separately) */
const SCREEN_OVERLAYS: Partial<Record<ScreenContext, string>> = {
  mentor: '260 30% 20%',
  journal: '180 25% 18%',
  goals: '43 40% 18%',
  home: '220 20% 10%',
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function mapLifePhaseToThemeId(phase?: LifePhase | null): string {
  switch (phase) {
    case 'builder':
      return 'builder';
    case 'student_early_career':
      return 'expansion';
    case 'family_home':
      return 'recovery';
    case 'explorer':
      return 'operator';
    case 'legacy_impact':
      return 'expansion';
    default:
      return 'neutral';
  }
}

export interface EnvironmentState {
  theme: EnvironmentTheme;
  screenOverlay: string | null;
  timeOfDay: ReturnType<typeof getTimeOfDay>;
}

export function resolveEnvironment(
  lifePhase?: LifePhase | null,
  screen: ScreenContext = 'default',
  _emotionalContext: EmotionalContext = 'unknown',
): EnvironmentState {
  const themeId = mapLifePhaseToThemeId(lifePhase);
  const theme = THEMES[themeId] || THEMES.neutral;
  const screenOverlay = SCREEN_OVERLAYS[screen] ?? null;
  const timeOfDay = getTimeOfDay();

  return { theme, screenOverlay, timeOfDay };
}
