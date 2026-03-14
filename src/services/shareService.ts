import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────
export type CardType = 'streak' | 'milestone' | 'mentor_insight' | 'progress' | 'weekly_recap' | 'level_up';
export type ShareFormat = 'story' | 'feed' | 'square' | 'linkedin' | 'tiktok';
export type ShareTheme = 'obsidian_gold' | 'midnight_sage' | 'graphite_platinum' | 'ember_focus' | 'clean_silver';
export type VisualModule = 'flame' | 'ring' | 'radar' | 'badge' | 'chart' | 'quote' | 'none';
export type ImageLayout = 'hero_image' | 'split_image' | 'background_image' | 'none';
export type NativeSharePreset = 'post' | 'story' | 'reel';

export interface ShareCardData {
  cardType: CardType;
  title: string;
  subtitle?: string;
  statValue?: string;
  statLabel?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  timeAnchor?: string;
  philosophy?: string;
  sourceType?: string;
  sourceId?: string;
  visualType?: VisualModule;
  domain?: string;
  identityLabel?: string;
  // Image support for feed posts
  imageUrl?: string;
  imageUrls?: string[];
  imageLayout?: ImageLayout;
  // AI insight links
  aiInsightLinks?: { label: string; url: string }[];
}

export interface PrivacySettings {
  includeName: boolean;
  includeUsername: boolean;
  includePhoto: boolean;
  includeExactNumbers: boolean;
  includeMentorQuote: boolean;
  includeDateTime: boolean;
  includeFooter: boolean;
  privateAestheticMode: boolean;
}

export interface ShareSafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
  footerMinHeight: number;
}

export interface ShareRenderPreset {
  destination: NativeSharePreset;
  safeArea: ShareSafeArea;
  heroImageRatio: number;
  splitContentPadding: number;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  includeName: false,
  includeUsername: false,
  includePhoto: false,
  includeExactNumbers: true,
  includeMentorQuote: true,
  includeDateTime: true,
  includeFooter: true,
  privateAestheticMode: false,
};

// ─── Format Dimensions ───────────────────────────────────────────────
export const FORMAT_DIMENSIONS: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Story 9:16' },
  feed: { w: 1080, h: 1350, label: 'Feed 4:5' },
  square: { w: 1080, h: 1080, label: 'Square 1:1' },
  linkedin: { w: 1080, h: 1350, label: 'LinkedIn 4:5' },
  tiktok: { w: 1080, h: 1920, label: 'TikTok 9:16' },
};

export const FORMAT_RENDER_PRESETS: Record<ShareFormat, ShareRenderPreset> = {
  story: {
    destination: 'story',
    safeArea: { top: 24, right: 20, bottom: 34, left: 20, footerMinHeight: 44 },
    heroImageRatio: 0.5,
    splitContentPadding: 14,
  },
  feed: {
    destination: 'post',
    safeArea: { top: 18, right: 20, bottom: 22, left: 20, footerMinHeight: 38 },
    heroImageRatio: 0.46,
    splitContentPadding: 16,
  },
  square: {
    destination: 'post',
    safeArea: { top: 16, right: 18, bottom: 20, left: 18, footerMinHeight: 36 },
    heroImageRatio: 0.44,
    splitContentPadding: 14,
  },
  linkedin: {
    destination: 'post',
    safeArea: { top: 18, right: 20, bottom: 22, left: 20, footerMinHeight: 38 },
    heroImageRatio: 0.46,
    splitContentPadding: 16,
  },
  tiktok: {
    destination: 'reel',
    safeArea: { top: 26, right: 20, bottom: 40, left: 20, footerMinHeight: 46 },
    heroImageRatio: 0.52,
    splitContentPadding: 14,
  },
};

export function getRenderPreset(format: ShareFormat): ShareRenderPreset {
  return FORMAT_RENDER_PRESETS[format];
}

export function getNativeSharePreset(format: ShareFormat): NativeSharePreset {
  return FORMAT_RENDER_PRESETS[format].destination;
}

