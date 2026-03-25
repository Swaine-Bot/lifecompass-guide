/**
 * LIFESTACK_ENVIRONMENT_SYSTEM
 * 
 * Shared visual engine that drives BOTH the Share Studio background
 * AND the Share Card renderer. Ensures studio + card feel like
 * one continuous world.
 * 
 * Each theme maps to an environment tone that defines:
 * - lighting direction & color temperature
 * - atmospheric overlays
 * - panel warmth tinting
 * - vignette intensity
 */

import type { ShareTheme } from '@/services/shareService';

export interface EnvironmentTone {
  /** Primary warm light — position and color */
  keyLight: { x: number; y: number; color: string; intensity: number };
  /** Secondary cool light — position and color */
  fillLight: { x: number; y: number; color: string; intensity: number };
  /** Center gravity warmth */
  ambientWarmth: { color: string; intensity: number };
  /** Panel tint — subtle color bleed from environment onto panels */
  panelTint: { r: number; g: number; b: number; alpha: number };
  /** Vignette strength 0-1 */
  vignetteStrength: number;
  /** Background hue for studio CSS overlays */
  studioOverlay: {
    primary: string;
    warmBloom: string;
    coolBloom: string;
    vignette: string;
  };
}

const ENVIRONMENT_TONES: Record<ShareTheme, EnvironmentTone> = {
  obsidian_gold: {
    keyLight: { x: 0.18, y: 0.1, color: 'rgba(200, 170, 80, 0.08)', intensity: 0.75 },
    fillLight: { x: 0.82, y: 0.88, color: 'rgba(70, 90, 170, 0.04)', intensity: 0.45 },
    ambientWarmth: { color: 'rgba(180, 155, 100, 0.02)', intensity: 0.5 },
    panelTint: { r: 200, g: 170, b: 80, alpha: 0.025 },
    vignetteStrength: 0.22,
    studioOverlay: {
      primary: `linear-gradient(170deg,
        hsl(220 22% 3% / 0.55) 0%,
        hsl(225 18% 5% / 0.35) 35%,
        hsl(220 20% 4% / 0.45) 65%,
        hsl(220 20% 2% / 0.85) 100%)`,
      warmBloom: 'radial-gradient(ellipse at 20% 12%, hsl(43 74% 52% / 0.06) 0%, transparent 55%)',
      coolBloom: 'radial-gradient(ellipse at 82% 88%, hsl(220 60% 50% / 0.035) 0%, transparent 50%)',
      vignette: 'radial-gradient(ellipse at 50% 40%, transparent 35%, hsl(220 20% 2% / 0.45) 100%)',
    },
  },
  midnight_sage: {
    keyLight: { x: 0.2, y: 0.12, color: 'rgba(80, 180, 140, 0.07)', intensity: 0.7 },
    fillLight: { x: 0.8, y: 0.85, color: 'rgba(60, 80, 120, 0.04)', intensity: 0.4 },
    ambientWarmth: { color: 'rgba(100, 170, 140, 0.018)', intensity: 0.45 },
    panelTint: { r: 80, g: 170, b: 130, alpha: 0.02 },
    vignetteStrength: 0.2,
    studioOverlay: {
      primary: `linear-gradient(170deg,
        hsl(165 18% 3% / 0.55) 0%,
        hsl(160 15% 5% / 0.35) 35%,
        hsl(165 16% 4% / 0.45) 65%,
        hsl(160 18% 2% / 0.85) 100%)`,
      warmBloom: 'radial-gradient(ellipse at 20% 12%, hsl(155 35% 55% / 0.05) 0%, transparent 55%)',
      coolBloom: 'radial-gradient(ellipse at 82% 88%, hsl(200 40% 40% / 0.03) 0%, transparent 50%)',
      vignette: 'radial-gradient(ellipse at 50% 40%, transparent 35%, hsl(165 18% 2% / 0.45) 100%)',
    },
  },
  graphite_platinum: {
    keyLight: { x: 0.22, y: 0.08, color: 'rgba(180, 185, 200, 0.06)', intensity: 0.6 },
    fillLight: { x: 0.78, y: 0.9, color: 'rgba(100, 110, 140, 0.035)', intensity: 0.35 },
    ambientWarmth: { color: 'rgba(160, 165, 180, 0.015)', intensity: 0.35 },
    panelTint: { r: 160, g: 165, b: 190, alpha: 0.018 },
    vignetteStrength: 0.18,
    studioOverlay: {
      primary: `linear-gradient(170deg,
        hsl(220 10% 4% / 0.55) 0%,
        hsl(220 8% 6% / 0.35) 35%,
        hsl(220 8% 5% / 0.45) 65%,
        hsl(220 8% 2% / 0.85) 100%)`,
      warmBloom: 'radial-gradient(ellipse at 20% 12%, hsl(220 10% 70% / 0.035) 0%, transparent 55%)',
      coolBloom: 'radial-gradient(ellipse at 82% 88%, hsl(220 15% 45% / 0.025) 0%, transparent 50%)',
      vignette: 'radial-gradient(ellipse at 50% 40%, transparent 35%, hsl(220 10% 2% / 0.45) 100%)',
    },
  },
  ember_focus: {
    keyLight: { x: 0.15, y: 0.1, color: 'rgba(220, 120, 50, 0.08)', intensity: 0.75 },
    fillLight: { x: 0.85, y: 0.85, color: 'rgba(80, 60, 100, 0.035)', intensity: 0.4 },
    ambientWarmth: { color: 'rgba(200, 120, 60, 0.02)', intensity: 0.55 },
    panelTint: { r: 200, g: 110, b: 50, alpha: 0.022 },
    vignetteStrength: 0.24,
    studioOverlay: {
      primary: `linear-gradient(170deg,
        hsl(8 15% 3% / 0.55) 0%,
        hsl(10 12% 5% / 0.35) 35%,
        hsl(8 14% 4% / 0.45) 65%,
        hsl(5 12% 2% / 0.85) 100%)`,
      warmBloom: 'radial-gradient(ellipse at 20% 12%, hsl(18 85% 55% / 0.06) 0%, transparent 55%)',
      coolBloom: 'radial-gradient(ellipse at 82% 88%, hsl(280 30% 40% / 0.025) 0%, transparent 50%)',
      vignette: 'radial-gradient(ellipse at 50% 40%, transparent 35%, hsl(5 12% 2% / 0.5) 100%)',
    },
  },
  clean_silver: {
    keyLight: { x: 0.2, y: 0.1, color: 'rgba(200, 200, 210, 0.06)', intensity: 0.55 },
    fillLight: { x: 0.8, y: 0.88, color: 'rgba(140, 140, 160, 0.03)', intensity: 0.3 },
    ambientWarmth: { color: 'rgba(180, 180, 190, 0.012)', intensity: 0.3 },
    panelTint: { r: 180, g: 180, b: 195, alpha: 0.015 },
    vignetteStrength: 0.16,
    studioOverlay: {
      primary: `linear-gradient(170deg,
        hsl(0 0% 3% / 0.55) 0%,
        hsl(0 0% 5% / 0.35) 35%,
        hsl(0 0% 4% / 0.45) 65%,
        hsl(0 0% 2% / 0.85) 100%)`,
      warmBloom: 'radial-gradient(ellipse at 20% 12%, hsl(0 0% 75% / 0.03) 0%, transparent 55%)',
      coolBloom: 'radial-gradient(ellipse at 82% 88%, hsl(220 10% 40% / 0.02) 0%, transparent 50%)',
      vignette: 'radial-gradient(ellipse at 50% 40%, transparent 35%, hsl(0 0% 2% / 0.45) 100%)',
    },
  },
};

export function getEnvironmentTone(theme: ShareTheme): EnvironmentTone {
  return ENVIRONMENT_TONES[theme] || ENVIRONMENT_TONES.obsidian_gold;
}
