import type { ShareCardData, PrivacySettings, ShareTheme, ShareFormat, ThemeDefinition } from '@/services/shareService';

export type ShareTemplateName = 'classic' | 'story' | 'minimal' | 'momentum' | 'media_spotlight' | 'reflection';

export interface ShareTemplateProps {
  data: ShareCardData;
  theme: ThemeDefinition;
  format: ShareFormat;
  privacy: PrivacySettings;
  phrase: string;
  userName?: string;
  animate?: boolean;
  aiInsight?: string | null;
}

export interface TemplateMetadata {
  id: ShareTemplateName;
  label: string;
  description: string;
  bestFor: string[];
  aiInsightPlacement: string;
  suggestedForTypes: string[];
}

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
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
  if (hasMedia) return 'media_spotlight';
  if (!sourceType) return 'classic';
  
  const match = TEMPLATE_REGISTRY.find(t => t.suggestedForTypes.includes(sourceType));
  return match?.id || 'classic';
}
