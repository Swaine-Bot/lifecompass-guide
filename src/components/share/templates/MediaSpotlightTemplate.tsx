import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, PlayOverlay, MediaTypeBadge, detectMediaType, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MediaSpotlightTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const { hasImage, url, layout, imageCount, showCount, setImgFailed, mediaType } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && !isSplit && !isBackground;

  return (
    <div className={cn('relative flex h-full w-full overflow-hidden select-none', isSplit ? 'flex-row' : 'flex-col')}
      style={{ background: t.bgGradient }}>

      {/* Background mode */}
      {hasImage && isBackground && (
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center', display: 'block',
              filter: 'blur(14px) brightness(0.28) saturate(1.3)', transform: 'scale(1.15)' }}
            crossOrigin="anonymous" />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, hsla(0,0%,0%,0.5) 0%, hsla(0,0%,0%,0.35) 50%, hsla(0,0%,0%,0.6) 100%)' }} />
        </div>
      )}

      {/* Split mode */}
      {hasImage && isSplit && (
        <div className="relative overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ width: '50%', minHeight: 0, background: 'hsla(0,0%,0%,0.15)' }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'contain', display: 'block' }}
            crossOrigin="anonymous" />
          {mediaType !== 'image' && <PlayOverlay mediaType={mediaType} size="sm" />}
          {mediaType !== 'image' && <MediaTypeBadge mediaType={mediaType} />}
          {showCount && imageCount > 1 && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full z-10"
              style={{ background: 'hsla(0,0%,0%,0.6)', color: 'hsla(0,0%,100%,0.9)', fontSize: 10, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              +{imageCount - 1} more
            </div>
          )}
        </div>
      )}

      {/* Hero mode — capped at 50% */}
      {hasImage && isHero && (
        <div className="relative flex items-center justify-center flex-shrink-0"
          style={{ flex: '0 0 auto', maxHeight: '50%', overflow: 'hidden', minHeight: 0, background: 'hsla(0,0%,0%,0.15)' }}>
          <img src={url} alt="" onError={() => setImgFailed(true)}
            className="w-full h-full"
            style={{ objectFit: 'contain', display: 'block', maxHeight: '100%' }}
            crossOrigin="anonymous" />
          {mediaType !== 'image' && <PlayOverlay mediaType={mediaType} size="lg" />}
          {mediaType !== 'image' && <MediaTypeBadge mediaType={mediaType} />}
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
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ flex: '0 0 40%', background: 'hsla(0,0%,100%,0.03)' }}>
          {data.secondaryValue ? (
            <div className="text-center flex flex-col items-center" style={{ gap: 8 }}>
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
      <div className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1', animate && 'share-hero-fade')}
        style={{ padding: '14px 18px 14px' }}>

        {/* Text content — flexible */}
        <div style={{ gap: 5 }} className="flex flex-col flex-1 min-h-0 justify-center overflow-hidden">
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(0.8125rem, 2.2vw, 1rem)', fontWeight: 600,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.625rem', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {data.subtitle}
            </p>
          )}
          {aiInsight && (
            <p style={{ fontSize: '0.5625rem', lineHeight: 1.35, color: t.accentHex, fontStyle: 'italic', marginTop: 2,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {aiInsight}
            </p>
          )}
        </div>

        {/* Footer — fixed, anchored */}
        <div className="flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 8, marginTop: 'auto' }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', flex: '1 1 0', minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {phrase}
          </p>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