// ─── Design Tokens ──────────────────────────────────────────────────
export const SHARE_TOKENS = {
  spacing: {
    cardPadding: '24px',
    cardPaddingSm: '20px',
    sectionGap: '16px',
    elementGap: '8px',
    topBandHeight: '32px',
  },
  radius: {
    card: '16px',
    pill: '100px',
    module: '12px',
    metric: '12px',
  },
  typography: {
    heroSize: 'clamp(2rem, 5vw, 3.5rem)',
    heroWeight: '700',
    heroLetterSpacing: '-0.02em',
    metricSize: '0.75rem',
    metricWeight: '600',
    metricLetterSpacing: '0.06em',
    narrativeSize: '0.75rem',
    narrativeWeight: '400',
    narrativeLetterSpacing: '0.04em',
    footerSize: '0.5625rem',
    footerWeight: '500',
    footerLetterSpacing: '0.1em',
    pillSize: '0.5625rem',
    pillWeight: '600',
    pillLetterSpacing: '0.15em',
  },
  elevation: {
    cardShadow: '0 0 80px -20px',
    moduleShadow: '0 4px 24px -8px',
    pillShadow: '0 1px 4px 0',
  },
} as const;

// ─── Theme Definitions ──────────────────────────────────────────────
export interface ThemeDefinition {
  id: ShareTheme;
  label: string;
  bgGradient: string;
  accent: string;
  accentHex: string;
  headlineHex: string;
  metricHex: string;
  footerHex: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  pillBg: string;
  pillBorder: string;
  metricBg: string;
  metricBorder: string;
  borderLine: string;
  dotPattern: string;
  trackHex: string;
}

export const THEMES: Record<ShareTheme, ThemeDefinition> = {
  obsidian_gold: {
    id: 'obsidian_gold',
    label: 'Obsidian Gold',
    bgGradient: 'linear-gradient(145deg, hsl(220,20%,5%) 0%, hsl(220,18%,8%) 40%, hsl(225,20%,11%) 100%)',
    accent: 'text-[hsl(43,74%,52%)]',
    accentHex: 'hsl(43,74%,52%)',
    headlineHex: 'hsl(40,15%,92%)',
    metricHex: 'hsl(43,74%,52%)',
    footerHex: 'hsl(220,10%,40%)',
    textPrimary: 'text-[hsl(40,15%,92%)]',
    textSecondary: 'text-[hsl(220,10%,50%)]',
    textMuted: 'text-[hsl(220,10%,40%)]',
    pillBg: 'bg-[hsl(220,15%,14%)]',
    pillBorder: 'border-[hsl(220,15%,22%)]',
    metricBg: 'bg-[hsl(220,15%,10%)]',
    metricBorder: 'border-[hsl(220,15%,18%)]',
    borderLine: 'border-[hsl(220,15%,15%)]',
    dotPattern: 'hsl(43,74%,52%)',
    trackHex: 'hsl(220,15%,15%)',
  },
  midnight_sage: {
    id: 'midnight_sage',
    label: 'Midnight Sage',
    bgGradient: 'linear-gradient(145deg, hsl(160,15%,5%) 0%, hsl(165,12%,8%) 40%, hsl(170,15%,12%) 100%)',
    accent: 'text-[hsl(155,35%,55%)]',
    accentHex: 'hsl(155,35%,55%)',
    headlineHex: 'hsl(160,10%,90%)',
    metricHex: 'hsl(155,35%,55%)',
    footerHex: 'hsl(160,8%,38%)',
    textPrimary: 'text-[hsl(160,10%,90%)]',
    textSecondary: 'text-[hsl(160,8%,48%)]',
    textMuted: 'text-[hsl(160,8%,38%)]',
    pillBg: 'bg-[hsl(160,12%,14%)]',
    pillBorder: 'border-[hsl(160,12%,22%)]',
    metricBg: 'bg-[hsl(160,12%,10%)]',
    metricBorder: 'border-[hsl(160,12%,18%)]',
    borderLine: 'border-[hsl(160,12%,16%)]',
    dotPattern: 'hsl(155,35%,55%)',
    trackHex: 'hsl(160,12%,16%)',
  },
  graphite_platinum: {
    id: 'graphite_platinum',
    label: 'Graphite Platinum',
    bgGradient: 'linear-gradient(145deg, hsl(220,8%,7%) 0%, hsl(220,6%,11%) 40%, hsl(220,8%,15%) 100%)',
    accent: 'text-[hsl(220,8%,78%)]',
    accentHex: 'hsl(220,8%,78%)',
    headlineHex: 'hsl(220,5%,92%)',
    metricHex: 'hsl(220,8%,78%)',
    footerHex: 'hsl(220,5%,38%)',
    textPrimary: 'text-[hsl(220,5%,92%)]',
    textSecondary: 'text-[hsl(220,6%,50%)]',
    textMuted: 'text-[hsl(220,5%,38%)]',
    pillBg: 'bg-[hsl(220,8%,15%)]',
    pillBorder: 'border-[hsl(220,8%,23%)]',
    metricBg: 'bg-[hsl(220,8%,11%)]',
    metricBorder: 'border-[hsl(220,8%,19%)]',
    borderLine: 'border-[hsl(220,8%,17%)]',
    dotPattern: 'hsl(220,8%,78%)',
    trackHex: 'hsl(220,8%,17%)',
  },
  ember_focus: {
    id: 'ember_focus',
    label: 'Ember Focus',
    bgGradient: 'linear-gradient(145deg, hsl(0,12%,6%) 0%, hsl(8,10%,9%) 40%, hsl(12,12%,13%) 100%)',
    accent: 'text-[hsl(18,85%,55%)]',
    accentHex: 'hsl(18,85%,55%)',
    headlineHex: 'hsl(25,12%,90%)',
    metricHex: 'hsl(18,85%,55%)',
    footerHex: 'hsl(15,8%,36%)',
    textPrimary: 'text-[hsl(25,12%,90%)]',
    textSecondary: 'text-[hsl(15,8%,48%)]',
    textMuted: 'text-[hsl(15,8%,36%)]',
    pillBg: 'bg-[hsl(10,10%,14%)]',
    pillBorder: 'border-[hsl(10,10%,22%)]',
    metricBg: 'bg-[hsl(10,10%,10%)]',
    metricBorder: 'border-[hsl(10,10%,18%)]',
    borderLine: 'border-[hsl(10,10%,16%)]',
    dotPattern: 'hsl(18,85%,55%)',
    trackHex: 'hsl(10,10%,16%)',
  },
  clean_silver: {
    id: 'clean_silver',
    label: 'Clean Silver',
    bgGradient: 'linear-gradient(145deg, hsl(0,0%,7%) 0%, hsl(0,0%,10%) 40%, hsl(0,0%,14%) 100%)',
    accent: 'text-[hsl(0,0%,80%)]',
    accentHex: 'hsl(0,0%,80%)',
    headlineHex: 'hsl(0,0%,93%)',
    metricHex: 'hsl(0,0%,80%)',
    footerHex: 'hsl(0,0%,38%)',
    textPrimary: 'text-[hsl(0,0%,93%)]',
    textSecondary: 'text-[hsl(0,0%,50%)]',
    textMuted: 'text-[hsl(0,0%,38%)]',
    pillBg: 'bg-[hsl(0,0%,14%)]',
    pillBorder: 'border-[hsl(0,0%,22%)]',
    metricBg: 'bg-[hsl(0,0%,10%)]',
    metricBorder: 'border-[hsl(0,0%,18%)]',
    borderLine: 'border-[hsl(0,0%,16%)]',
    dotPattern: 'hsl(0,0%,80%)',
    trackHex: 'hsl(0,0%,16%)',
  },
};

