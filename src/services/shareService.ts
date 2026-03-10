import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────
export type CardType = 'streak' | 'milestone' | 'mentor_insight' | 'progress' | 'weekly_recap' | 'level_up';
export type ShareFormat = 'story' | 'feed' | 'square' | 'linkedin';
export type ShareTheme = 'obsidian_gold' | 'graphite_glass' | 'midnight_blue' | 'clean_platinum' | 'ember_focus';
export type VisualModule = 'flame' | 'ring' | 'radar' | 'badge' | 'chart' | 'quote' | 'none';

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
  story:    { w: 1080, h: 1920, label: 'Story 9:16' },
  feed:     { w: 1080, h: 1350, label: 'Feed 4:5' },
  square:   { w: 1080, h: 1080, label: 'Square 1:1' },
  linkedin: { w: 1080, h: 1350, label: 'LinkedIn 4:5' },
};

// ─── Theme Definitions ──────────────────────────────────────────────
export interface ThemeDefinition {
  id: ShareTheme;
  label: string;
  bg: string;
  accent: string;
  accentHex: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  pillBg: string;
  pillBorder: string;
  metricBg: string;
  metricBorder: string;
  borderLine: string;
  dotPattern: string;
}

export const THEMES: Record<ShareTheme, ThemeDefinition> = {
  obsidian_gold: {
    id: 'obsidian_gold',
    label: 'Obsidian Gold',
    bg: 'bg-gradient-to-br from-[hsl(220,20%,6%)] via-[hsl(220,18%,9%)] to-[hsl(220,20%,12%)]',
    accent: 'text-[hsl(43,74%,52%)]',
    accentHex: 'hsl(43,74%,52%)',
    textPrimary: 'text-[hsl(40,15%,92%)]',
    textSecondary: 'text-[hsl(220,10%,50%)]',
    textMuted: 'text-[hsl(220,10%,40%)]',
    pillBg: 'bg-[hsl(220,15%,14%)]',
    pillBorder: 'border-[hsl(220,15%,22%)]',
    metricBg: 'bg-[hsl(220,15%,10%)]',
    metricBorder: 'border-[hsl(220,15%,18%)]',
    borderLine: 'border-[hsl(220,15%,15%)]',
    dotPattern: 'white',
  },
  graphite_glass: {
    id: 'graphite_glass',
    label: 'Graphite Glass',
    bg: 'bg-gradient-to-br from-[hsl(220,10%,8%)] via-[hsl(220,8%,12%)] to-[hsl(220,10%,16%)]',
    accent: 'text-[hsl(210,15%,75%)]',
    accentHex: 'hsl(210,15%,75%)',
    textPrimary: 'text-[hsl(210,10%,90%)]',
    textSecondary: 'text-[hsl(220,8%,50%)]',
    textMuted: 'text-[hsl(220,8%,38%)]',
    pillBg: 'bg-[hsl(220,10%,16%)]',
    pillBorder: 'border-[hsl(220,10%,24%)]',
    metricBg: 'bg-[hsl(220,10%,12%)]',
    metricBorder: 'border-[hsl(220,10%,20%)]',
    borderLine: 'border-[hsl(220,10%,18%)]',
    dotPattern: 'hsl(210,15%,75%)',
  },
  midnight_blue: {
    id: 'midnight_blue',
    label: 'Midnight Blue',
    bg: 'bg-gradient-to-br from-[hsl(230,30%,8%)] via-[hsl(225,25%,12%)] to-[hsl(220,30%,16%)]',
    accent: 'text-[hsl(210,80%,60%)]',
    accentHex: 'hsl(210,80%,60%)',
    textPrimary: 'text-[hsl(210,30%,92%)]',
    textSecondary: 'text-[hsl(225,15%,50%)]',
    textMuted: 'text-[hsl(225,15%,38%)]',
    pillBg: 'bg-[hsl(225,25%,16%)]',
    pillBorder: 'border-[hsl(225,25%,24%)]',
    metricBg: 'bg-[hsl(225,25%,12%)]',
    metricBorder: 'border-[hsl(225,25%,20%)]',
    borderLine: 'border-[hsl(225,25%,18%)]',
    dotPattern: 'hsl(210,80%,60%)',
  },
  clean_platinum: {
    id: 'clean_platinum',
    label: 'Clean Platinum',
    bg: 'bg-gradient-to-br from-[hsl(220,5%,10%)] via-[hsl(220,4%,14%)] to-[hsl(220,5%,18%)]',
    accent: 'text-[hsl(0,0%,85%)]',
    accentHex: 'hsl(0,0%,85%)',
    textPrimary: 'text-[hsl(0,0%,92%)]',
    textSecondary: 'text-[hsl(220,5%,50%)]',
    textMuted: 'text-[hsl(220,5%,38%)]',
    pillBg: 'bg-[hsl(220,5%,16%)]',
    pillBorder: 'border-[hsl(220,5%,24%)]',
    metricBg: 'bg-[hsl(220,5%,12%)]',
    metricBorder: 'border-[hsl(220,5%,20%)]',
    borderLine: 'border-[hsl(220,5%,18%)]',
    dotPattern: 'hsl(0,0%,85%)',
  },
  ember_focus: {
    id: 'ember_focus',
    label: 'Ember Focus',
    bg: 'bg-gradient-to-br from-[hsl(0,12%,7%)] via-[hsl(10,10%,10%)] to-[hsl(15,12%,14%)]',
    accent: 'text-[hsl(20,85%,55%)]',
    accentHex: 'hsl(20,85%,55%)',
    textPrimary: 'text-[hsl(30,15%,90%)]',
    textSecondary: 'text-[hsl(15,8%,48%)]',
    textMuted: 'text-[hsl(15,8%,36%)]',
    pillBg: 'bg-[hsl(10,10%,14%)]',
    pillBorder: 'border-[hsl(10,10%,22%)]',
    metricBg: 'bg-[hsl(10,10%,10%)]',
    metricBorder: 'border-[hsl(10,10%,18%)]',
    borderLine: 'border-[hsl(10,10%,16%)]',
    dotPattern: 'hsl(20,85%,55%)',
  },
};

