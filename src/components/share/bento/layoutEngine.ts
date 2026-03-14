import type { ImageLayout, ShareFormat } from '@/services/shareService';

export type BentoBaseVariant = 'hero' | 'split' | 'reflection' | 'minimal';

export interface DynamicBentoLayoutSpec {
  safePadding: { top: number; right: number; bottom: number; left: number };
  gap: number;
  heroMediaRatio: number;
  splitMediaRatio: number;
  splitDirection: 'row' | 'column';
  secondaryDirection: 'row' | 'column';
  insightWeight: number;
  textWeight: number;
  metaWeight: number;
  momentumWeight: number;
  titleLines: number;
  subtitleLines: number;
  insightFontSize: number;
  showMomentum: boolean;
  showMeta: boolean;
  compactBrand: boolean;
  backgroundOverlay: number;
}

export function resolveImageStyle(imageLayout: ImageLayout | undefined, hasMedia: boolean): ImageLayout {
  if (!hasMedia) return 'none';
  return imageLayout || 'hero_image';
}

interface ComputeLayoutInput {
  baseVariant: BentoBaseVariant;
  format: ShareFormat;
  imageStyle: ImageLayout;
  hasMedia: boolean;
  hasInsight: boolean;
  insightLength: number;
  textLength: number;
}

function getSafePadding(format: ShareFormat) {
  if (format === 'story' || format === 'tiktok') {
    return { top: 32, right: 20, bottom: 48, left: 20 };
  }
  if (format === 'feed' || format === 'linkedin') {
    return { top: 20, right: 16, bottom: 24, left: 16 };
  }
  // square
  return { top: 16, right: 14, bottom: 20, left: 14 };
}

/**
 * Deterministic layout solver.
 *
 * STEP 1: format → canvas proportions
 * STEP 2: imageStyle → region map
 * STEP 3: content lengths → dynamic panel weights
 * STEP 4: font sizes capped by content length
 */
export function computeDynamicBentoLayout({
  baseVariant,
  format,
  imageStyle,
  hasMedia,
  hasInsight,
  insightLength,
  textLength,
}: ComputeLayoutInput): DynamicBentoLayoutSpec {
  const isStory = format === 'story' || format === 'tiktok';
  const isSquare = format === 'square';

  const safePadding = getSafePadding(format);
  const gap = isStory ? 8 : 6;

  // ── Content density metrics ──
  const insightDensity = hasInsight ? Math.min(2.0, insightLength / 200) : 0;
  const textDensity = Math.min(1.5, textLength / 160);

  // ── STEP 2: Base media ratios per image style ──
  let heroMediaRatio = 0;
  let splitMediaRatio = 0;
  let splitDirection: 'row' | 'column' = isStory ? 'column' : 'row';
  let secondaryDirection: 'row' | 'column' = 'column';

  if (imageStyle === 'hero_image' && hasMedia) {
    // Hero: media dominates
    heroMediaRatio = isStory ? 0.50 : isSquare ? 0.45 : 0.48;
    // If insight is very long, shrink media to give more room
    if (hasInsight && insightLength > 300) {
      heroMediaRatio = Math.max(0.30, heroMediaRatio - 0.10);
    }
  } else if (imageStyle === 'split_image' && hasMedia) {
    // Split: side-by-side (row) or stacked (column for story)
    splitMediaRatio = isStory ? 0.38 : isSquare ? 0.42 : 0.45;
    if (hasInsight && insightLength > 300) {
      splitMediaRatio = Math.max(0.28, splitMediaRatio - 0.08);
    }
  } else if (imageStyle === 'background_image') {
    // Background: no dedicated media panel (media is atmospheric)
    heroMediaRatio = 0;
    splitMediaRatio = 0;
    splitDirection = 'column';
  }

  if (!hasMedia) {
    heroMediaRatio = 0;
    splitMediaRatio = 0;
    splitDirection = 'column';
  }

  // ── STEP 3: Dynamic panel weights ──
  // These are flex-grow values for the stacked text column.
  // They control relative height distribution.

  let insightWeight = 0;
  let textWeight = 1.2;
  let metaWeight = 0.5;
  let momentumWeight = 0.55;

  if (hasInsight) {
    // RULE 3: Insight gets priority. Scale weight by density.
    if (insightLength < 100) {
      insightWeight = 1.0;
      textWeight = 1.0;
    } else if (insightLength < 250) {
      insightWeight = 1.4;
      textWeight = 0.9;
    } else if (insightLength < 400) {
      insightWeight = 1.8;
      textWeight = 0.7;
      metaWeight = 0.4;
      momentumWeight = 0.4;
    } else {
      // Very long insight — it dominates
      insightWeight = 2.2;
      textWeight = 0.55;
      metaWeight = 0.35;
      momentumWeight = 0.35;
    }
  } else {
    // No insight — text gets more room
    textWeight = 1.4 + textDensity * 0.15;
  }

  // ── STEP 4: Font sizes — content-aware ceiling ──
  let insightFontSize: number;
  if (insightLength < 60) {
    insightFontSize = isStory ? 18 : isSquare ? 16 : 17;
  } else if (insightLength < 150) {
    insightFontSize = isStory ? 15 : isSquare ? 14 : 14.5;
  } else if (insightLength < 300) {
    insightFontSize = isStory ? 13 : isSquare ? 12.5 : 13;
  } else if (insightLength < 500) {
    insightFontSize = isStory ? 11.5 : isSquare ? 11 : 11.5;
  } else {
    insightFontSize = isStory ? 10.5 : isSquare ? 10 : 10.5;
  }

  // ── Line clamp calculations ──
  let titleLines = hasInsight ? 2 : isSquare ? 3 : 4;
  let subtitleLines = hasInsight ? 2 : 3;

  // For background style with insight, allow more title lines since no media panel
  if (imageStyle === 'background_image' && !hasInsight) {
    titleLines = isSquare ? 4 : 5;
    subtitleLines = 4;
  }

  // ── Show/hide decisions ──
  let showMomentum = true;
  let showMeta = true;

  if (hasInsight) {
    // Hide lower-priority panels when insight is very long to free space
    showMomentum = insightLength < 500;
    showMeta = insightLength < 600;
  }

  // ── Background overlay ──
  const backgroundOverlay = hasInsight ? 0.58 : 0.50;

  const compactBrand = isSquare || hasInsight;

  return {
    safePadding,
    gap,
    heroMediaRatio,
    splitMediaRatio,
    splitDirection,
    secondaryDirection,
    insightWeight,
    textWeight,
    metaWeight,
    momentumWeight,
    titleLines,
    subtitleLines,
    insightFontSize,
    showMomentum,
    showMeta,
    compactBrand,
    backgroundOverlay,
  };
}
