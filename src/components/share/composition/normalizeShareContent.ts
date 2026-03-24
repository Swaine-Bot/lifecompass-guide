/**
 * Privacy-first content normalization.
 * Runs BEFORE layout/render — sanitizes and resolves all content
 * so the composition engine receives only final, allowed data.
 */

import type { ShareCardData, PrivacySettings, ThemeDefinition, SponsorData } from '@/services/shareService';
import { applyPrivacy, CARD_TYPE_LABELS } from '@/services/shareService';
import type { SharePlatform, PlatformProfile, ImageTreatment } from '../platformProfiles';
import { getPlatformProfile, getContentLengthTier } from '../platformProfiles';
import type { BentoBaseVariant } from '../bento/layoutEngine';

export interface NormalizedShareContent {
  // Identity
  title: string;
  subtitle: string | null;
  cardTypeLabel: string;
  identityLabel: string | null;
  phrase: string;

  // Stats
  statValue: string | null;
  statLabel: string | null;
  secondaryValue: string | null;
  secondaryLabel: string | null;

  // AI Insight (already clamped to platform limits)
  aiInsight: string | null;
  aiInsightLinks: { label: string; url: string }[] | null;

  // Media
  hasMedia: boolean;
  mediaUrl: string | null;
  mediaUrls: string[] | null;
  mediaCount: number;
  imageTreatment: ImageTreatment;

  // Meta
  timeAnchor: string | null;
  domain: string | null;

  // Sponsor / Partner
  sponsor: SponsorData | null;
  showSponsor: boolean;

  // Visibility decisions (resolved from privacy + platform)
  showFooter: boolean;
  showMetadata: boolean;
  showMomentum: boolean;
  showSecondaryPhrase: boolean;
  showImageCountBadge: boolean;
  showNumbers: boolean;

  // Theme
  theme: ThemeDefinition;

  // Strategy
  strategy: BentoBaseVariant;
}

export interface NormalizeInput {
  data: ShareCardData;
  privacy: PrivacySettings;
  theme: ThemeDefinition;
  platform: SharePlatform;
  phrase: string;
  aiInsight: string | null;
  aiInsightEnabled: boolean;
  includeImage: boolean;
  imageLayout: ImageTreatment | 'hero_image' | 'split_image' | 'background_image' | 'none';
  showImageCount: boolean;
  strategy: BentoBaseVariant;
}

/** Map legacy ImageLayout values to ImageTreatment */
function mapImageLayout(layout: string): ImageTreatment {
  switch (layout) {
    case 'hero_image':
    case 'hero':
      return 'hero';
    case 'split_image':
    case 'split':
      return 'split';
    case 'background_image':
    case 'background':
      return 'background';
    default:
      return 'none';
  }
}

/** Clamp text to approximate line count (chars per line ~45 for card width) */
function clampToLines(text: string, maxLines: number, isUserText = false): string {
  // User text (subtitle/reflection) gets generous treatment — show full content
  if (isUserText) {
    const charsPerLine = 42;
    const maxChars = maxLines * charsPerLine;
    if (text.length <= maxChars) return text;
    // For user text, only clamp at extreme lengths, never mid-sentence
    const cutoff = text.lastIndexOf('.', maxChars);
    if (cutoff > maxChars * 0.7) return text.slice(0, cutoff + 1);
    const spaceCutoff = text.lastIndexOf(' ', maxChars);
    if (spaceCutoff > maxChars * 0.8) return text.slice(0, spaceCutoff) + '…';
    return text.slice(0, maxChars - 1).trim() + '…';
  }
  const charsPerLine = 42;
  const maxChars = maxLines * charsPerLine;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trim() + '…';
}

/**
 * Sacrificial content budget system.
 * When space is tight, lower-priority elements are hidden.
 * Order: image count badge → secondary phrase → footer → metadata → momentum → decorative
 */