// ─── Labels ─────────────────────────────────────────────────────────
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  streak: 'Momentum Streak',
  milestone: 'Milestone Achieved',
  mentor_insight: 'Mentor Insight',
  progress: 'Progress Update',
  weekly_recap: 'Weekly Recap',
  level_up: 'Domain Level Up',
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

export async function nativeShare(text: string, title: string, imageBlob?: Blob): Promise<boolean> {
  if (navigator.share) {
    try {
      const shareData: ShareData = { title, text };
      if (imageBlob && navigator.canShare?.({ files: [new File([imageBlob], 'share.png', { type: 'image/png' })] })) {
        shareData.files = [new File([imageBlob], 'lifestack-share.png', { type: 'image/png' })];
      }
      await navigator.share(shareData);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
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
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    width: element.offsetWidth,
    height: element.offsetHeight,
    scale: w / element.offsetWidth,
    backgroundColor: null,
    useCORS: true,
  });
  return canvas;
}

// ─── Demo Data ──────────────────────────────────────────────────────
export function generateDemoCards(): ShareCardData[] {
  return [
    {
      cardType: 'streak',
      title: '90-Day Discipline Streak',
      subtitle: 'Three months of unbroken consistency.',
      statValue: '90',
      statLabel: 'Consecutive Days',
      secondaryValue: '347',
      secondaryLabel: 'Total Actions Logged',
      timeAnchor: 'Since Dec 10, 2025',
      philosophy: 'Discipline is the bridge between goals and accomplishment.',
      visualType: 'flame',
      domain: 'physical',
    },
    {
      cardType: 'milestone',
      title: 'Wealth Milestone Reached',
      subtitle: 'Emergency fund target achieved ahead of schedule.',
      statValue: '✓',
      statLabel: 'Emergency Fund Goal',
      secondaryValue: '63',
      secondaryLabel: 'Days to Completion',
      timeAnchor: 'Completed Mar 8, 2026',
      philosophy: 'Finished > Perfect.',
      visualType: 'badge',
      domain: 'wealth',
    },
    {
      cardType: 'mentor_insight',
      title: 'Pattern Detected',
      subtitle: 'Your energy peaks when you journal in the morning. Consider making it a keystone habit.',
      statValue: '87%',
      statLabel: 'Confidence Score',
      timeAnchor: 'Insight from Mar 8, 2026',
      philosophy: 'Self-awareness is the highest form of intelligence.',
      visualType: 'quote',
      domain: 'mind',
    },
    {
      cardType: 'progress',
      title: 'Physical Domain Progress',
      subtitle: 'Consistent gains across all tracked metrics.',
      statValue: '2,450',
      statLabel: 'Total XP Earned',
      secondaryValue: 'Level 6',
      secondaryLabel: 'Current Level',
      timeAnchor: 'This month',
      philosophy: 'The body keeps the score.',
      visualType: 'ring',
      domain: 'physical',
    },
    {
      cardType: 'weekly_recap',
      title: 'Week of Mar 3 – Mar 9',
      subtitle: 'A week of breakthroughs and steady momentum.',
      statValue: '24',
      statLabel: 'Actions Completed',
      secondaryValue: '4.2',
      secondaryLabel: 'Avg Mood Score',
      timeAnchor: 'Weekly Summary',
      philosophy: 'Every week is a chapter in your story.',
      visualType: 'chart',
      domain: 'mind',
    },
    {
      cardType: 'level_up',
      title: 'Health Level 8 Achieved',
      subtitle: 'Growth has evidence.',
      statValue: 'Level 8',
      statLabel: 'Physical Domain',
      secondaryValue: '1,200',
      secondaryLabel: 'XP This Quarter',
      timeAnchor: 'Leveled up Mar 10, 2026',
      philosophy: 'Levels are earned, never given.',
      visualType: 'radar',
      domain: 'physical',
    },
  ];
}

// ─── Platform Adapters (stubs for future) ───────────────────────────
export const platformAdapters = {
  instagram_stories: { available: false, label: 'Instagram Stories' },
  facebook_stories: { available: false, label: 'Facebook Stories' },
  instagram_feed: { available: false, label: 'Instagram Feed' },
  linkedin: { available: false, label: 'LinkedIn' },
  tiktok: { available: false, label: 'TikTok' },
  strava: { available: false, label: 'Strava' },
};
