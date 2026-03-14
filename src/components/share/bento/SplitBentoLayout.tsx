import type { ShareTemplateProps } from '../templates/types';
import { MediaPanel, InsightPanel, UserTextPanel, MetaPanel, MomentumPanel, BrandPanel } from './BentoPanels';
import { applyPrivacy } from '@/services/shareService';

export function SplitBentoLayout({ data, theme, format, privacy: rawPrivacy, phrase, aiInsight, includeImage, showImageCount }: ShareTemplateProps) {
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
      <div className="flex gap-2 flex-1 min-h-0">
        {hasMedia && (
          <MediaPanel
            url={data.imageUrl}
            urls={data.imageUrls}
            showCount={showImageCount}
            className="flex-1 min-w-0"
          />
        )}

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {hasInsight && (
            <InsightPanel insight={aiInsight!} theme={theme} className="flex-1 min-h-0" />
          )}
          <UserTextPanel
            title={data.title}
            subtitle={data.subtitle}
            theme={theme}
            className="flex-1 min-h-0"
            maxTitleLines={2}
            maxSubtitleLines={2}
          />
          <MetaPanel
            cardType={data.cardType}
            timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
            domain={data.domain}
            theme={theme}
            className="flex-shrink-0"
            compact
          />
        </div>
      </div>

      {data.statValue && (
        <MomentumPanel
          statValue={data.statValue}
          statLabel={data.statLabel}
          secondaryValue={data.secondaryValue}
          secondaryLabel={data.secondaryLabel}
          phrase={phrase}
          theme={theme}
          showNumbers={showNumbers}
          className="flex-shrink-0"
          compact={hasInsight}
        />
      )}

      {privacy.includeFooter && <BrandPanel theme={theme} className="flex-shrink-0" compact />}
    </div>
  );
}