function computeVisibility(
  profile: PlatformProfile,
  privacy: PrivacySettings,
  hasInsight: boolean,
  insightLength: number,
  hasStats: boolean,
): {
  showFooter: boolean;
  showMetadata: boolean;
  showMomentum: boolean;
  showSecondaryPhrase: boolean;
  showImageCountBadge: boolean;
} {
  const isStory = profile.textDensity === 'very_low';
  const isDense = hasInsight && insightLength > 150;

  let showFooter = profile.showFooter && privacy.includeFooter;
  let showMetadata = profile.showMetadata;
  let showMomentum = hasStats;
  let showSecondaryPhrase = true;
  let showImageCountBadge = true;

  // Story formats: aggressively reduce
  if (isStory) {
    showFooter = false;
    showMetadata = false;
    showSecondaryPhrase = false;
    if (isDense) {
      showMomentum = false;
      showImageCountBadge = false;
    }
  }

  // Dense content on feed: sacrifice lower priority
  if (isDense && !isStory) {
    showImageCountBadge = insightLength < 250;
    showSecondaryPhrase = insightLength < 200;
    if (insightLength > 300) {
      showMomentum = false;
    }
    if (insightLength > 400) {
      showFooter = false;
    }
  }

  return { showFooter, showMetadata, showMomentum, showSecondaryPhrase, showImageCountBadge };
}

/**
 * Main normalization function.
 * All privacy filtering and platform-specific content clamping happens here.
 */
export function normalizeShareContent(input: NormalizeInput): NormalizedShareContent {
  const privacy = applyPrivacy(input.privacy);
  const profile = getPlatformProfile(input.platform);

  // Resolve AI insight
  let aiInsight: string | null = null;
  if (input.aiInsightEnabled && input.aiInsight?.trim()) {
    aiInsight = clampToLines(input.aiInsight.trim(), profile.maxInsightLines);
  }

  // Resolve media
  const hasMedia = input.includeImage && !!(input.data.imageUrl || input.data.imageUrls?.length);
  const mediaUrl = hasMedia ? (input.data.imageUrl || input.data.imageUrls?.[0] || null) : null;
  const mediaUrls = hasMedia ? (input.data.imageUrls || (input.data.imageUrl ? [input.data.imageUrl] : null)) : null;
  const mediaCount = mediaUrls?.length || (mediaUrl ? 1 : 0);

  // Resolve image treatment
  let imageTreatment: ImageTreatment = hasMedia ? mapImageLayout(input.imageLayout) : 'none';
  if (imageTreatment === 'none' && hasMedia) {
    imageTreatment = profile.preferredImageTreatment[0] || 'hero';
  }

  // Clamp title and subtitle
  const title = clampToLines(input.data.title, profile.maxTitleLines);
  const subtitle = input.data.subtitle
    ? clampToLines(input.data.subtitle, profile.maxBodyLines)
    : null;

  // Compute visibility
  const insightLength = aiInsight?.length || 0;
  const visibility = computeVisibility(
    profile,
    privacy,
    !!aiInsight,
    insightLength,
    !!input.data.statValue,
  );

  return {
    title,
    subtitle,
    cardTypeLabel: CARD_TYPE_LABELS[input.data.cardType] || input.data.cardType,
    identityLabel: input.data.identityLabel || null,
    phrase: input.phrase,

    statValue: input.data.statValue || null,
    statLabel: input.data.statLabel || null,
    secondaryValue: visibility.showSecondaryPhrase ? (input.data.secondaryValue || null) : null,
    secondaryLabel: visibility.showSecondaryPhrase ? (input.data.secondaryLabel || null) : null,

    aiInsight,
    aiInsightLinks: aiInsight ? (input.data.aiInsightLinks || null) : null,

    hasMedia,
    mediaUrl,
    mediaUrls,
    mediaCount,
    imageTreatment,

    timeAnchor: privacy.includeDateTime ? (input.data.timeAnchor || null) : null,
    domain: input.data.domain || null,

    sponsor: input.data.sponsor || null,
    showSponsor: !!input.data.sponsor?.name,

    showFooter: visibility.showFooter,
    showMetadata: visibility.showMetadata,
    showMomentum: visibility.showMomentum,
    showSecondaryPhrase: visibility.showSecondaryPhrase,
    showImageCountBadge: visibility.showImageCountBadge,
    showNumbers: privacy.includeExactNumbers,

    theme: input.theme,
    strategy: input.strategy,
  };
}
