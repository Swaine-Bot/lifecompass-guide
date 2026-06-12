/**
 * Deterministic Composition Spec Engine.
 *
 * Computes a complete, pixel-level layout specification BEFORE rendering.
 * No DOM measurement, no reactive sizing — pure data in, layout out.
 */

import type { SharePlatform, PlatformProfile, ImageTreatment, ContentLengthTier } from '../platformProfiles';
import { getPlatformProfile, getContentLengthTier } from '../platformProfiles';
import type { NormalizedShareContent } from './normalizeShareContent';
import type { BentoBaseVariant } from '../bento/layoutEngine';

// ─── Types ────────────────────────────────────────────────────────────

export interface PanelSpec {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  zIndex: number;
}

export interface TypographySpec {
  titleFontSize: number;
  titleLineHeight: number;
  titleMaxLines: number;
  subtitleFontSize: number;
  subtitleLineHeight: number;
  subtitleMaxLines: number;
  insightFontSize: number;
  insightLineHeight: number;
  insightMaxLines: number;
  metaFontSize: number;
  statFontSize: number;
  phraseFontSize: number;
  brandFontSize: number;
}

export interface CompositionSpec {
  // Canvas
  width: number;
  height: number;
  platform: SharePlatform;

  // Panels
  panels: {
    media: PanelSpec;
    insight: PanelSpec;
    text: PanelSpec;
    momentum: PanelSpec;
    meta: PanelSpec;
    sponsor: PanelSpec;
    brand: PanelSpec;
  };

  // Typography
  typography: TypographySpec;

  // Rendering hints
  imageTreatment: ImageTreatment;
  strategy: BentoBaseVariant;
  backgroundOverlayOpacity: number;
  panelGap: number;
  panelRadius: number;
  contentPadding: { top: number; right: number; bottom: number; left: number };
}

// ─── Typography Presets ───────────────────────────────────────────────

interface TypoPreset {
  titleFontSize: number;
  subtitleFontSize: number;
  insightFontSize: number;
  statFontSize: number;
}

const TYPO_PRESETS: Record<string, TypoPreset> = {
  // Feed formats (1080x1350)
  'feed_short_no_insight': { titleFontSize: 48, subtitleFontSize: 28, insightFontSize: 0, statFontSize: 56 },
  'feed_short_with_insight': { titleFontSize: 40, subtitleFontSize: 24, insightFontSize: 28, statFontSize: 48 },
  'feed_medium_no_insight': { titleFontSize: 42, subtitleFontSize: 26, insightFontSize: 0, statFontSize: 52 },
  'feed_medium_with_insight': { titleFontSize: 36, subtitleFontSize: 22, insightFontSize: 24, statFontSize: 44 },
  'feed_long_no_insight': { titleFontSize: 38, subtitleFontSize: 24, insightFontSize: 0, statFontSize: 48 },
  'feed_long_with_insight': { titleFontSize: 32, subtitleFontSize: 20, insightFontSize: 22, statFontSize: 40 },
  // Story formats (1080x1920)
  'story_short_no_insight': { titleFontSize: 54, subtitleFontSize: 30, insightFontSize: 0, statFontSize: 64 },
  'story_short_with_insight': { titleFontSize: 46, subtitleFontSize: 26, insightFontSize: 30, statFontSize: 54 },
  'story_medium_no_insight': { titleFontSize: 48, subtitleFontSize: 28, insightFontSize: 0, statFontSize: 58 },
  'story_medium_with_insight': { titleFontSize: 40, subtitleFontSize: 24, insightFontSize: 26, statFontSize: 48 },
  'story_long_no_insight': { titleFontSize: 42, subtitleFontSize: 26, insightFontSize: 0, statFontSize: 52 },
  'story_long_with_insight': { titleFontSize: 36, subtitleFontSize: 22, insightFontSize: 24, statFontSize: 44 },
};

function getTypoPreset(isStory: boolean, titleTier: ContentLengthTier, hasInsight: boolean): TypoPreset {
  const format = isStory ? 'story' : 'feed';
  const insight = hasInsight ? 'with_insight' : 'no_insight';
  const key = `${format}_${titleTier}_${insight}`;
  return TYPO_PRESETS[key] || TYPO_PRESETS[`${format}_medium_${insight}`];
}

// ─── Layout Computation ──────────────────────────────────────────────

function isStoryFormat(platform: SharePlatform): boolean {
  return platform === 'instagram_story' || platform === 'tiktok_story';
}

