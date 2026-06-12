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
    data, includeImage, imageLayout: imageLayoutProp, showImageCount,
  });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div
      className={cn('relative overflow-hidden h-full w-full select-none', isSplit ? 'flex flex-row' : 'flex flex-col')}
      style={{ background: t.bgGradient }}
    >
      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      {!isBackground && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(${t.dotPattern} 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px',
        }} />
      )}

      {/* CONTENT COLUMN — padded inside safe zones */}
      <div
        className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
        }}
      >
        {/* HEADER REGION */}
        <div className="flex items-center justify-between flex-shrink-0" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogoMark size={26} />
            {privacy.includeName && userName && (
              <span className={cn('font-medium', t.textSecondary)} style={{ fontSize: 11, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{userName}</span>
            )}
          </div>
          <span className={cn(t.pillBg, t.pillBorder, t.accent)}
            style={{
              fontSize: tokens.typography.pillSize, fontWeight: Number(tokens.typography.pillWeight),
              letterSpacing: tokens.typography.pillLetterSpacing, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: tokens.radius.pill, borderWidth: 1, borderStyle: 'solid',
            }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* MEDIA REGION — Hero */}
        {isHero && (
          <HeroImage url={url} imageCount={imageCount} showCount={showCount}
            onError={() => setImgFailed(true)} heroRatio={preset.heroImageRatio} />
        )}

        {/* TEXT REGION — flex-1 to fill remaining space */}
        <div className={cn('flex-1 min-h-0 flex flex-col justify-center overflow-hidden', animate && 'share-hero-fade')}
          style={{ gap: 10, paddingTop: 10, paddingBottom: 6 }}>
          {displayValue && (
            <div className="flex-shrink-0">
              <div style={{
                fontSize: tokens.typography.heroSize, fontWeight: 700,
                letterSpacing: '-0.02em', lineHeight: 1.14,
                color: t.headlineHex, fontFamily: '"Playfair Display", serif',
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

          <h2 className={t.textPrimary} style={{
            ...getClampStyle(3, 1.35),
            fontSize: 'clamp(0.9375rem, 2.8vw, 1.25rem)',
            fontWeight: 600, fontFamily: '"Playfair Display", serif',
          }}>
            {data.title}
          </h2>

          {data.subtitle && (
            <p className={t.textSecondary} style={{
              ...getClampStyle(4, 1.5),
              fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)',
              maxWidth: '92%', margin: '0 auto',
            }}>
              {data.subtitle}
            </p>
          )}
        </div>

        {/* INSIGHT REGION */}
        {aiInsight && (
          <div className="flex-shrink-0" style={{ paddingTop: 8, paddingBottom: 6, borderTop: '1px solid hsla(0,0%,100%,0.06)' }}>
            <p className={t.textSecondary} style={{
              ...getClampStyle(3, 1.45),
              fontSize: 'clamp(0.625rem, 1.8vw, 0.75rem)',
              fontStyle: 'italic', textAlign: 'center',
            }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                  <span key={i} style={{ fontSize: 9, color: t.accentHex, opacity: 0.7 }}>🔗 {link.label}</span>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* FOOTER REGION — always visible */}
        <TemplateFooter
          phrase={phrase} accentHex={t.accentHex} footerHex={t.footerHex}
          footerMinHeight={safeArea.footerMinHeight} compact={isSplit}
        />
      </div>
    </div>
  );
}
