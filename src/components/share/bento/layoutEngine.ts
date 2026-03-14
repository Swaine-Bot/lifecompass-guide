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
    return { top: 36, right: 24, bottom: 54, left: 24 };
  }

  if (format === 'feed' || format === 'linkedin') {
    return { top: 24, right: 20, bottom: 30, left: 20 };
  }

  return { top: 20, right: 18, bottom: 24, left: 18 };
}

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
  const insightDensity = hasInsight ? Math.min(1.8, insightLength / 260) : 0;
  const textDensity = Math.min(1.2, textLength / 200);

  const baseByVariant = {
    hero: { heroMedia: isStory ? 0.48 : isSquare ? 0.44 : 0.46, splitMedia: isStory ? 0.44 : 0.52 },
    split: { heroMedia: isStory ? 0.42 : isSquare ? 0.4 : 0.43, splitMedia: isStory ? 0.47 : 0.5 },
    reflection: { heroMedia: isStory ? 0.38 : isSquare ? 0.36 : 0.4, splitMedia: isStory ? 0.42 : 0.48 },
    minimal: { heroMedia: isStory ? 0.4 : isSquare ? 0.35 : 0.38, splitMedia: isStory ? 0.45 : 0.48 },
  }[baseVariant];

  const computed: DynamicBentoLayoutSpec = {
    safePadding,
    gap: isStory ? 10 : 8,
    heroMediaRatio: hasMedia ? baseByVariant.heroMedia : 0,
    splitMediaRatio: hasMedia ? baseByVariant.splitMedia : 0,
    splitDirection: isStory ? 'column' : 'row',
    secondaryDirection: isStory ? 'column' : 'row',
    insightWeight: hasInsight ? 1.05 + insightDensity : 0,
    textWeight: hasInsight ? Math.max(0.75, 1.25 - insightDensity * 0.25) : 1.35,
    metaWeight: hasInsight ? 0.58 : 0.72,
    momentumWeight: hasInsight ? 0.62 : 0.78,
    titleLines: hasInsight ? 2 : isSquare ? 3 : 4,
    subtitleLines: hasInsight ? 2 : 3,
    insightFontSize: isStory
      ? Math.max(12.5, 18 - insightDensity * 2.4)
      : isSquare
        ? Math.max(12, 16 - insightDensity * 2.2)
        : Math.max(12.5, 17 - insightDensity * 2.1),
    showMomentum: !hasInsight || insightLength < 700,
    showMeta: !hasInsight || insightLength < 820,
    compactBrand: isSquare || hasInsight,
    backgroundOverlay: hasInsight ? 0.64 : 0.54,
  };

  if (imageStyle === 'split_image') {
    computed.secondaryDirection = 'column';
    computed.insightWeight = hasInsight ? 1.2 + insightDensity : 0;
    computed.textWeight = hasInsight ? Math.max(0.75, 1.2 - insightDensity * 0.2) : 1.45;
    computed.showMomentum = !hasInsight || insightLength < (isStory ? 620 : 760);
  }

  if (imageStyle === 'background_image') {
    computed.heroMediaRatio = 0;
    computed.splitMediaRatio = hasMedia ? (isStory ? 0.22 : 0.2) : 0;
    computed.splitDirection = 'column';
    computed.secondaryDirection = 'column';
    computed.insightWeight = hasInsight ? 1.45 + insightDensity : 0;
    computed.textWeight = hasInsight ? Math.max(0.65, 0.95 - insightDensity * 0.15) : 1.3;
    computed.metaWeight = hasInsight ? 0.5 : 0.65;
    computed.momentumWeight = hasInsight ? 0.52 : 0.7;
    computed.titleLines = hasInsight ? 2 : 4;
    computed.subtitleLines = hasInsight ? 2 : 3;
    computed.showMomentum = !hasInsight || insightLength < (isStory ? 540 : 660);
    computed.showMeta = !hasInsight || insightLength < 760;
  }

  if (!hasMedia) {
    computed.heroMediaRatio = 0;
    computed.splitMediaRatio = 0;
    computed.splitDirection = 'column';
  }

  if (!hasInsight) {
    computed.insightFontSize = isStory ? 16 : 15;
    computed.showMeta = true;
    computed.showMomentum = true;
    computed.textWeight += textDensity * 0.2;
  }

  return computed;
}
