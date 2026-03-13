import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MomentumTemplate({ data, theme: t, privacy: rawPrivacy, phrase, userName, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isSplit = hasImage && layout === 'split_image';
  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div
      className={cn('relative overflow-hidden h-full w-full select-none', isSplit ? 'flex flex-row' : 'flex flex-col')}
      style={{ background: t.bgGradient, padding: isSplit ? 0 : '24px' }}
    >
      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      {!isBackground && (
        <div className="absolute top-0 right-0 w-2/3 h-2/3 pointer-events-none opacity-[0.08]"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${t.accentHex}, transparent 70%)` }} />
      )}

      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className={cn('relative flex flex-col', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{ padding: isSplit ? '24px' : undefined }}>

        {/* Top — fixed */}
        <div className="relative flex items-center justify-between flex-shrink-0" style={{ marginBottom: 12 }}>
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
          <div className="flex items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)' }}>LS</span>
          </div>
        </div>

        {/* Center — flexible */}
        <div className={cn('relative flex-1 min-h-0 flex flex-col justify-center', animate && 'share-hero-fade')}
          style={{ gap: 10 }}>
          {displayValue && (
            <div className="flex-shrink-0" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', fontWeight: 800, color: t.accentHex,
              fontFamily: '"Playfair Display", serif', lineHeight: 0.95, letterSpacing: '-0.04em' }}>
              {displayValue}
            </div>
          )}
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(0.9375rem, 2.8vw, 1.125rem)', fontWeight: 600,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.6875rem', lineHeight: 1.45,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {data.subtitle}
            </p>
          )}

          {/* Progress bar */}
          <div className="flex-shrink-0" style={{ height: 4, borderRadius: 2, background: t.trackHex, overflow: 'hidden', marginTop: 2 }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 2, background: t.accentHex }} />
          </div>

          {displaySecondary && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: t.metricHex, fontFamily: '"Playfair Display", serif' }}>
                {displaySecondary}
              </span>
              {data.secondaryLabel && (
                <span className={t.textSecondary} style={{ fontSize: '0.625rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {data.secondaryLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* AI Insight — fixed */}
        {aiInsight && (
          <div className="relative flex-shrink-0" style={{ padding: '8px 10px', borderRadius: 8,
            background: 'hsla(0,0%,100%,0.04)', border: '1px solid hsla(0,0%,100%,0.06)', marginTop: 8 }}>
            <p className={t.textSecondary} style={{ fontSize: '0.625rem', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {aiInsight}
            </p>
          </div>
        )}

        {/* Footer — fixed, anchored */}
        <div className="relative flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10, marginTop: 'auto' }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
