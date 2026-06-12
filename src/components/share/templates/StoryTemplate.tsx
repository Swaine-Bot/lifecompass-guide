import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, BrandLogoMark, TemplateFooter, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function StoryTemplate({ data, theme: t, format, privacy: rawPrivacy, phrase, userName, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
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
        <div className="absolute top-0 left-0 w-full h-1/3 pointer-events-none opacity-[0.12]"
          style={{ background: `radial-gradient(ellipse at 20% 0%, ${t.accentHex}, transparent 70%)` }} />
      )}

      {/* MEDIA REGION — Hero at top */}
      {isHero && (
        <HeroImage url={url} imageCount={imageCount} showCount={showCount}
          onError={() => setImgFailed(true)} heroRatio={preset.heroImageRatio} />
      )}

      {/* CONTENT COLUMN */}
      <div
        className={cn('relative flex flex-col overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
        }}
      >
        {/* HEADER */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0" style={{ marginBottom: 12 }}>
          <BrandLogoMark size={22} />
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* TEXT REGION */}
        <div className={cn('flex-1 min-h-0 flex flex-col justify-center overflow-hidden', animate && 'share-hero-fade')}
          style={{ gap: 10 }}>
          {displayValue && (
            <div className="flex-shrink-0" style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.75rem)',
              fontWeight: 700, color: t.accentHex,
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1.1, letterSpacing: '-0.03em',
            }}>
              {displayValue}
            </div>
          )}

          <h2 className={t.textPrimary} style={{
            ...getClampStyle(3, 1.35),
            fontSize: 'clamp(0.9375rem, 3vw, 1.375rem)',
            fontWeight: 700, fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.01em',
          }}>
            {data.title}
          </h2>

          {data.subtitle && (
            <p className={t.textSecondary} style={{
              ...getClampStyle(4, 1.5),
              fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)',
            }}>
              {data.subtitle}
            </p>
          )}

          {data.statLabel && (
            <p className={t.textMuted} style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.3 }}>
              {data.statLabel}
            </p>
          )}
        </div>

        {/* INSIGHT REGION */}
        {aiInsight && (
          <div className="flex-shrink-0" style={{ padding: '8px 0 8px 12px', borderLeft: `3px solid ${t.accentHex}`, marginTop: 8 }}>
            <p className={t.textSecondary} style={{
              ...getClampStyle(3, 1.45),
              fontSize: 'clamp(0.625rem, 1.8vw, 0.75rem)',
              fontStyle: 'italic',
            }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                  <span key={i} style={{ fontSize: 9, color: t.accentHex, opacity: 0.7 }}>🔗 {link.label}</span>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* FOOTER REGION */}
        <TemplateFooter
          phrase={phrase} accentHex={t.accentHex} footerHex={t.footerHex}
          footerMinHeight={safeArea.footerMinHeight} compact={isSplit}
          metaText={privacy.includeName && userName ? userName : undefined}
        />
      </div>
    </div>
  );
}
