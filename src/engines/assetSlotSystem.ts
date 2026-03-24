/**
 * LifeStack Asset Slot System
 * 
 * Defines the structure for real visual assets (images, video loops)
 * per sensory mood. Supports lazy loading with gradient fallback.
 */

import type { SensoryMood } from './sensoryContentMap';

export interface AssetSlot {
  /** Primary background image (WebP, optimized) */
  backgroundUrl?: string;
  /** Secondary parallax layer image */
  parallaxUrl?: string;
  /** Optional short video loop (muted, max 3MB) */
  videoUrl?: string;
  /** CSS gradient fallback — always available */
  gradientFallback: string;
}

/**
 * Asset registry — maps each mood to asset slots.
 * Currently uses gradient-only fallbacks. Real asset URLs can be
 * populated as they're added to /assets/environments/.
 * 
 * When a backgroundUrl is set, the EnvironmentLayer will lazy-load
 * it behind the gradient and crossfade on load.
 */
const ASSET_SLOTS: Record<SensoryMood, AssetSlot> = {
  discipline: {
    gradientFallback: 'linear-gradient(160deg, hsl(215 30% 10%), hsl(210 25% 16%))',
  },
  recovery: {
    gradientFallback: 'linear-gradient(160deg, hsl(195 28% 9%), hsl(180 22% 14%))',
  },
  momentum: {
    gradientFallback: 'linear-gradient(160deg, hsl(30 22% 9%), hsl(38 28% 14%))',
  },
  reflection: {
    gradientFallback: 'linear-gradient(160deg, hsl(250 18% 8%), hsl(260 15% 13%))',
  },
  wealth: {
    gradientFallback: 'linear-gradient(160deg, hsl(230 20% 7%), hsl(225 18% 12%))',
  },
  warmth: {
    gradientFallback: 'linear-gradient(160deg, hsl(25 20% 9%), hsl(18 18% 14%))',
  },
  clarity: {
    gradientFallback: 'linear-gradient(160deg, hsl(200 22% 8%), hsl(195 18% 14%))',
  },
  struggle: {
    gradientFallback: 'linear-gradient(160deg, hsl(220 22% 6%), hsl(225 20% 10%))',
  },
  breakthrough: {
    gradientFallback: 'linear-gradient(160deg, hsl(40 25% 10%), hsl(45 30% 16%))',
  },
};

/** Preload tracking to avoid duplicate loads */
const preloaded = new Set<string>();

function preloadImage(url: string): Promise<void> {
  if (preloaded.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { preloaded.add(url); resolve(); };
    img.onerror = () => resolve(); // silent fail → gradient fallback
    img.src = url;
  });
}

/**
 * Load assets for a mood. Returns the slot immediately (gradient always ready).
 * If background/parallax URLs exist, they're preloaded in the background.
 */
export function loadAssetSlot(mood: SensoryMood): AssetSlot {
  const slot = ASSET_SLOTS[mood];

  // Fire-and-forget preloads
  if (slot.backgroundUrl) preloadImage(slot.backgroundUrl);
  if (slot.parallaxUrl) preloadImage(slot.parallaxUrl);

  return slot;
}

/**
 * Preload the asset slot for a predicted next mood.
 * Call this when you know a transition is likely (e.g., navigating to goals).
 */
export function preloadAssetSlot(mood: SensoryMood): void {
  const slot = ASSET_SLOTS[mood];
  if (slot.backgroundUrl) preloadImage(slot.backgroundUrl);
  if (slot.parallaxUrl) preloadImage(slot.parallaxUrl);
}

export { ASSET_SLOTS };
