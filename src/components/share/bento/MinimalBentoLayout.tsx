import type { ShareTemplateProps } from '../templates/types';
import { MediaPanel, InsightPanel, UserTextPanel, MomentumPanel, BrandPanel } from './BentoPanels';
import { applyPrivacy } from '@/services/shareService';

export function MinimalBentoLayout({ data, theme, format, privacy: rawPrivacy, phrase, aiInsight, includeImage, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const hasMedia = includeImage && !!data.imageUrl;
  const hasInsight = !!aiInsight;
  const showNumbers = privacy.includeExactNumbers;
  const isStory = format === 'story' || format === 'tiktok';

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        background: theme.bgGradient,
        padding: isStory ? '28px 18px 40px' : '20px 14px',
        gap: 8,
      }}
    >
      {hasMedia && (
        <MediaPanel
          url={data.imageUrl}
          urls={data.imageUrls}
          showCount={showImageCount}
          className="flex-shrink-0"
          style={{ maxHeight: '35%' }}
        />
      )}

      {hasInsight && (
        <InsightPanel
          insight={aiInsight!}
          theme={theme}
          className="flex-shrink-0"
        />
      )}

      <UserTextPanel
        title={hasInsight ? data.title : (aiInsight ? `"${aiInsight}"` : data.title)}
        subtitle={hasInsight ? data.subtitle : (aiInsight ? data.title : data.subtitle)}
        theme={theme}
        className="flex-shrink-0"
        maxTitleLines={4}
        maxSubtitleLines={2}
      />

      {data.statValue && (
        <MomentumPanel
          statValue={data.statValue}
          statLabel={data.statLabel}
          phrase={phrase}
          theme={theme}
          showNumbers={showNumbers}
          className="flex-shrink-0"
          compact
        />
      )}

      {privacy.includeFooter && <BrandPanel theme={theme} className="flex-shrink-0 mt-auto" compact />}
    </div>
  );
}
