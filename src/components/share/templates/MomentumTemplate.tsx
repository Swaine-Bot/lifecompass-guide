import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, BrandLogoMark, TemplateFooter, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MomentumTemplate({ data, theme: t, format, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';
  const preset = getRenderPreset(format);
  const { safeArea } = preset;
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({
    data,
    includeImage,
    imageLayout: imageLayoutProp,
    showImageCount,
  });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div
      className={cn('relative overflow-hidden h-full w-full select-none', isSplit ? 'flex flex-row' : 'flex flex-col')}
      style={{
        background: t.bgGradient,
        padding: isSplit ? 0 : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
      }}
    >
      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      {!isBackground && (
        <div className="absolute top-0 right-0 w-2/3 h-2/3 pointer-events-none opacity-[0.08]"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${t.accentHex}, transparent 70%)` }} />
      )}

      {isHero && (
        <HeroImage
          url={url}
          imageCount={imageCount}
          showCount={showCount}
          onError={() => setImgFailed(true)}
          heroRatio={preset.heroImageRatio}
        />
      )}

      <div className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : undefined,
        }}>

        <div className="relative flex items-center justify-between flex-shrink-0" style={{ marginBottom: 10 }}>
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
          <BrandLogoMark size={22} />
        </div>

        <div className={cn('relative flex-1 min-h-0 flex flex-col justify-center overflow-hidden', animate && 'share-hero-fade')}
          style={{ gap: 8 }}>
          {displayValue && (
            <div className="flex-shrink-0" style={{
              fontSize: 'clamp(1.75rem, 6vw, 3rem)',
              fontWeight: 800,
              color: t.accentHex,
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
            }}>
              {displayValue}
            </div>
          )}

          <h2 className={t.textPrimary} style={{
            ...getClampStyle(3, 1.32),
            fontSize: 'clamp(0.875rem, 2.5vw, 1.0625rem)',
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

          <div className="flex-shrink-0" style={{ height: 4, borderRadius: 2, background: t.trackHex, overflow: 'hidden', marginTop: 2 }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 2, background: t.accentHex }} />
          </div>

          {displaySecondary && (
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: t.metricHex, fontFamily: '"Playfair Display", serif' }}>
                {displaySecondary}
              </span>
              {data.secondaryLabel && (
                <span className={cn('truncate', t.textSecondary)} style={{ fontSize: '0.5625rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {data.secondaryLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {aiInsight && (
          <div className="relative flex-shrink-0" style={{
            padding: '6px 10px',
            borderRadius: 8,
            background: 'hsla(0,0%,100%,0.04)',
            border: '1px solid hsla(0,0%,100%,0.06)',
            marginTop: 6,
          }}>
            <p className={t.textSecondary} style={{ ...getClampStyle(3, 1.4), fontSize: '0.5625rem' }}>
              {aiInsight}
            </p>
          </div>
        )}

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
