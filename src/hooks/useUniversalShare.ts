import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShareCardData, CardType, VisualModule, SponsorData } from '@/services/shareService';

// ─── Shareable Source Types ─────────────────────────────────────────
export type ShareSourceType =
  | 'mentor_insight'
  | 'goal_created'
  | 'goal_progress'
  | 'goal_completed'
  | 'micro_move_completed'
  | 'journal_reflection'
  | 'achievement'
  | 'weekly_recap'
  | 'app_invite'
  | 'feed_post'
  | 'feed_post_insight'
  | 'feed_post_offer'
  | 'feed_post_suggestions'
  | 'habit_streak'
  | 'wellness_streak'
  | 'vault_insight'
  | 'reward_unlocked'
  | 'challenge_completed'
  | 'domain_levelup'
  | 'daily_signal'
  | 'mirror_moment'
  | 'cinematic_report'
  | 'progress_snapshot'
  | 'partner_reward';

export interface ShareSource {
  type: ShareSourceType;
  id?: string;
  title: string;
  subtitle?: string;
  statValue?: string;
  statLabel?: string;
  domain?: string;
  quote?: string;
  excerpt?: string;
  contextTag?: string;
  // Feed post specific
  authorName?: string;
  postCategory?: string;
  insightSnippet?: string;
  offerTitle?: string;
  suggestionLabels?: string[];
  // Image support
  imageUrl?: string;
  imageUrls?: string[];
  // All media (images, video, audio) for journal entries
  mediaUrls?: string[];
  // Sponsor / Partner
  sponsor?: SponsorData;
}

// ─── Source → Card mapping ──────────────────────────────────────────
const SOURCE_TO_CARD: Record<ShareSourceType, { cardType: CardType; visualType: VisualModule; identityLabel: string }> = {
  mentor_insight:         { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'INSIGHT' },
  goal_created:           { cardType: 'milestone', visualType: 'badge', identityLabel: 'DECLARATION' },
  goal_progress:          { cardType: 'progress', visualType: 'ring', identityLabel: 'PROGRESS' },
  goal_completed:         { cardType: 'milestone', visualType: 'badge', identityLabel: 'COMPLETED' },
  micro_move_completed:   { cardType: 'streak', visualType: 'flame', identityLabel: 'MOMENTUM' },
  journal_reflection:     { cardType: 'milestone', visualType: 'quote', identityLabel: 'REFLECTION' },
  achievement:            { cardType: 'level_up', visualType: 'badge', identityLabel: 'ACHIEVEMENT' },
  weekly_recap:           { cardType: 'weekly_recap', visualType: 'chart', identityLabel: 'WEEKLY REFLECTION' },
  app_invite:             { cardType: 'milestone', visualType: 'badge', identityLabel: 'INVITATION' },
  feed_post:              { cardType: 'milestone', visualType: 'none', identityLabel: 'POST' },
  feed_post_insight:      { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'POST · INSIGHT' },
  feed_post_offer:        { cardType: 'level_up', visualType: 'badge', identityLabel: 'POST · OFFER' },
  feed_post_suggestions:  { cardType: 'progress', visualType: 'chart', identityLabel: 'POST · SUGGESTIONS' },
  habit_streak:           { cardType: 'streak', visualType: 'flame', identityLabel: 'STREAK' },
  wellness_streak:        { cardType: 'streak', visualType: 'flame', identityLabel: 'WELLNESS' },
  vault_insight:          { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'SAVED INSIGHT' },
  reward_unlocked:        { cardType: 'level_up', visualType: 'badge', identityLabel: 'REWARD' },
  challenge_completed:    { cardType: 'milestone', visualType: 'badge', identityLabel: 'CHALLENGE' },
  domain_levelup:         { cardType: 'level_up', visualType: 'badge', identityLabel: 'LEVEL UP' },
  daily_signal:           { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'DAILY SIGNAL' },
  mirror_moment:          { cardType: 'mentor_insight', visualType: 'quote', identityLabel: 'MIRROR MOMENT' },
  cinematic_report:       { cardType: 'weekly_recap', visualType: 'chart', identityLabel: 'REPORT' },
  progress_snapshot:      { cardType: 'progress', visualType: 'ring', identityLabel: 'SNAPSHOT' },
  partner_reward:         { cardType: 'level_up', visualType: 'badge', identityLabel: 'PARTNER REWARD' },
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
      sponsor: source.sponsor,
    };
  }

  if (source.type === 'mentor_insight' || source.type === 'daily_signal' || source.type === 'mirror_moment') {
    return {
      cardType: mapping.cardType,
      title: source.type === 'mentor_insight' ? 'Mentor Insight' : source.type === 'daily_signal' ? 'Daily Signal' : 'Mirror Moment',
      subtitle: source.quote || source.subtitle,
      statValue: source.contextTag || 'Life Strategy',
      statLabel: '',
      philosophy: '',
      visualType: mapping.visualType,
      identityLabel: mapping.identityLabel,
      sourceType: source.type,
      sourceId: source.id,
      domain: source.domain || 'mind',
      sponsor: source.sponsor,
    };
  }

  if (source.type === 'journal_reflection') {
    const excerpt = (source.excerpt || source.subtitle || '').slice(0, 120);
    const imageUrls = source.mediaUrls?.filter(u => /\.(jpg|jpeg|png|gif|webp)/i.test(u)) || source.imageUrls;
    const videoUrls = source.mediaUrls?.filter(u => /\.(mp4|mov|webm)/i.test(u));
    const audioUrls = source.mediaUrls?.filter(u => /\.(mp3|wav|webm|ogg)/i.test(u));
    const firstImage = imageUrls?.[0] || source.imageUrl;

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
      imageUrl: firstImage,
      imageUrls: imageUrls,
      imageLayout: firstImage ? 'hero_image' as const : undefined,
      secondaryValue: videoUrls?.length ? `🎬 ${videoUrls.length} video${videoUrls.length > 1 ? 's' : ''}` : audioUrls?.length ? `🎙️ ${audioUrls.length} voice note${audioUrls.length > 1 ? 's' : ''}` : undefined,
      secondaryLabel: videoUrls?.length ? 'attached' : audioUrls?.length ? 'attached' : undefined,
      sponsor: source.sponsor,
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
      sponsor: source.sponsor,
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
    imageUrl: source.imageUrl,
    imageUrls: source.imageUrls,
    imageLayout: source.imageUrl ? 'hero_image' as const : undefined,
    sponsor: source.sponsor,
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
