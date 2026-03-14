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
  /** Panel arrangement order */
  panelOrder: ('media' | 'insight' | 'text' | 'momentum' | 'meta')[];
  /** Whether meta and momentum should be in a row together */
  metaMomentumRow: boolean;
  /** Title font size */
  titleFontSize: number;
  /** Subtitle font size */
  subtitleFontSize: number;
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
    return { top: 28, right: 18, bottom: 40, left: 18 };
  }
  if (format === 'feed' || format === 'linkedin') {
    return { top: 18, right: 14, bottom: 22, left: 14 };
  }
  // square
  return { top: 14, right: 12, bottom: 18, left: 12 };
}

/**
 * Deterministic layout composition engine.
 * 
 * Responds to: content presence/absence, media type, AI insight length,
 * user message length, selected format, selected image style.
 * 
 * Priority hierarchy: Media > AI Insight > User Text > Meta/Momentum
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
  const isFeed = format === 'feed' || format === 'linkedin';

  const safePadding = getSafePadding(format);
  const gap = isStory ? 8 : isSquare ? 6 : 7;

  // ── Content density metrics ──
  const contentDense = (insightLength > 200 && textLength > 100);

  // ── Panel arrangement based on image style ──
  let panelOrder: DynamicBentoLayoutSpec['panelOrder'];
  
  if (imageStyle === 'hero_image' && hasMedia) {
    panelOrder = hasInsight 
      ? ['media', 'insight', 'text', 'momentum', 'meta']
      : ['media', 'text', 'momentum', 'meta'];
  } else if (imageStyle === 'split_image' && hasMedia) {
    panelOrder = hasInsight
      ? ['media', 'insight', 'text', 'meta']
      : ['media', 'text', 'momentum', 'meta'];
  } else if (imageStyle === 'background_image' && hasMedia) {
    panelOrder = hasInsight
      ? ['insight', 'text', 'media', 'momentum', 'meta']
      : ['text', 'media', 'momentum', 'meta'];
  } else {
    // No media
    panelOrder = hasInsight
      ? ['insight', 'text', 'momentum', 'meta']
      : ['text', 'momentum', 'meta'];
  }

  // ── Media ratios ──
  let heroMediaRatio = 0;
  let splitMediaRatio = 0;
  let splitDirection: 'row' | 'column' = isStory ? 'column' : 'row';
  let secondaryDirection: 'row' | 'column' = 'column';

  if (imageStyle === 'hero_image' && hasMedia) {
    heroMediaRatio = isStory ? 0.48 : isSquare ? 0.42 : 0.45;
    if (hasInsight && insightLength > 300) {
      heroMediaRatio = Math.max(0.28, heroMediaRatio - 0.12);
    } else if (hasInsight) {
      heroMediaRatio = Math.max(0.32, heroMediaRatio - 0.06);
    }
  } else if (imageStyle === 'split_image' && hasMedia) {
    splitMediaRatio = isStory ? 0.36 : isSquare ? 0.40 : 0.44;
    if (hasInsight && insightLength > 300) {
      splitMediaRatio = Math.max(0.26, splitMediaRatio - 0.10);
    }
  } else if (imageStyle === 'background_image') {
    heroMediaRatio = 0;
    splitMediaRatio = 0;
    splitDirection = 'column';
  }

  if (!hasMedia) {
    heroMediaRatio = 0;
    splitMediaRatio = 0;
    splitDirection = 'column';
  }

  // ── Panel weights ──
  let insightWeight = 0;
  let textWeight = 1.2;
  let metaWeight = 0.45;
  let momentumWeight = 0.5;

  if (hasInsight) {
    if (insightLength < 100) {
      insightWeight = 1.0;
      textWeight = 1.0;
    } else if (insightLength < 250) {
      insightWeight = 1.5;
      textWeight = 0.85;
    } else if (insightLength < 400) {
      insightWeight = 1.9;
      textWeight = 0.65;
      metaWeight = 0.35;
      momentumWeight = 0.38;
    } else {
      insightWeight = 2.3;
      textWeight = 0.5;
      metaWeight = 0.3;
      momentumWeight = 0.32;
    }
  } else {
    textWeight = 1.5;
  }

  // ── Font sizes ──
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

  // Title/subtitle sizes — respond to content density
  let titleFontSize: number;
  let subtitleFontSize: number;
  if (hasInsight && contentDense) {
    titleFontSize = isSquare ? 16 : 17;
    subtitleFontSize = 11;
  } else if (hasInsight) {
    titleFontSize = isSquare ? 18 : 20;
    subtitleFontSize = 12;
  } else {
    titleFontSize = isSquare ? 22 : isStory ? 26 : 24;
    subtitleFontSize = isSquare ? 13 : 14;
  }

  // ── Line clamps ──
  let titleLines = hasInsight ? 2 : isSquare ? 3 : 4;
  let subtitleLines = hasInsight ? 2 : 3;

  if (imageStyle === 'background_image' && !hasInsight) {
    titleLines = isSquare ? 4 : 5;
    subtitleLines = 4;
  }

  // ── Show/hide decisions ──
  let showMomentum = true;
  let showMeta = true;

  if (hasInsight && contentDense) {
    showMomentum = insightLength < 400;
    showMeta = insightLength < 500;
  }

  // Compact formats hide lower-priority panels
  if (isSquare && hasInsight && insightLength > 200) {
    showMomentum = false;
  }

  const metaMomentumRow = showMeta && showMomentum;

  const backgroundOverlay = hasInsight ? 0.56 : 0.48;
  const compactBrand = isSquare || (hasInsight && contentDense);

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
    panelOrder,
    metaMomentumRow,
    titleFontSize,
    subtitleFontSize,
  };
}