export function computeCompositionSpec(
  content: NormalizedShareContent,
  platform: SharePlatform,
): CompositionSpec {
  const profile = getPlatformProfile(platform);
  const { width: W, height: H } = profile;
  const sz = profile.safeZone;

  const isStory = isStoryFormat(platform);
  const gap = isStory ? 10 : 8;
  const panelRadius = 44;

  // Content area within safe zones
  const cx = sz.left;
  const cy = sz.top;
  const cw = W - sz.left - sz.right;
  const ch = H - sz.top - sz.bottom;

  // Typography
  const titleTier = getContentLengthTier(content.title);
  const hasInsight = !!content.aiInsight;
  const typo = getTypoPreset(isStory, titleTier, hasInsight);

  const typography: TypographySpec = {
    titleFontSize: typo.titleFontSize,
    titleLineHeight: 1.2,
    titleMaxLines: profile.maxTitleLines,
    subtitleFontSize: typo.subtitleFontSize,
    subtitleLineHeight: 1.35,
    subtitleMaxLines: profile.maxBodyLines,
    insightFontSize: typo.insightFontSize,
    insightLineHeight: 1.4,
    insightMaxLines: profile.maxInsightLines,
    metaFontSize: isStory ? 20 : 18,
    statFontSize: typo.statFontSize,
    phraseFontSize: isStory ? 18 : 16,
    brandFontSize: isStory ? 18 : 16,
  };

  // ── Panel sizing ──
  // Available height for content panels
  const brandH = content.showFooter ? 60 : 0;
  const hasSponsorAsset = content.showSponsor && !!content.sponsor?.logoUrl;
  const sponsorH = content.showSponsor
    ? (hasSponsorAsset ? (isStory ? 280 : 240) : (isStory ? 70 : 62))
    : 0;
  const availH = ch - brandH - sponsorH
    - (content.showFooter ? gap : 0)
    - (content.showSponsor ? gap : 0);

  // Strategy-based panel proportions
  let mediaRatio = 0;
  let insightRatio = 0;
  let textRatio = 0;
  let bottomRowH = 0;

  const hasMedia = content.hasMedia && content.imageTreatment !== 'background';
  const showMomentum = content.showMomentum && !!content.statValue;
  const showMeta = content.showMetadata;
  const showBottomRow = showMomentum || showMeta;

  if (showBottomRow) {
    // Content-aware bottom row height based on stat font size
    // Stat needs: pad(20) + statSize*0.8 + gap(6) + labelSize(14) + gap(12) + phraseSize + pad(20)
    const statFS = typo.statFontSize;
    const phraseFS = isStory ? 18 : 16;
    const minMomentumH = 20 + statFS * 0.8 + 6 + 14 + 12 + phraseFS + 20;
    bottomRowH = Math.max(isStory ? 140 : 130, Math.ceil(minMomentumH));
  }

  const panelAreaH = availH - bottomRowH - (showBottomRow ? gap : 0);

  // Count visible content panels
  const contentPanels = [hasMedia, hasInsight, true /* text always shown */].filter(Boolean).length;

  // Estimate user text length to allocate more space
  const userTextLength = (content.subtitle?.length || 0) + (content.title?.length || 0);
  const hasLongUserText = userTextLength > 200;
  const hasVeryLongUserText = userTextLength > 400;

  if (hasMedia) {
    if (content.strategy === 'hero' || content.strategy === 'minimal') {
      // Hero: media should dominate the card (55-65%)
      if (hasVeryLongUserText) {
        mediaRatio = contentPanels >= 3 ? 0.35 : contentPanels >= 2 ? 0.40 : 0.50;
      } else if (hasLongUserText) {
        mediaRatio = contentPanels >= 3 ? 0.40 : contentPanels >= 2 ? 0.50 : 0.55;
      } else {
        mediaRatio = contentPanels >= 3 ? 0.45 : contentPanels >= 2 ? 0.55 : 0.65;
      }
    } else if (content.strategy === 'split') {
      mediaRatio = 0; // split uses side-by-side, handled differently
    } else {
      mediaRatio = hasLongUserText ? 0.18 : 0.25; // reflection: small media
    }
  }

  if (hasInsight) {
    // Reduce insight ratio when user text is long or sponsor asset takes space
    if (hasSponsorAsset) {
      insightRatio = contentPanels >= 3 ? 0.18 : 0.24;
    } else if (hasVeryLongUserText) {
      insightRatio = contentPanels >= 3 ? 0.22 : 0.30;
    } else {
      insightRatio = contentPanels >= 3 ? 0.30 : 0.40;
    }
  }

  textRatio = 1 - mediaRatio - insightRatio;
  textRatio = Math.max(textRatio, 0.25); // Raised minimum from 0.20 to 0.25

  // Normalize ratios
  const total = mediaRatio + insightRatio + textRatio;
  if (total > 0) {
    mediaRatio /= total;
    insightRatio /= total;
    textRatio /= total;
  }

  const gapsInColumn = contentPanels - 1;
  const netPanelH = panelAreaH - gapsInColumn * gap;

  // Compute panel heights with minimums to prevent overlap
  const mediaH = Math.round(netPanelH * mediaRatio);
  const insightMinH = hasInsight ? (isStory ? 160 : 140) : 0;
  const insightH = Math.max(Math.round(netPanelH * insightRatio), insightMinH);
  const textMinH = isStory ? 180 : 160; // Increased minimum text panel height
  const textH = Math.max(Math.round(netPanelH * textRatio), textMinH);

  // ── Split layout: side-by-side ──
  const isSplit = content.strategy === 'split' && content.hasMedia && content.imageTreatment !== 'background';
  const splitMediaW = isSplit ? Math.round(cw * 0.50) : 0;
  const splitContentW = isSplit ? cw - splitMediaW - gap : cw;

  // ── Position panels (top-down flow) ──
  let cursorY = cy;
  const panelX = isSplit ? cx + splitMediaW + gap : cx;
  const panelW = isSplit ? splitContentW : cw;

  // Media panel
  const mediaPanelSpec: PanelSpec = {
    id: 'media',
    x: isSplit ? cx : cx,
    y: isSplit ? cy : cursorY,
    width: isSplit ? splitMediaW : cw,
    height: isSplit ? availH : mediaH,
    visible: content.hasMedia && content.imageTreatment !== 'none',
    zIndex: content.imageTreatment === 'background' ? 0 : 2,
  };

  if (!isSplit && hasMedia) {
    cursorY += mediaH + gap;
  }

  // Insight panel
  const insightPanelSpec: PanelSpec = {
    id: 'insight',
    x: panelX,
    y: isSplit ? cy : cursorY,
    width: panelW,
    height: insightH,
    visible: hasInsight,
    zIndex: 3,
  };

  if (hasInsight) {
    if (isSplit) {
      // In split, stack insight then text vertically in the content column
    } else {
      cursorY += insightH + gap;
    }
  }

  // Text panel
  const textPanelY = isSplit
    ? cy + (hasInsight ? insightH + gap : 0)
    : cursorY;
  const textPanelH = isSplit
    ? (availH - (hasInsight ? insightH + gap : 0) - (showBottomRow ? bottomRowH + gap : 0))
    : textH;

  const textPanelSpec: PanelSpec = {
    id: 'text',
    x: panelX,
    y: textPanelY,
    width: panelW,
    height: Math.max(textPanelH, textMinH),
    visible: true,
    zIndex: 3,
  };

  if (!isSplit) {
    cursorY += textH + gap;
  }

  // Bottom row: momentum + meta side by side
  const bottomY = isSplit
    ? cy + (availH - bottomRowH)
    : cursorY;

  const halfW = Math.round((panelW - gap) / 2);

  const momentumPanelSpec: PanelSpec = {
    id: 'momentum',
    x: panelX,
    y: bottomY,
    width: showMeta ? halfW : panelW,
    height: bottomRowH,
    visible: showMomentum,
    zIndex: 3,
  };

  const metaPanelSpec: PanelSpec = {
    id: 'meta',
    x: showMomentum ? panelX + halfW + gap : panelX,
    y: bottomY,
    width: showMomentum ? halfW : panelW,
    height: bottomRowH,
    visible: showMeta,
    zIndex: 3,
  };

  // Sponsor panel — sits between content and brand
  const sponsorY = H - sz.bottom - brandH - (content.showFooter ? gap : 0) - sponsorH;
  const sponsorPanelSpec: PanelSpec = {
    id: 'sponsor',
    x: cx,
    y: sponsorY,
    width: cw,
    height: sponsorH,
    visible: content.showSponsor,
    zIndex: 4,
  };

  // Brand panel
  const brandPanelSpec: PanelSpec = {
    id: 'brand',
    x: cx,
    y: H - sz.bottom - brandH,
    width: cw,
    height: brandH,
    visible: content.showFooter,
    zIndex: 4,
  };

  return {
    width: W,
    height: H,
    platform,
    panels: {
      media: mediaPanelSpec,
      insight: insightPanelSpec,
      text: textPanelSpec,
      momentum: momentumPanelSpec,
      meta: metaPanelSpec,
      sponsor: sponsorPanelSpec,
      brand: brandPanelSpec,
    },
    typography,
    imageTreatment: content.imageTreatment,
    strategy: content.strategy,
    backgroundOverlayOpacity: hasInsight ? 0.35 : 0.25,
    panelGap: gap,
    panelRadius,
    contentPadding: { top: sz.top, right: sz.right, bottom: sz.bottom, left: sz.left },
  };
}
