import { cn } from '@/lib/utils';
import { applyPrivacy } from '@/services/shareService';
import type { ShareTemplateProps } from '../templates/types';
import {
  BrandPanel,
  InsightPanel,
  MediaPanel,
  MetaPanel,
  MomentumPanel,
  UserTextPanel,
} from './BentoPanels';
import { computeDynamicBentoLayout, resolveImageStyle, type BentoBaseVariant } from './layoutEngine';

interface AdaptiveBentoTemplateProps extends ShareTemplateProps {
  baseVariant: BentoBaseVariant;
}

function AtmosphericBackground({ url, opacity }: { url: string; opacity: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={url}
        alt=""
        crossOrigin="anonymous"
        className="w-full h-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          filter: `blur(16px) brightness(${opacity}) saturate(1.25)`,
          transform: 'scale(1.12)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, hsla(220,30%,3%,0.35) 0%, hsla(220,30%,3%,0.58) 58%, hsla(220,30%,3%,0.76) 100%)',
        }}
      />
    </div>
  );
}

export function AdaptiveBentoTemplate({
  baseVariant,
  data,
  theme,
  format,
  privacy: rawPrivacy,
  phrase,
  aiInsight,
  includeImage,
  imageLayout,
  showImageCount,
}: AdaptiveBentoTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const hasMedia = !!(includeImage && data.imageUrl);
  const imageStyle = resolveImageStyle(imageLayout, hasMedia);
  const hasInsight = !!aiInsight?.trim();

  const textLength = (data.title?.length || 0) + (data.subtitle?.length || 0);
  const insightLength = aiInsight?.length || 0;

  const layout = computeDynamicBentoLayout({
    baseVariant,
    format,
    imageStyle,
    hasMedia,
    hasInsight,
    insightLength,
    textLength,
  });

  const showNumbers = privacy.includeExactNumbers;

  const canvasPadding = `${layout.safePadding.top}px ${layout.safePadding.right}px ${layout.safePadding.bottom}px ${layout.safePadding.left}px`;

  const insightBlock = hasInsight ? (
    <InsightPanel
      insight={aiInsight!}
      links={data.aiInsightLinks}
      theme={theme}
      className="min-h-0"
      style={{ flex: `${layout.insightWeight} 1 0` }}
      fontSize={layout.insightFontSize}
      fullText
    />
  ) : null;

  const metaBlock = layout.showMeta ? (
    <MetaPanel
      cardType={data.cardType}
      timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
      domain={data.domain}
      theme={theme}
      className="min-w-0"
      style={{ flex: `${layout.metaWeight} 1 0` }}
      compact
    />
  ) : null;

  const momentumBlock = layout.showMomentum && data.statValue ? (
    <MomentumPanel
      statValue={data.statValue}
      statLabel={data.statLabel}
      secondaryValue={data.secondaryValue}
      secondaryLabel={data.secondaryLabel}
      phrase={phrase}
      theme={theme}
      showNumbers={showNumbers}
      className="min-w-0"
      style={{ flex: `${layout.momentumWeight} 1 0` }}
      compact={hasInsight}
    />
  ) : null;

  const userTextBlock = (
    <UserTextPanel
      title={data.title}
      subtitle={data.subtitle}
      theme={theme}
      className="min-h-0"
      style={{ flex: `${layout.textWeight} 1 0` }}
      maxTitleLines={layout.titleLines}
      maxSubtitleLines={layout.subtitleLines}
      titleSize={hasInsight ? 20 : 22}
      subtitleSize={13.5}
    />
  );

  const renderHero = () => (
    <>
      {hasMedia && (
        <MediaPanel
          url={data.imageUrl}
          urls={data.imageUrls}
          showCount={showImageCount}
          className="flex-shrink-0"
          style={{ flex: `0 0 ${Math.round(layout.heroMediaRatio * 100)}%` }}
        />
      )}

      <div
        className={cn('flex gap-2 flex-1 min-h-0', layout.secondaryDirection === 'row' ? 'flex-row' : 'flex-col')}
      >
        <div className="flex flex-col gap-2 min-h-0" style={{ flex: `${layout.textWeight} 1 0` }}>
          {userTextBlock}
          {metaBlock}
        </div>
        {insightBlock}
      </div>

      {momentumBlock}
    </>
  );

  const renderSplit = () => (
    <>
      <div className={cn('flex gap-2 flex-1 min-h-0', layout.splitDirection === 'row' ? 'flex-row' : 'flex-col')}>
        {hasMedia && (
          <MediaPanel
            url={data.imageUrl}
            urls={data.imageUrls}
            showCount={showImageCount}
            className="min-h-0"
            style={{ flex: `0 0 ${Math.round(layout.splitMediaRatio * 100)}%` }}
          />
        )}

        <div className="flex flex-col gap-2 flex-1 min-h-0">
          {insightBlock}
          {userTextBlock}
          <div className="flex gap-2 flex-shrink-0 min-h-0">
            {metaBlock}
            {momentumBlock}
          </div>
        </div>
      </div>
    </>
  );

  const renderBackground = () => (
    <>
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {insightBlock}
        {userTextBlock}

        {(metaBlock || momentumBlock || hasMedia) && (
          <div className="flex gap-2 min-h-0" style={{ flex: hasMedia ? '0 0 22%' : '0 0 auto' }}>
            {hasMedia && (
              <MediaPanel
                url={data.imageUrl}
                urls={data.imageUrls}
                showCount={showImageCount}
                className="min-w-0"
                style={{ flex: '1.15 1 0' }}
              />
            )}
            <div className="flex flex-col gap-2 min-w-0" style={{ flex: hasMedia ? '1 1 0' : '1 1 0' }}>
              {metaBlock}
              {momentumBlock}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: theme.bgGradient }}>
      {hasMedia && imageStyle === 'background_image' && (
        <AtmosphericBackground url={data.imageUrl!} opacity={layout.backgroundOverlay} />
      )}

      <div className="absolute inset-0 flex flex-col" style={{ padding: canvasPadding, gap: layout.gap }}>
        {imageStyle === 'split_image' ? renderSplit() : imageStyle === 'background_image' ? renderBackground() : renderHero()}

        {privacy.includeFooter && (
          <BrandPanel theme={theme} className="flex-shrink-0" compact={layout.compactBrand} />
        )}
      </div>
    </div>
  );
}