// ─── Labels ─────────────────────────────────────────────────────────
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  streak: 'Consistency',
  milestone: 'Milestone',
  mentor_insight: 'Mentor Insight',
  progress: 'Progress',
  weekly_recap: 'Weekly Reflection',
  level_up: 'Level Up',
};

export const CARD_TYPE_ICONS: Record<CardType, string> = {
  streak: '🔥',
  milestone: '🏆',
  mentor_insight: '🧠',
  progress: '📈',
  weekly_recap: '📅',
  level_up: '⚡',
};

// ─── Signature Phrases ──────────────────────────────────────────────
export const SIGNATURE_PHRASES = [
  'Built, not wished for',
  'Discipline logged',
  'Momentum earned',
  'Chapter complete',
  'Becoming visible',
  'Growth has evidence',
  'Progress recorded',
  'Standards elevated',
  'Evidence over intention',
  'Consistency compounds',
  'The work speaks',
  'Quiet proof',
  'Earned, not given',
  'Another brick laid',
];

export function getRandomPhrase(): string {
  return SIGNATURE_PHRASES[Math.floor(Math.random() * SIGNATURE_PHRASES.length)];
}

// ─── Privacy Helpers ────────────────────────────────────────────────
export function applyPrivacy(privacy: PrivacySettings): PrivacySettings {
  if (privacy.privateAestheticMode) {
    return {
      ...privacy,
      includeName: false,
      includeUsername: false,
      includePhoto: false,
      includeExactNumbers: false,
    };
  }
  return privacy;
}

