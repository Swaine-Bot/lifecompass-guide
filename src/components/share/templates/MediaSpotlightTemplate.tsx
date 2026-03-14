import { cn } from '@/lib/utils';
import { getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, TemplateFooter, PlayOverlay, MediaTypeBadge, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MediaSpotlightTemplate({ data, theme: t, format, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const preset = getRenderPreset(format);
  const { safeArea } = preset;
  const { hasImage, url, layout, imageCount, showCount, setImgFailed, mediaType } = useTemplateImage({
    data,
    includeImage,
    imageLayout: imageLayoutProp,
    showImageCount,
  });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && !isSplit && !isBackground;

  return (
    <div className={cn('relative flex h-full w-full overflow-hidden select-none', isSplit ? 'flex-row' : 'flex-col')}
      style={{ background: t.bgGradient }}>

      {hasImage && isBackground && (
        <BackgroundImage url={url} onError={() => setImgFailed(true)} />
      )}

      {hasImage && isSplit && (
        <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />
      )}

      {hasImage && isHero && (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{
          flex: `0 0 ${Math.round(preset.heroImageRatio * 100)}%`,
          maxHeight: `${Math.round(preset.heroImageRatio * 100)}%`,
          overflow: 'hidden',
          minHeight: 72,
          background: 'hsla(0,0%,0%,0.15)',
        }}>
          <img src={url} alt="" onError={() => setImgFailed(true)} className="w-full h-full"
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

      {!hasImage && (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ flex: '0 0 42%', background: 'hsla(0,0%,100%,0.03)' }}>
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

      <div className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1', animate && 'share-hero-fade')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
        }}>

        <div style={{ gap: 6 }} className="flex flex-col flex-1 min-h-0 justify-center overflow-hidden">
          <h2 className={t.textPrimary} style={{
            ...getClampStyle(3, 1.32),
            fontSize: 'clamp(0.8125rem, 2.2vw, 1rem)',
            fontWeight: 600,
            fontFamily: '"Playfair Display", serif',
          }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ ...getClampStyle(3, 1.42), fontSize: '0.625rem' }}>
              {data.subtitle}
            </p>
          )}
          {aiInsight && (
            <p style={{ ...getClampStyle(3, 1.38), fontSize: '0.5625rem', color: t.accentHex, fontStyle: 'italic', marginTop: 2 }}>
              {aiInsight}
            </p>
          )}
        </div>

        <TemplateFooter
          phrase={phrase}
          accentHex={t.accentHex}
          footerHex={t.footerHex}
          footerMinHeight={safeArea.footerMinHeight}
          compact={isSplit}
        />
      </div>
    </div>
  );
}
