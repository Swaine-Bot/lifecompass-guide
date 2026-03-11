import { useState } from 'react';
import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import { PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MediaSpotlightTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isSplit = layout === 'split_image';
  const isBackground = layout === 'background_image';

  // Media Spotlight always shows image prominently regardless of layout mode
  return (
    <div className={cn('relative flex h-full w-full overflow-hidden select-none', isSplit ? 'flex-row' : 'flex-col')}
      style={{ background: t.bgGradient }}>

      {/* Background mode: full bleed with readable overlay */}
      {hasImage && isBackground && (
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            crossOrigin="anonymous" />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, hsla(0,0%,0%,0.3) 0%, hsla(0,0%,0%,0.15) 40%, hsla(0,0%,0%,0.7) 100%)' }} />
        </div>
      )}

      {/* Split mode: image left */}
      {hasImage && isSplit && (
        <div className="relative overflow-hidden flex-shrink-0" style={{ width: '50%', minHeight: 0 }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
          {showCount && imageCount > 1 && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full z-10"
              style={{ background: 'hsla(0,0%,0%,0.6)', color: 'hsla(0,0%,100%,0.9)', fontSize: 10, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              +{imageCount - 1} more
            </div>
          )}
        </div>
      )}

      {/* Hero mode (default): image top 55% */}
      {hasImage && !isSplit && !isBackground && (
        <div className="relative" style={{ flex: '0 0 55%', overflow: 'hidden', minHeight: 0 }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
            crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          {showCount && imageCount > 1 && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full z-10"
              style={{ background: 'hsla(0,0%,0%,0.6)', color: 'hsla(0,0%,100%,0.9)', fontSize: 10, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              +{imageCount - 1} more
            </div>
          )}
        </div>
      )}

      {/* No image fallback */}
      {!hasImage && (
        <div className="relative flex items-center justify-center" style={{ flex: '0 0 55%', background: 'hsla(0,0%,100%,0.03)' }}>
          {data.secondaryValue ? (
            <div className="text-center" style={{ gap: 8 }}>
              <p style={{ fontSize: 32, opacity: 0.6 }}>
                {data.secondaryValue.includes('🎬') ? '🎬' : data.secondaryValue.includes('🎙') ? '🎙️' : '📷'}
              </p>
              <p className={t.textMuted} style={{ fontSize: 11 }}>{data.secondaryValue}</p>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${t.accentHex}15`, border: `1px solid ${t.accentHex}30` }}>
              <span style={{ fontSize: 28, opacity: 0.5 }}>📷</span>
            </div>
          )}
        </div>
      )}

      {/* Content area */}
      <div className={cn('relative flex flex-col justify-between', isSplit ? 'flex-1 min-w-0' : 'flex-1', animate && 'share-hero-fade')}
        style={{ padding: '20px 24px' }}>
        <div style={{ gap: 8 }} className="flex flex-col">
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 600,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.3 }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {data.subtitle.slice(0, 100)}{data.subtitle.length > 100 ? '…' : ''}
            </p>
          )}
          {aiInsight && (
            <p style={{ fontSize: '0.6875rem', lineHeight: 1.4, color: t.accentHex, fontStyle: 'italic', marginTop: 4 }}>
              {aiInsight}
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10 }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
        </div>
      </div>

      <PostedFromBadge footerHex={t.footerHex} />
    </div>
  );
}
