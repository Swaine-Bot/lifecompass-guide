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
          filter: `blur(20px) brightness(${opacity}) saturate(1.2)`,
          transform: 'scale(1.15)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, hsla(220,30%,3%,0.4) 0%, hsla(220,30%,3%,0.6) 50%, hsla(220,30%,3%,0.8) 100%)',
        }}
      />
    </div>
  );
}

/**
 * Premium modular share card composer.
 * 
 * Builds cards from dedicated content blocks arranged by the layout engine.
 * Each block is a self-contained panel with its own visual treatment.
 * 
 * Layout hierarchy: Media > AI Insight > User Text > Supporting metadata
 */
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

  // ── Panel blocks ──

  const mediaBlock = hasMedia ? (
    <MediaPanel
      url={data.imageUrl}
      urls={data.imageUrls}
      showCount={showImageCount}
    />
  ) : null;

  const insightBlock = hasInsight ? (
    <InsightPanel
      insight={aiInsight!}
      links={data.aiInsightLinks}
      theme={theme}
      fontSize={layout.insightFontSize}
      fullText
    />
  ) : null;

  const userTextBlock = (
    <UserTextPanel
      title={data.title}
      subtitle={data.subtitle}
      theme={theme}
      maxTitleLines={layout.titleLines}
      maxSubtitleLines={layout.subtitleLines}
      titleSize={layout.titleFontSize}
      subtitleSize={layout.subtitleFontSize}
    />
  );

  const metaBlock = layout.showMeta ? (
    <MetaPanel
      cardType={data.cardType}
      timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
      domain={data.domain}
      theme={theme}
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
      compact={hasInsight}
    />
  ) : null;

  // ── HERO LAYOUT ──
  // Media dominates as primary panel. Content stacks below.
  const renderHero = () => (
    <>
      {mediaBlock && (
        <div style={{ flex: `0 0 ${Math.round(layout.heroMediaRatio * 100)}%`, minHeight: 0, overflow: 'hidden' }}>
          {React.cloneElement(mediaBlock, { style: { height: '100%' } })}
        </div>
      )}

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
        {insightBlock && (
          <div style={{ flex: `${layout.insightWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
            {React.cloneElement(insightBlock, { style: { height: '100%' } })}
          </div>
        )}
        <div style={{ flex: `${layout.textWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
          {React.cloneElement(userTextBlock, { style: { height: '100%' } })}
        </div>
        {(metaBlock || momentumBlock) && (
          <div style={{ display: 'flex', gap, flexShrink: 0, minHeight: 0 }}>
            {momentumBlock && (
              <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                {React.cloneElement(momentumBlock, { style: { height: '100%' } })}
              </div>
            )}
            {metaBlock && (
              <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                {React.cloneElement(metaBlock, { style: { height: '100%' } })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // ── SPLIT LAYOUT ──
  // True divided composition — media in one region, content in complementary region.
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
        {mediaBlock && (
          <div style={{ flex: `0 0 ${Math.round(layout.splitMediaRatio * 100)}%`, minHeight: 0, overflow: 'hidden' }}>
            {React.cloneElement(mediaBlock, { style: { height: '100%' } })}
          </div>
        )}

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
          {insightBlock && (
            <div style={{ flex: `${layout.insightWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
              {React.cloneElement(insightBlock, { style: { height: '100%' } })}
            </div>
          )}
          <div style={{ flex: `${layout.textWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
            {React.cloneElement(userTextBlock, { style: { height: '100%' } })}
          </div>
          {(metaBlock || momentumBlock) && (
            <div style={{ display: 'flex', gap, flexShrink: 0, minHeight: 0, overflow: 'hidden' }}>
              {momentumBlock && (
                <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                  {React.cloneElement(momentumBlock, { style: { height: '100%' } })}
                </div>
              )}
              {metaBlock && (
                <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                  {React.cloneElement(metaBlock, { style: { height: '100%' } })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── BACKGROUND LAYOUT ──
  // Media is atmospheric backdrop. Text panels dominate foreground.
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
      {insightBlock && (
        <div style={{ flex: `${layout.insightWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
          {React.cloneElement(insightBlock, { style: { height: '100%' } })}
        </div>
      )}
      <div style={{ flex: `${layout.textWeight} 1 0`, minHeight: 0, overflow: 'hidden' }}>
        {React.cloneElement(userTextBlock, { style: { height: '100%' } })}
      </div>

      {(metaBlock || momentumBlock || (hasMedia && imageStyle === 'background_image')) && (
        <div style={{ display: 'flex', gap, flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}>
          {hasMedia && imageStyle === 'background_image' && mediaBlock && (
            <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden', maxHeight: 80 }}>
              {React.cloneElement(mediaBlock, { style: { height: '100%' } })}
            </div>
          )}
          {(metaBlock || momentumBlock) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap, flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
              {momentumBlock && React.cloneElement(momentumBlock, { style: { height: '100%' } })}
              {metaBlock && React.cloneElement(metaBlock, { style: { height: '100%' } })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Canvas background with subtle texture ──
  const canvasBg = (
    <div className="absolute inset-0" style={{ background: theme.bgGradient }}>
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 20%, hsla(43,74%,52%,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base background */}
      {canvasBg}

      {/* Atmospheric background image for background mode */}
      {hasMedia && imageStyle === 'background_image' && (
        <AtmosphericBackground url={data.imageUrl!} opacity={layout.backgroundOverlay} />
      )}

      {/* Main layout container */}
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

        {/* Brand footer */}
        {privacy.includeFooter && (
          <BrandPanel theme={theme} compact={layout.compactBrand} />
        )}
      </div>
    </div>
  );
}

// Need React for cloneElement
import React from 'react';
