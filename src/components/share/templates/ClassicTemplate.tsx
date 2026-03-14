import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS, getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, BrandLogoMark, TemplateFooter, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function ClassicTemplate({ data, theme: t, format, privacy: rawPrivacy, phrase, userName, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const tokens = SHARE_TOKENS;
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
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(${t.dotPattern} 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px',
        }} />
      )}

      <div
        className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : undefined,
        }}
      >
        <div className="relative flex items-center justify-between flex-shrink-0" style={{ minHeight: tokens.spacing.topBandHeight, marginBottom: 10 }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogoMark size={26} />
            {privacy.includeName && userName && (
              <span className={cn('font-medium truncate', t.textSecondary)} style={{ fontSize: 11 }}>{userName}</span>
            )}
          </div>
          <span className={cn(t.pillBg, t.pillBorder, t.accent)}
            style={{
              fontSize: tokens.typography.pillSize,
              fontWeight: Number(tokens.typography.pillWeight),
              letterSpacing: tokens.typography.pillLetterSpacing,
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: tokens.radius.pill,
              borderWidth: 1,
              borderStyle: 'solid',
            }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {isHero && (
          <HeroImage
            url={url}
            imageCount={imageCount}
            showCount={showCount}
            onError={() => setImgFailed(true)}
            heroRatio={preset.heroImageRatio}
          />
        )}

        <div className={cn('relative flex-1 min-h-0 flex flex-col justify-center text-center overflow-hidden', animate && 'share-hero-fade')}
          style={{ gap: 10, paddingTop: 8, paddingBottom: 8 }}>
          {displayValue && (
            <div className="flex-shrink-0">
              <div style={{
                fontSize: tokens.typography.heroSize,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.14,
                color: t.headlineHex,
                fontFamily: '"Playfair Display", serif',
              }}>
                {displayValue}
              </div>
              {data.statLabel && (
                <p className={t.textSecondary} style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
                  {data.statLabel}
                </p>
              )}
            </div>
          )}

          <h2
            className={t.textPrimary}
            style={{
              ...getClampStyle(3, 1.32),
              fontSize: 'clamp(0.875rem, 2.4vw, 1.125rem)',
              fontWeight: 600,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            {data.title}
          </h2>

          {data.subtitle && (
            <p
              className={t.textSecondary}
              style={{
                ...getClampStyle(3, 1.48),
                fontSize: '0.6875rem',
                maxWidth: '88%',
                margin: '0 auto',
              }}
            >
              {data.subtitle}
            </p>
          )}
        </div>

        {aiInsight && (
          <div className="relative flex-shrink-0" style={{ paddingTop: 8, paddingBottom: 6, borderTop: '1px solid hsla(0,0%,100%,0.06)' }}>
            <p className={t.textSecondary} style={{ ...getClampStyle(3, 1.42), fontSize: '0.625rem', fontStyle: 'italic', textAlign: 'center' }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                  <span key={i} style={{ fontSize: 8, color: t.accentHex, opacity: 0.7 }}>
                    🔗 {link.label}
                  </span>
                ))}
              </div>
            ) : null}
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
