import React from 'react';
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
import type { BentoBaseVariant } from './layoutEngine';

interface AdaptiveBentoTemplateProps extends ShareTemplateProps {
  baseVariant: BentoBaseVariant;
}

/**
 * Universal share card composer that dynamically adapts to any combination of:
 * - Template variant (hero, split, reflection, minimal)
 * - Image layout (hero_image, split_image, background_image, none)
 * - Format (story, feed, square, linkedin, tiktok)
 * - Content presence (media, insight, stats, subtitle)
 *
 * Every element gets its own clean box panel. All text auto-sizes via ResizeObserver.
 * Media wraps tightly — no dead space.
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
  const imgLayout = hasMedia ? (imageLayout || 'hero_image') : 'none';
  const hasInsight = !!aiInsight?.trim();
  const hasStats = !!data.statValue;
  const hasSub = !!data.subtitle;
  const showNumbers = privacy.includeExactNumbers;

  const isStory = format === 'story' || format === 'tiktok';
  const isSquare = format === 'square';

  // Dynamic spacing based on format
  const gap = isStory ? 6 : isSquare ? 4 : 5;
  const pad = isStory ? '20px 14px 32px' : isSquare ? '12px 10px 14px' : '14px 12px 18px';

  // Content-aware font scaling — fewer items = bigger text
  const contentPieces = [hasMedia, hasInsight, hasStats, hasSub].filter(Boolean).length;
  const titleMaxSize = contentPieces >= 3 ? (isSquare ? 14 : 16) : (isSquare ? 18 : 22);
  const subMaxSize = contentPieces >= 3 ? 10 : 12;
  const insightMaxSize = contentPieces >= 3 ? 12 : 15;

  // Media flex ratio — hero should dominate, split handled separately
  const mediaRatio = baseVariant === 'hero'
    ? (contentPieces >= 3 ? 0.40 : contentPieces >= 2 ? 0.50 : 0.60)
    : (contentPieces >= 3 ? 0.25 : contentPieces >= 2 ? 0.32 : 0.42);

  // ── Build panel blocks ──

  const mediaBlock = hasMedia ? (
    <MediaPanel
      url={data.imageUrl}
      urls={data.imageUrls}
      showCount={showImageCount}
      imagePosition={data.imagePosition}
    />
  ) : null;

  const insightBlock = hasInsight ? (
    <InsightPanel
      insight={aiInsight!}
      links={data.aiInsightLinks}
      theme={theme}
      fontSize={insightMaxSize}
    />
  ) : null;

  const textBlock = (
    <UserTextPanel
      title={data.title}
      subtitle={data.subtitle}
      theme={theme}
      maxTitleSize={titleMaxSize}
      maxSubtitleSize={subMaxSize}
    />
  );

  const metaBlock = (
    <MetaPanel
      cardType={data.cardType}
      timeAnchor={privacy.includeDateTime ? data.timeAnchor : undefined}
      domain={data.domain}
      theme={theme}
    />
  );

  const momentumBlock = hasStats ? (
    <MomentumPanel
      statValue={data.statValue}
      statLabel={data.statLabel}
      secondaryValue={data.secondaryValue}
      secondaryLabel={data.secondaryLabel}
      phrase={phrase}
      theme={theme}
      showNumbers={showNumbers}
      compact={contentPieces >= 3}
    />
  ) : null;

  const brandBlock = privacy.includeFooter ? (
    <BrandPanel theme={theme} compact={isSquare || contentPieces >= 3} />
  ) : null;

  // ── Layout strategies ──
  // Each fills the card with flex panels that have explicit flex sizing
  // so auto-sizer can measure against real container heights.

  const renderHeroLayout = () => (
    <>
      {/* Media at top — hero dominates the card */}
      {mediaBlock && imgLayout === 'hero_image' && (
        <div style={{ flex: `0 0 ${Math.round(mediaRatio * 100)}%`, minHeight: 120 }}>
          {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Insight fills generous space */}
      {insightBlock && (
        <div style={{ flex: hasStats ? '1.2 1 0' : '1.8 1 0', minHeight: 0 }}>
          {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Text panel */}
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
      </div>
      {/* Bottom row: momentum + meta side by side */}
      <div style={{ display: 'flex', gap, flexShrink: 0 }}>
        {momentumBlock && (
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            {React.cloneElement(momentumBlock, { style: { height: '100%' } })}
          </div>
        )}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {React.cloneElement(metaBlock, { style: { height: '100%' } })}
        </div>
      </div>
    </>
  );

  const renderSplitLayout = () => {
    // Split: true 50/50 vertical split — media takes left half
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap, flex: '1 1 0', minHeight: 0 }}>
        {/* Media side — 50% width */}
        {mediaBlock && (
          <div style={{ flex: '0 0 50%', minHeight: 0, minWidth: 0 }}>
            {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
          </div>
        )}
        {/* Content side — 50% width */}
        <div style={{ display: 'flex', flexDirection: 'column', gap, flex: '1 1 0', minHeight: 0, minWidth: 0 }}>
          {insightBlock && (
            <div style={{ flex: '1.2 1 0', minHeight: 0 }}>
              {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
            </div>
          )}
          <div style={{ flex: '1 1 0', minHeight: 0 }}>
            {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
          </div>
          <div style={{ display: 'flex', gap, flexShrink: 0 }}>
            {momentumBlock && (
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                {React.cloneElement(momentumBlock, { style: { height: '100%' } })}
              </div>
            )}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              {React.cloneElement(metaBlock, { style: { height: '100%' } })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReflectionLayout = () => (
    <>
      {/* Insight or text dominates */}
      {insightBlock ? (
        <div style={{ flex: '2 1 0', minHeight: 0 }}>
          {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      ) : (
        <div style={{ flex: '2 1 0', minHeight: 0 }}>
          {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Media + meta row */}
      <div style={{ display: 'flex', gap, flexShrink: 0 }}>
        {mediaBlock && (
          <div style={{ flex: '1 1 0', minWidth: 0, maxHeight: 80 }}>
            {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
          </div>
        )}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {React.cloneElement(metaBlock, { style: { height: '100%' } })}
        </div>
      </div>
      {/* Text block if insight already shown */}
      {insightBlock && (
        <div style={{ flex: '1 1 0', minHeight: 0 }}>
          {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Momentum */}
      {momentumBlock && (
        <div style={{ flexShrink: 0 }}>
          {momentumBlock}
        </div>
      )}
    </>
  );

  const renderMinimalLayout = () => (
    <>
      {mediaBlock && (
        <div style={{ flexShrink: 0, maxHeight: '32%' }}>
          {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {insightBlock && (
        <div style={{ flex: '1.2 1 0', minHeight: 0 }}>
          {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
      </div>
      {momentumBlock && (
        <div style={{ flexShrink: 0 }}>
          {momentumBlock}
        </div>
      )}
    </>
  );

  // Background image: atmospheric blur behind all content
  const isBackgroundMode = imgLayout === 'background_image' && hasMedia;

  // Choose layout
  const chooseLayout = () => {
    if (imgLayout === 'split_image') return renderSplitLayout();
    if (baseVariant === 'reflection') return renderReflectionLayout();
    if (baseVariant === 'minimal') return renderMinimalLayout();
    return renderHeroLayout();
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0" style={{ background: theme.bgGradient }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 20%, hsla(43,74%,52%,0.03) 0%, transparent 60%)',
        }} />
      </div>

      {/* Atmospheric background image — image is the main event */}
      {isBackgroundMode && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src={data.imageUrl!}
            alt=""
            crossOrigin="anonymous"
            className="w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: `${data.imagePosition?.x ?? 50}% ${data.imagePosition?.y ?? 50}%`,
              filter: 'blur(4px) brightness(0.6) saturate(1.3)',
              transform: 'scale(1.06)',
            }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, hsla(220,30%,3%,0.2) 0%, hsla(220,30%,3%,0.3) 50%, hsla(220,30%,3%,0.45) 100%)',
          }} />
        </div>
      )}

      {/* Main layout container */}
      <div
        className="absolute inset-0"
        style={{
          display: 'flex', flexDirection: 'column',
          padding: pad, gap, overflow: 'hidden',
        }}
      >
        {chooseLayout()}
        {brandBlock}
      </div>
    </div>
  );
}
