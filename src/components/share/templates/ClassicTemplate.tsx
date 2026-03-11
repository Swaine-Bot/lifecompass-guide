import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function ClassicTemplate({ data, theme: t, privacy: rawPrivacy, phrase, userName, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const tokens = SHARE_TOKENS;
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div
      className={cn('relative overflow-hidden h-full w-full select-none', isSplit ? 'flex flex-row' : 'flex flex-col justify-between')}
      style={{ background: t.bgGradient, padding: isSplit ? 0 : tokens.spacing.cardPadding }}
    >
      {/* Background image mode */}
      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}

      {/* Split image left */}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      {/* Dot texture */}
      {!isBackground && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(${t.dotPattern} 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px',
        }} />
      )}

      <div className={cn('relative flex flex-col justify-between', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{ padding: isSplit ? tokens.spacing.cardPadding : undefined }}>

        {/* Top band */}
        <div className="relative flex items-center justify-between" style={{ minHeight: tokens.spacing.topBandHeight }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
                boxShadow: '0 2px 12px -2px hsla(43,74%,52%,0.3)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
            </div>
            {privacy.includeName && userName && (
              <span className={cn('font-medium', t.textSecondary)} style={{ fontSize: 11 }}>{userName}</span>
            )}
          </div>
          <span className={cn(t.pillBg, t.pillBorder, t.accent)}
            style={{ fontSize: tokens.typography.pillSize, fontWeight: Number(tokens.typography.pillWeight),
              letterSpacing: tokens.typography.pillLetterSpacing, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: tokens.radius.pill, borderWidth: 1, borderStyle: 'solid' }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* Hero image */}
        {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

        {/* Hero content */}
        <div className={cn('relative flex-1 flex flex-col justify-center text-center', animate && 'share-hero-fade')}
          style={{ gap: tokens.spacing.sectionGap }}>
          {displayValue && (
            <div>
              <div style={{ fontSize: tokens.typography.heroSize, fontWeight: 700, letterSpacing: '-0.02em',
                lineHeight: 1.1, color: t.headlineHex, fontFamily: '"Playfair Display", serif' }}>
                {displayValue}
              </div>
              {data.statLabel && (
                <p className={t.textSecondary} style={{ fontSize: '0.75rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>{data.statLabel}</p>
              )}
            </div>
          )}
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1.125rem, 3.5vw, 1.5rem)', fontWeight: 600,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.3 }}>{data.title}</h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.8125rem', lineHeight: 1.6, maxWidth: '85%', margin: '0 auto' }}>
              {data.subtitle}
            </p>
          )}
        </div>

        {/* AI Insight footer */}
        {aiInsight && (
          <div className="relative" style={{ paddingTop: 10, paddingBottom: 6, borderTop: '1px solid hsla(0,0%,100%,0.06)' }}>
            <p className={t.textSecondary} style={{ fontSize: '0.6875rem', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center' }}>
              {aiInsight}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="relative" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 12 }}>
          <p className={t.accent} style={{ fontSize: tokens.typography.footerSize, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase' }}>{phrase}</p>
        </div>
      </div>

      {/* Posted from LifeStack — always bottom-right */}
      <PostedFromBadge footerHex={t.footerHex} />
    </div>
  );
}
