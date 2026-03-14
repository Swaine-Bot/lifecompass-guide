import type { ShareTemplateProps } from '../templates/types';
import { MediaPanel, InsightPanel, UserTextPanel, MetaPanel, MomentumPanel, BrandPanel } from './BentoPanels';
import { applyPrivacy } from '@/services/shareService';

export function HeroBentoLayout({ data, theme, format, privacy: rawPrivacy, phrase, aiInsight, includeImage, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const hasMedia = includeImage && !!data.imageUrl;
  const hasInsight = !!aiInsight;
  const showNumbers = privacy.includeExactNumbers;
  const isStory = format === 'story' || format === 'tiktok';

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: theme.bgGradient,
        padding: isStory ? '28px 18px 40px' : '14px',
        gap: 7,
      }}
    >
      {hasMedia && (
        <MediaPanel
          url={data.imageUrl}
          urls={data.imageUrls}
          showCount={showImageCount}
          className="flex-shrink-0"
          style={{ flex: isStory ? '0 0 40%' : '0 0 45%' }}
        />
      )}

      <div className="flex gap-2" style={{ flex: hasMedia ? '0 0 auto' : '1 1 0', minHeight: 0 }}>
        {hasInsight ? (
          <>
            <InsightPanel insight={aiInsight!} theme={theme} className="flex-[2] min-w-0" />
            <MetaPanel cardType={data.cardType} timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined} domain={data.domain} theme={theme} className="flex-1 min-w-0" />
          </>
        ) : (
          <MomentumPanel
            statValue={data.statValue}
            statLabel={data.statLabel}
            secondaryValue={data.secondaryValue}
            secondaryLabel={data.secondaryLabel}
            phrase={phrase}
            theme={theme}
            showNumbers={showNumbers}
            className="flex-1"
          />
        )}
      </div>

      <UserTextPanel
        title={data.title}
        subtitle={data.subtitle}
        theme={theme}
        className="flex-shrink-0"
        maxTitleLines={2}
        maxSubtitleLines={2}
      />

      {hasInsight && data.statValue && (
        <MomentumPanel
          statValue={data.statValue}
          statLabel={data.statLabel}
          phrase={phrase}
          theme={theme}
          showNumbers={showNumbers}
          className="flex-shrink-0"
        />
      )}

      {privacy.includeFooter && <BrandPanel theme={theme} className="flex-shrink-0 mt-auto" />}
    </div>
  );
}