export function getPrivacyLevel(privacy: PrivacySettings): string {
  const p = applyPrivacy(privacy);
  if (p.privateAestheticMode || (!p.includeName && !p.includeExactNumbers)) return 'anonymous';
  if (!p.includeName) return 'hide_identity';
  return 'public';
}

// ─── Share Actions ──────────────────────────────────────────────────
export async function trackShareEvent(
  userId: string,
  cardType: string,
  shareTarget: string,
  format: string,
  privacyLevel: string
) {
  await supabase.from('share_events' as any).insert({
    user_id: userId,
    card_type: cardType,
    share_target: shareTarget,
    format,
    privacy_level: privacyLevel,
  });
}

export async function saveShareCard(
  userId: string,
  data: ShareCardData,
  theme: ShareTheme,
  privacyLevel: string,
  phrase: string
) {
  const { error } = await supabase.from('share_cards').insert({
    user_id: userId,
    card_type: data.cardType,
    title: data.title,
    subtitle: data.subtitle,
    stat_value: data.statValue,
    stat_label: data.statLabel,
    signature_phrase: phrase,
    theme,
    privacy_level: privacyLevel,
    source_type: data.sourceType,
    source_id: data.sourceId,
  });
  return { error };
}

/**
 * Platform-aware native share — always tries to share the rendered card image first.
 * Falls back to text+url if image sharing is not supported.
 */
export async function nativeShare(text: string, title: string, imageBlob?: Blob, url?: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    // Always try to share with the image file first
    if (imageBlob) {
      const file = new File([imageBlob], 'lifestack-share.png', { type: 'image/png' });
      const shareDataWithFile: ShareData = { files: [file] };

      // Check if the platform can share files
      if (navigator.canShare?.(shareDataWithFile)) {
        // Include text as caption for platforms that support it (WhatsApp, etc.)
        shareDataWithFile.title = title;
        shareDataWithFile.text = text;
        if (url) shareDataWithFile.url = url;
        await navigator.share(shareDataWithFile);
        return true;
      }
    }

    // Fallback: share as text + url (no image)
    const shareData: ShareData = { title, text };
    if (url) shareData.url = url;
    await navigator.share(shareData);
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy rendered card image to clipboard as PNG (for paste into social media)
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function downloadImage(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ─── Canvas Renderer ────────────────────────────────────────────────
export async function renderCardToCanvas(
  element: HTMLElement,
  format: ShareFormat
): Promise<HTMLCanvasElement> {
  const { w, h } = FORMAT_DIMENSIONS[format];
  const scale = w / element.offsetWidth;
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    width: element.offsetWidth,
    height: element.offsetHeight,
    scale,
    backgroundColor: null,
    useCORS: true,
    allowTaint: false,
    logging: false,
    // Clip to exact element bounds to prevent overflow content from rendering
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
  });
  return canvas;
}

/**
 * Build platform-optimized caption text including AI insight links
 */
export function buildShareCaption(
  data: ShareCardData,
  phrase: string,
  aiInsight?: string | null,
  aiInsightEnabled?: boolean,
  smartUrl?: string | null,
): string {
  const parts: string[] = [];

  // Title + subtitle
  parts.push(data.title);
  if (data.subtitle) parts.push(data.subtitle);

  // AI insight
  if (aiInsight && aiInsightEnabled) {
    parts.push(`\n💡 ${aiInsight}`);
  }

  // AI insight links as visible URLs in caption
  if (data.aiInsightLinks?.length) {
    const linkLines = data.aiInsightLinks.map(l => `🔗 ${l.label}: ${l.url}`);
    parts.push(linkLines.join('\n'));
  }

  // Signature phrase
  parts.push(`\n${phrase}`);

  // Smart link
  if (smartUrl) {
    parts.push(smartUrl);
  } else {
    parts.push('lifestack.app');
  }

  return parts.join('\n');
}

// ─── Demo Data (re-exported from language-engine powered module) ────
export { generateDemoCards } from './shareDemoData';

// ─── Platform Adapters ──────────────────────────────────────────────
export const platformAdapters = {
  instagram_stories: { available: false, label: 'Instagram Stories' },
  facebook_stories: { available: false, label: 'Facebook Stories' },
  instagram_feed: { available: false, label: 'Instagram Feed' },
  linkedin: { available: false, label: 'LinkedIn' },
  tiktok: { available: false, label: 'TikTok' },
  strava: { available: false, label: 'Strava' },
};
