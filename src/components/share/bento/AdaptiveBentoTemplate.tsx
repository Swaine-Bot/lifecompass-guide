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
  const gap = layout.gap;

  // ── Shared panel blocks ──

  const insightBlock = hasInsight ? (
    <InsightPanel
      insight={aiInsight!}
      links={data.aiInsightLinks}
      theme={theme}
      style={{
        flex: `${layout.insightWeight} 1 0`,
        minHeight: 0,
        overflow: 'hidden',
      }}
      fontSize={layout.insightFontSize}
      fullText
    />
  ) : null;

  const userTextBlock = (
    <UserTextPanel
      title={data.title}
      subtitle={data.subtitle}
      theme={theme}
      style={{
        flex: `${layout.textWeight} 1 0`,
        minHeight: 0,
        overflow: 'hidden',
      }}
      maxTitleLines={layout.titleLines}
      maxSubtitleLines={layout.subtitleLines}
      titleSize={hasInsight ? 18 : 20}
      subtitleSize={hasInsight ? 12 : 13}
    />
  );

  const metaBlock = layout.showMeta ? (
    <MetaPanel
      cardType={data.cardType}
      timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
      domain={data.domain}
      theme={theme}
      style={{
        flex: `${layout.metaWeight} 1 0`,
        minHeight: 0,
        overflow: 'hidden',
      }}
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
      style={{
        flex: `${layout.momentumWeight} 1 0`,
        minHeight: 0,
        overflow: 'hidden',
      }}
      compact={hasInsight}
    />
  ) : null;

  // ── HERO layout ──
  // Media dominates. Text/insight are secondary below.
  const renderHero = () => (
    <>
      {hasMedia && (
        <MediaPanel
          url={data.imageUrl}
          urls={data.imageUrls}
          showCount={showImageCount}
          style={{
            flex: `0 0 ${Math.round(layout.heroMediaRatio * 100)}%`,
            minHeight: 0,
            overflow: 'hidden',
          }}
        />
      )}

      {/* Secondary content stacks vertically below media */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          flex: '1 1 0',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {insightBlock}
        {userTextBlock}
        <div style={{ display: 'flex', gap, flexShrink: 0, minHeight: 0 }}>
          {metaBlock}
          {momentumBlock}
        </div>
      </div>
    </>
  );

  // ── SPLIT layout ──
  // Media left/top, content column right/bottom.
  // RULE 5: right column is a strict stack: insight → user → meta+momentum
  const renderSplit = () => {
    const isRow = layout.splitDirection === 'row';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: isRow ? 'row' : 'column',
          gap,
          flex: '1 1 0',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {hasMedia && (
          <MediaPanel
            url={data.imageUrl}
            urls={data.imageUrls}
            showCount={showImageCount}
            style={{
              flex: `0 0 ${Math.round(layout.splitMediaRatio * 100)}%`,
              minHeight: 0,
              overflow: 'hidden',
            }}
          />
        )}

        {/* RULE 5 — strict stacked column for text panels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap,
            flex: '1 1 0',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {insightBlock}
          {userTextBlock}
          {(metaBlock || momentumBlock) && (
            <div style={{ display: 'flex', gap, flexShrink: 0, minHeight: 0, overflow: 'hidden' }}>
              {metaBlock}
              {momentumBlock}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── BACKGROUND layout ──
  // Media is atmospheric. Text dominates foreground.
  const renderBackground = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        flex: '1 1 0',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {insightBlock}
      {userTextBlock}

      {(metaBlock || momentumBlock || hasMedia) && (
        <div style={{ display: 'flex', gap, flex: hasMedia ? '0 0 20%' : '0 0 auto', minHeight: 0, overflow: 'hidden' }}>
          {hasMedia && (
            <MediaPanel
              url={data.imageUrl}
              urls={data.imageUrls}
              showCount={showImageCount}
              style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap, flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
            {metaBlock}
            {momentumBlock}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: theme.bgGradient }}>
      {/* Atmospheric background image for background mode */}
      {hasMedia && imageStyle === 'background_image' && (
        <AtmosphericBackground url={data.imageUrl!} opacity={layout.backgroundOverlay} />
      )}

      {/* Main layout container — RULE 1: everything inside measured bounds */}
      <div
        className="absolute inset-0"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: canvasPadding,
          gap,
          overflow: 'hidden',
        }}
      >
        {imageStyle === 'split_image'
          ? renderSplit()
          : imageStyle === 'background_image'
            ? renderBackground()
            : renderHero()}

        {/* RULE 6 — footer safe zone */}
        {privacy.includeFooter && (
          <BrandPanel theme={theme} compact={layout.compactBrand} />
        )}
      </div>
    </div>
  );
}
