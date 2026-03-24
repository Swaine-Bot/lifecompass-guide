/**
 * Platform-specific presets for share card rendering.
 * Each platform defines exact dimensions, safe zones, content density rules,
 * and rendering behavior — not just aspect ratios.
 */

export type SharePlatform =
  | 'instagram_feed'
  | 'instagram_story'
  | 'facebook_feed'
  | 'linkedin_feed'
  | 'tiktok_story';

export interface SafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type TextDensity = 'very_low' | 'low' | 'medium' | 'medium_high' | 'high';
export type ImageTreatment = 'hero' | 'split' | 'background' | 'none';

export interface PlatformProfile {
  id: SharePlatform;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  /** Safe zones in export pixels (at full 1080-wide resolution) */
  safeZone: SafeZone;
  /** Content density ceiling for this platform */
  textDensity: TextDensity;
  /** Max lines for AI insight on the visual card */
  maxInsightLines: number;
  /** Max lines for title */
  maxTitleLines: number;
  /** Max lines for body/subtitle */
  maxBodyLines: number;
  /** Whether to show footer/branding panel */
  showFooter: boolean;
  /** Whether metadata row is allowed */
  showMetadata: boolean;
  /** Preferred image treatment ordering */
  preferredImageTreatment: ImageTreatment[];
  /** Platform overlay risk areas description for reference */
  overlayRiskDescription: string;
  /** Native share preset type */
  nativeSharePreset: 'post' | 'story' | 'reel';
}

export const PLATFORM_PROFILES: Record<SharePlatform, PlatformProfile> = {
  instagram_feed: {
    id: 'instagram_feed',
    label: 'Instagram Feed',
    shortLabel: 'IG Feed',
    width: 1080,
    height: 1350,
    safeZone: { top: 60, right: 60, bottom: 80, left: 60 },
    textDensity: 'medium',
    maxInsightLines: 4,
    maxTitleLines: 3,
    maxBodyLines: 14,
    showFooter: true,
    showMetadata: true,
    preferredImageTreatment: ['hero', 'split', 'background'],
    overlayRiskDescription: 'Bottom: like/comment bar. Top: username/dots menu.',
    nativeSharePreset: 'post',
  },
  instagram_story: {
    id: 'instagram_story',
    label: 'Instagram Story',
    shortLabel: 'IG Story',
    width: 1080,
    height: 1920,
    safeZone: { top: 160, right: 60, bottom: 220, left: 60 },
    textDensity: 'very_low',
    maxInsightLines: 3,
    maxTitleLines: 2,
    maxBodyLines: 8,
    showFooter: false,
    showMetadata: false,
    preferredImageTreatment: ['hero', 'background', 'split'],
    overlayRiskDescription: 'Top: close/profile icons. Bottom: reply bar, send-to.',
    nativeSharePreset: 'story',
  },
  facebook_feed: {
    id: 'facebook_feed',
    label: 'Facebook Feed',
    shortLabel: 'FB Feed',
    width: 1080,
    height: 1350,
    safeZone: { top: 60, right: 60, bottom: 80, left: 60 },
    textDensity: 'medium',
    maxInsightLines: 4,
    maxTitleLines: 3,
    maxBodyLines: 14,
    showFooter: true,
    showMetadata: true,
    preferredImageTreatment: ['hero', 'split', 'background'],
    overlayRiskDescription: 'Bottom: reaction bar. Top: minimal.',
    nativeSharePreset: 'post',
  },
  linkedin_feed: {
    id: 'linkedin_feed',
    label: 'LinkedIn Feed',
    shortLabel: 'LinkedIn',
    width: 1080,
    height: 1350,
    safeZone: { top: 60, right: 60, bottom: 80, left: 60 },
    textDensity: 'medium_high',
    maxInsightLines: 5,
    maxTitleLines: 3,
    maxBodyLines: 16,
    showFooter: true,
    showMetadata: true,
    preferredImageTreatment: ['split', 'hero', 'background'],
    overlayRiskDescription: 'Minimal overlay risk. More text-friendly.',
    nativeSharePreset: 'post',
  },
  tiktok_story: {
    id: 'tiktok_story',
    label: 'TikTok Story',
    shortLabel: 'TikTok',
    width: 1080,
    height: 1920,
    safeZone: { top: 160, right: 140, bottom: 260, left: 60 },
    textDensity: 'very_low',
    maxInsightLines: 2,
    maxTitleLines: 2,
    maxBodyLines: 3,
    showFooter: false,
    showMetadata: false,
    preferredImageTreatment: ['hero', 'background'],
    overlayRiskDescription: 'Right: action rail (like/comment/share). Bottom: username/caption/sound. Top: search/live.',
    nativeSharePreset: 'reel',
  },
};

export const PLATFORM_LIST: SharePlatform[] = [
  'instagram_feed',
  'instagram_story',
  'facebook_feed',
  'linkedin_feed',
  'tiktok_story',
];

/** Get a platform profile, with fallback */
export function getPlatformProfile(platform: SharePlatform): PlatformProfile {
  return PLATFORM_PROFILES[platform];
}

/** Content length tier for typography presets */
export type ContentLengthTier = 'short' | 'medium' | 'long';

export function getContentLengthTier(text: string | undefined): ContentLengthTier {
  if (!text) return 'short';
  const len = text.length;
  if (len < 80) return 'short';
  if (len < 200) return 'medium';
  return 'long';
}
