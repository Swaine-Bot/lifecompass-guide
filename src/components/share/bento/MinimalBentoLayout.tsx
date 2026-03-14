import type { ShareTemplateProps } from '../templates/types';
import { MediaPanel, UserTextPanel, MomentumPanel, BrandPanel } from './BentoPanels';

export function MinimalBentoLayout({ data, theme, format, privacy, phrase, aiInsight, includeImage, showImageCount }: ShareTemplateProps) {
  const hasMedia = includeImage && !!data.imageUrl;
  const showNumbers = privacy.includeExactNumbers;
  const isStory = format === 'story' || format === 'tiktok';

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        background: theme.bgGradient,
        padding: isStory ? '120px 28px 180px' : '40px 28px',
        gap: 10,
      }}
    >
      {/* Media (compact) */}
      {hasMedia && (
        <MediaPanel
          url={data.imageUrl}
          urls={data.imageUrls}
          showCount={showImageCount}
          className="flex-shrink-0"
          style={{ maxHeight: '35%' }}
        />
      )}

      {/* Quote / title */}
      <UserTextPanel
        title={aiInsight ? `"${aiInsight}"` : data.title}
        subtitle={aiInsight ? data.title : data.subtitle}
        theme={theme}
        className="flex-shrink-0"
        maxTitleLines={4}
        maxSubtitleLines={2}
      />

      {/* Momentum (if exists) */}
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
