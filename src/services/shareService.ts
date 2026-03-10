import { supabase } from '@/integrations/supabase/client';

export interface ShareCardData {
  cardType: 'streak' | 'milestone' | 'mentor_insight' | 'progress' | 'weekly_recap' | 'level_up';
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
  visualType?: 'flame' | 'ring' | 'radar' | 'badge' | 'chart' | 'none';
}

export interface PrivacySettings {
  includeName: boolean;
  includeUsername: boolean;
  includePhoto: boolean;
  includeExactNumbers: boolean;
  includeMentorQuote: boolean;
  includeDateTime: boolean;
  includeFooter: boolean;
}

export type ShareFormat = 'story' | 'feed' | 'square' | 'linkedin';
export type ShareTheme = 'executive' | 'warrior' | 'minimal' | 'cinematic';

export const DEFAULT_PRIVACY: PrivacySettings = {
  includeName: false,
  includeUsername: false,
  includePhoto: false,
  includeExactNumbers: true,
  includeMentorQuote: true,
  includeDateTime: true,
  includeFooter: true,
};

export const FORMAT_DIMENSIONS: Record<ShareFormat, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: 'Story (9:16)' },
  feed: { w: 1080, h: 1350, label: 'Feed (4:5)' },
  square: { w: 1080, h: 1080, label: 'Square (1:1)' },
  linkedin: { w: 1080, h: 1350, label: 'LinkedIn (4:5)' },
};

export const CARD_TYPE_LABELS: Record<string, string> = {
  streak: 'Momentum Streak',
  milestone: 'Milestone Achieved',
  mentor_insight: 'Mentor Insight',
  progress: 'Progress Update',
  weekly_recap: 'Weekly Recap',
  level_up: 'Domain Level Up',
};

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
];

export function getRandomPhrase(): string {
  return SIGNATURE_PHRASES[Math.floor(Math.random() * SIGNATURE_PHRASES.length)];
}

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

export async function nativeShare(text: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
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

// Generate demo data for preview
export function generateDemoCards(): ShareCardData[] {
  return [
    {
      cardType: 'streak',
      title: '30-Day Momentum Streak',
      subtitle: 'Consistency compounds. This streak is proof.',
      statValue: '30',
      statLabel: 'Consecutive Days',
      secondaryValue: '142',
      secondaryLabel: 'Total Actions Logged',
      timeAnchor: 'Since Feb 9, 2026',
      philosophy: 'Discipline is the bridge between goals and accomplishment.',
      visualType: 'flame',
    },
    {
      cardType: 'milestone',
      title: 'First Goal Completed',
      subtitle: 'Chapter complete.',
      statValue: '✓',
      statLabel: 'Launch side project',
      secondaryValue: '47',
      secondaryLabel: 'Days to Completion',
      timeAnchor: 'Completed Mar 10, 2026',
      philosophy: 'Finished > Perfect.',
      visualType: 'badge',
    },
    {
      cardType: 'mentor_insight',
      title: 'Pattern Detected',
      subtitle: 'Your energy peaks when you journal in the morning. Consider making it a keystone habit.',
      statValue: '87%',
      statLabel: 'Confidence Score',
      timeAnchor: 'Insight from Mar 8, 2026',
      philosophy: 'Self-awareness is the highest form of intelligence.',
      visualType: 'none',
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
    },
    {
      cardType: 'weekly_recap',
      title: 'Week of Mar 3 – Mar 9',
      subtitle: 'A week of breakthroughs and steady momentum.',
      statValue: '18',
      statLabel: 'Actions Completed',
      secondaryValue: '4.2',
      secondaryLabel: 'Avg Mood Score',
      timeAnchor: 'Weekly Summary',
      philosophy: 'Every week is a chapter in your story.',
      visualType: 'chart',
    },
    {
      cardType: 'level_up',
      title: 'Mind Level 5 Achieved',
      subtitle: 'Growth has evidence.',
      statValue: 'Level 5',
      statLabel: 'Mind Domain',
      secondaryValue: '500',
      secondaryLabel: 'XP Earned',
      timeAnchor: 'Leveled up Mar 10, 2026',
      philosophy: 'Levels are earned, never given.',
      visualType: 'radar',
    },
  ];
}
