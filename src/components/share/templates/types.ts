import type { ShareCardData, PrivacySettings, ShareTheme, ShareFormat, ThemeDefinition, ImageLayout } from '@/services/shareService';

export type ShareTemplateName = 'classic' | 'story' | 'minimal' | 'momentum' | 'media_spotlight' | 'reflection' | 'bento_hero' | 'bento_split' | 'bento_reflection' | 'bento_minimal';

export interface ShareTemplateProps {
  data: ShareCardData;
  theme: ThemeDefinition;
  format: ShareFormat;
  privacy: PrivacySettings;
  phrase: string;
  userName?: string;
  animate?: boolean;
  aiInsight?: string | null;
  /** Whether to show the post image */
  includeImage?: boolean;
  /** Image display mode */
  imageLayout?: ImageLayout;
  /** Show "+N more" badge */
  showImageCount?: boolean;
}

export interface TemplateMetadata {
  id: ShareTemplateName;
  label: string;
  description: string;
  bestFor: string[];
  aiInsightPlacement: string;
  suggestedForTypes: string[];
  isBento?: boolean;
}

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
  // ─── Bento Templates (featured) ─────────────────────────────────
  {
    id: 'bento_hero',
    label: 'Bento Hero',
    description: 'Modular bento grid with large media panel',
    bestFor: ['Instagram', 'TikTok', 'Photos'],
    aiInsightPlacement: 'dedicated panel',
    suggestedForTypes: ['feed_post', 'journal_reflection', 'achievement'],
    isBento: true,
  },
  {
    id: 'bento_split',
    label: 'Bento Split',
    description: 'Side-by-side media and content panels',
    bestFor: ['LinkedIn', 'Facebook'],
    aiInsightPlacement: 'stacked panel',
    suggestedForTypes: ['milestone', 'progress', 'goal_progress'],
    isBento: true,
  },
  {
    id: 'bento_reflection',
    label: 'Bento Reflect',
    description: 'Insight-first layout for deep shares',
    bestFor: ['Journal', 'Mentor', 'Insights'],
    aiInsightPlacement: 'hero panel',
    suggestedForTypes: ['mentor_insight', 'journal_reflection', 'weekly_recap'],
    isBento: true,
  },
  {
    id: 'bento_minimal',
    label: 'Bento Minimal',
    description: 'Clean, concise quote card',
    bestFor: ['Quotes', 'Quick shares'],
    aiInsightPlacement: 'inline text',
    suggestedForTypes: ['mentor_insight', 'micro_move_completed'],
    isBento: true,
  },
  // ─── Legacy Templates ───────────────────────────────────────────
  {
    id: 'classic',
    label: 'Classic',
    description: 'Clean, elegant card with strong readability',
    bestFor: ['LinkedIn', 'Professional'],
    aiInsightPlacement: 'footer caption',
    suggestedForTypes: ['milestone', 'progress', 'level_up', 'goal_created', 'goal_progress'],
  },
  {
    id: 'story',
    label: 'Story',
    description: 'Expressive layout with emotional tone',
    bestFor: ['Instagram', 'Facebook'],
    aiInsightPlacement: 'narrative pull-quote',
    suggestedForTypes: ['feed_post', 'journal_reflection', 'achievement'],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Typography-focused, ultra-clean',
    bestFor: ['Quotes', 'Reflections'],
    aiInsightPlacement: 'secondary line',
    suggestedForTypes: ['mentor_insight', 'journal_reflection'],
  },
  {
    id: 'momentum',
    label: 'Momentum',
    description: 'Achievement and progress emphasis',
    bestFor: ['Wins', 'Streaks', 'Goals'],
    aiInsightPlacement: 'progress note',
    suggestedForTypes: ['streak', 'micro_move_completed', 'goal_progress'],
  },
  {
    id: 'media_spotlight',
    label: 'Media',
    description: 'Media-first layout for photos and video',
    bestFor: ['Photos', 'Video', 'Audio'],
    aiInsightPlacement: 'caption overlay',
    suggestedForTypes: ['journal_reflection', 'feed_post'],
  },
  {
    id: 'reflection',
    label: 'Reflection',
    description: 'Thoughtful, quote-style composition',
    bestFor: ['Journal', 'Mentor', 'Insights'],
    aiInsightPlacement: 'emotional framing',
    suggestedForTypes: ['mentor_insight', 'journal_reflection', 'weekly_recap'],
  },
];

export function suggestTemplate(sourceType?: string, hasMedia?: boolean): ShareTemplateName {
  if (hasMedia) return 'bento_hero';
  if (!sourceType) return 'bento_hero';
  
  // Prefer bento templates
  const bentoMatch = TEMPLATE_REGISTRY.filter(t => t.isBento).find(t => t.suggestedForTypes.includes(sourceType));
  if (bentoMatch) return bentoMatch.id;
  
  return 'bento_hero';
}
