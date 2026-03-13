import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, BrandLogoMark, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function StoryTemplate({ data, theme: t, privacy: rawPrivacy, phrase, userName, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

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

      {/* Large accent gradient splash */}
      {!isBackground && (
        <div className="absolute top-0 left-0 w-full h-1/3 pointer-events-none opacity-[0.12]"
          style={{ background: `radial-gradient(ellipse at 20% 0%, ${t.accentHex}, transparent 70%)` }} />
      )}

      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className={cn('relative flex flex-col', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{ padding: '24px 24px 20px' }}>

        {/* Top label — fixed */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{ marginBottom: 12 }}>
          <div className="flex items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)' }}>LS</span>
          </div>
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* Hero content — flexible */}
        <div className={cn('flex-1 min-h-0 flex flex-col justify-center', animate && 'share-hero-fade')}
          style={{ gap: 12 }}>
          {displayValue && (
            <div className="flex-shrink-0" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', fontWeight: 700, color: t.accentHex,
              fontFamily: '"Playfair Display", serif', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {displayValue}
            </div>
          )}
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3.2vw, 1.375rem)', fontWeight: 700,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.25, letterSpacing: '-0.01em',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {data.subtitle}
            </p>
          )}
          {data.statLabel && (
            <p className={t.textMuted} style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {data.statLabel}
            </p>
          )}
        </div>

        {/* AI Insight pull-quote — fixed */}
        {aiInsight && (
          <div className="flex-shrink-0" style={{ padding: '10px 0 10px 14px', borderLeft: `3px solid ${t.accentHex}`, marginTop: 8 }}>
            <p className={t.textSecondary} style={{ fontSize: '0.6875rem', fontStyle: 'italic', lineHeight: 1.45,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                  <span key={i} style={{ fontSize: 9, color: t.accentHex, opacity: 0.7 }}>
                    🔗 {link.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Footer — fixed, anchored */}
        <div className="flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10, marginTop: 'auto' }}>
          <div>
            <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {phrase}
            </p>
            {privacy.includeName && userName && (
              <p className={t.textMuted} style={{ fontSize: 10, marginTop: 3 }}>{userName}</p>
            )}
          </div>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
