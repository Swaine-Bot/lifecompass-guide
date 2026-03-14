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
 * Every element gets its own clean box panel. All text auto-sizes.
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

  // Dynamic sizing based on format
  const pad = isStory ? '24px 16px 36px' : isSquare ? '14px 12px 16px' : '16px 14px 20px';
  const gap = isStory ? 7 : isSquare ? 5 : 6;

  // Content-aware font scaling
  const contentPieces = [hasMedia, hasInsight, hasStats, hasSub].filter(Boolean).length;
  const titleMaxSize = contentPieces >= 3 ? (isSquare ? 16 : 18) : (isSquare ? 20 : 24);
  const subMaxSize = contentPieces >= 3 ? 11 : 13;
  const insightMaxSize = contentPieces >= 3 ? 13 : 16;

  // Determine media flex ratio — more content = less media space
  const mediaRatio = contentPieces >= 3 ? 0.28 : contentPieces >= 2 ? 0.35 : 0.45;

  // ── Build panel blocks ──

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
  // Each returns a flex column of panels that fills the card

  const renderHeroLayout = () => (
    <>
      {/* Media takes proportional space at top */}
      {mediaBlock && imgLayout === 'hero_image' && (
        <div style={{ flex: `0 0 ${Math.round(mediaRatio * 100)}%`, minHeight: 0 }}>
          {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Content fills remaining space */}
      {insightBlock && (
        <div style={{ flex: hasStats ? '1.5 1 0' : '2 1 0', minHeight: 0 }}>
          {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
      </div>
      {/* Bottom row: momentum + meta side by side */}
      {(momentumBlock || true) && (
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
      )}
    </>
  );

  const renderSplitLayout = () => {
    const isRow = !isStory; // horizontal split on non-story formats
    return (
      <div style={{ display: 'flex', flexDirection: isRow ? 'row' : 'column', gap, flex: '1 1 0', minHeight: 0 }}>
        {/* Media side */}
        {mediaBlock && (
          <div style={{ flex: `0 0 ${isRow ? '42%' : `${Math.round(mediaRatio * 100)}%`}`, minHeight: 0, minWidth: 0 }}>
            {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
          </div>
        )}
        {/* Content side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap, flex: '1 1 0', minHeight: 0, minWidth: 0 }}>
          {insightBlock && (
            <div style={{ flex: '1.5 1 0', minHeight: 0 }}>
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
      {/* Insight-first: big insight panel dominates */}
      {insightBlock ? (
        <div style={{ flex: '2.5 1 0', minHeight: 0 }}>
          {React.cloneElement(insightBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      ) : (
        <div style={{ flex: '2 1 0', minHeight: 0 }}>
          {React.cloneElement(textBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {/* Media + meta row */}
      {(mediaBlock || true) && (
        <div style={{ display: 'flex', gap, flexShrink: 0 }}>
          {mediaBlock && (
            <div style={{ flex: '1 1 0', minWidth: 0, maxHeight: 90 }}>
              {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
            </div>
          )}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            {React.cloneElement(metaBlock, { style: { height: '100%' } })}
          </div>
        </div>
      )}
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
        <div style={{ flexShrink: 0, maxHeight: '35%' }}>
          {React.cloneElement(mediaBlock, { style: { width: '100%', height: '100%' } })}
        </div>
      )}
      {insightBlock && (
        <div style={{ flex: '1.5 1 0', minHeight: 0 }}>
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
    // For background_image, use the same layout but skip the media panel in the layout
    // (it's rendered as atmospheric behind)
    if (imgLayout === 'split_image') return renderSplitLayout();
    if (baseVariant === 'reflection') return renderReflectionLayout();
    if (baseVariant === 'minimal') return renderMinimalLayout();
    // hero and default
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

      {/* Atmospheric background image */}
      {isBackgroundMode && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src={data.imageUrl!}
            alt=""
            crossOrigin="anonymous"
            className="w-full h-full"
            style={{
              objectFit: 'cover', filter: 'blur(20px) brightness(0.4) saturate(1.2)',
              transform: 'scale(1.15)',
            }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, hsla(220,30%,3%,0.4) 0%, hsla(220,30%,3%,0.65) 50%, hsla(220,30%,3%,0.8) 100%)',
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
