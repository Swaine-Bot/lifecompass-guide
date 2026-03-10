import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShareCardData, CardType, VisualModule } from '@/services/shareService';

// ─── Shareable Source Types ─────────────────────────────────────────
export type ShareSourceType =
  | 'mentor_insight'
  | 'goal_created'
  | 'goal_progress'
  | 'micro_move_completed'
  | 'journal_reflection'
  | 'achievement'
  | 'weekly_recap'
  | 'app_invite'
  | 'feed_post'
  | 'feed_post_insight'
  | 'feed_post_offer'
  | 'feed_post_suggestions';

export interface ShareSource {
  type: ShareSourceType;
  id?: string;
  title: string;
  subtitle?: string;
  statValue?: string;
  statLabel?: string;
  domain?: string;
  quote?: string;       // for mentor insights
  excerpt?: string;     // for journal (max 120 chars)
  contextTag?: string;  // for mentor insight context
  // Feed post specific
  authorName?: string;
  postCategory?: string;
  insightSnippet?: string;
  offerTitle?: string;
  suggestionLabels?: string[];
  // Image support
  imageUrl?: string;
  imageUrls?: string[];
}

// ─── Source → Card mapping ──────────────────────────────────────────
const SOURCE_TO_CARD: Record<ShareSourceType, { cardType: CardType; visualType: VisualModule; identityLabel: string }> = {
  mentor_insight:         { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'INSIGHT' },
  goal_created:           { cardType: 'milestone', visualType: 'badge', identityLabel: 'DECLARATION' },
  goal_progress:          { cardType: 'progress', visualType: 'ring', identityLabel: 'PROGRESS' },
  micro_move_completed:   { cardType: 'streak', visualType: 'flame', identityLabel: 'MOMENTUM' },
  journal_reflection:     { cardType: 'milestone', visualType: 'quote', identityLabel: 'REFLECTION' },
  achievement:            { cardType: 'level_up', visualType: 'badge', identityLabel: 'ACHIEVEMENT' },
  weekly_recap:           { cardType: 'weekly_recap', visualType: 'chart', identityLabel: 'WEEKLY REFLECTION' },
  app_invite:             { cardType: 'milestone', visualType: 'badge', identityLabel: 'INVITATION' },
  feed_post:              { cardType: 'milestone', visualType: 'none', identityLabel: 'POST' },
  feed_post_insight:      { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'POST · INSIGHT' },
  feed_post_offer:        { cardType: 'level_up', visualType: 'badge', identityLabel: 'POST · OFFER' },
  feed_post_suggestions:  { cardType: 'progress', visualType: 'chart', identityLabel: 'POST · SUGGESTIONS' },
};

function sourceToCardData(source: ShareSource): ShareCardData {
  const mapping = SOURCE_TO_CARD[source.type];

  if (source.type === 'app_invite') {
    return {
      cardType: mapping.cardType,
      title: 'Design your life with intention.',
      subtitle: 'LifeStack is a life companion and AI mentor that helps you turn daily actions into long-term progress.',
      philosophy: 'Join me on LifeStack',
      visualType: mapping.visualType,
      identityLabel: mapping.identityLabel,
      sourceType: source.type,
      sourceId: source.id,
      domain: 'mind',
    };
  }

  if (source.type === 'mentor_insight') {
    return {
      cardType: mapping.cardType,
      title: 'Mentor Insight',
      subtitle: source.quote || source.subtitle,
      statValue: source.contextTag || 'Life Strategy',
      statLabel: '',
      philosophy: '',
      visualType: mapping.visualType,
      identityLabel: mapping.identityLabel,
      sourceType: source.type,
      sourceId: source.id,
      domain: source.domain || 'mind',
    };
  }

  if (source.type === 'journal_reflection') {
    const excerpt = (source.excerpt || source.subtitle || '').slice(0, 120);
    return {
      cardType: mapping.cardType,
      title: 'Reflection',
      subtitle: excerpt,
      statValue: source.statValue,
      statLabel: source.statLabel,
      philosophy: '',
      visualType: mapping.visualType,
      identityLabel: mapping.identityLabel,
      sourceType: source.type,
      sourceId: source.id,
      domain: source.domain || 'mind',
    };
  }

  // Feed post types
  if (source.type.startsWith('feed_post')) {
    const subtitle = source.type === 'feed_post_insight'
      ? source.insightSnippet || source.subtitle
      : source.type === 'feed_post_offer'
        ? source.offerTitle || source.subtitle
        : source.type === 'feed_post_suggestions'
          ? (source.suggestionLabels?.slice(0, 3).join(' · ') || source.subtitle)
          : source.subtitle;

    return {
      cardType: mapping.cardType,
      title: source.title,
      subtitle: subtitle?.slice(0, 200),
      statValue: source.statValue,
      statLabel: source.statLabel || source.postCategory,
      philosophy: '',
      visualType: mapping.visualType,
      identityLabel: mapping.identityLabel,
      sourceType: source.type,
      sourceId: source.id,
      domain: source.domain || 'mind',
      imageUrl: source.imageUrl,
      imageUrls: source.imageUrls,
      imageLayout: source.imageUrl ? 'hero_image' as const : undefined,
    };
  }

  return {
    cardType: mapping.cardType,
    title: source.title,
    subtitle: source.subtitle,
    statValue: source.statValue,
    statLabel: source.statLabel,
    philosophy: '',
    visualType: mapping.visualType,
    identityLabel: mapping.identityLabel,
    sourceType: source.type,
    sourceId: source.id,
    domain: source.domain || 'mind',
  };
}

/**
 * Universal share hook — routes any LifeStack content into Share Studio.
 * Usage: const { openShareStudio } = useUniversalShare();
 */
export function useUniversalShare() {
  const navigate = useNavigate();

  const openShareStudio = useCallback((source: ShareSource) => {
    const cardData = sourceToCardData(source);
    // Pass pre-populated card data via router state
    navigate('/share-studio', { state: { prefill: cardData, origin: source.type } });
  }, [navigate]);

  return { openShareStudio };
}
