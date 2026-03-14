import type { ShareTemplateProps } from '../templates/types';
import { MediaPanel, InsightPanel, UserTextPanel, MetaPanel, MomentumPanel, BrandPanel } from './BentoPanels';

export function ReflectionBentoLayout({ data, theme, format, privacy, phrase, aiInsight, includeImage, showImageCount }: ShareTemplateProps) {
  const hasMedia = includeImage && !!data.imageUrl;
  const hasInsight = !!aiInsight;
  const showNumbers = privacy.includeExactNumbers;
  const isStory = format === 'story' || format === 'tiktok';

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: theme.bgGradient,
        padding: isStory ? '120px 28px 180px' : '28px',
        gap: 8,
      }}
    >
      {/* Large insight panel — hero */}
      {hasInsight ? (
        <InsightPanel insight={aiInsight!} theme={theme} className="flex-[2] min-h-0" />
      ) : (
        <UserTextPanel
          title={data.title}
          subtitle={data.subtitle}
          theme={theme}
          className="flex-[2] min-h-0"
          maxTitleLines={4}
          maxSubtitleLines={4}
        />
      )}

      {/* Row: Media preview + Meta */}
      <div className="flex gap-2 flex-shrink-0" style={{ height: hasMedia ? '25%' : 'auto' }}>
        {hasMedia && (
          <MediaPanel
            url={data.imageUrl}
            urls={data.imageUrls}
            showCount={showImageCount}
            className="flex-1 min-w-0"
          />
        )}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <MetaPanel
            cardType={data.cardType}
            timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
            domain={data.domain}
            theme={theme}
            className="flex-1"
          />
        </div>
      </div>

      {/* User text (if insight took hero) */}
      {hasInsight && (
        <UserTextPanel
          title={data.title}
          subtitle={data.subtitle}
          theme={theme}
          className="flex-shrink-0"
          maxTitleLines={2}
          maxSubtitleLines={2}
        />
      )}

      {/* Momentum */}
      {data.statValue && (
        <MomentumPanel
          statValue={data.statValue}
          statLabel={data.statLabel}
          phrase={phrase}
          theme={theme}
          showNumbers={showNumbers}
          className="flex-shrink-0"
        />
      )}

      {/* Brand */}
      {privacy.includeFooter && <BrandPanel theme={theme} className="flex-shrink-0 mt-auto" />}
    </div>
  );
}
