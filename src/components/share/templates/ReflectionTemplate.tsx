import { cn } from '@/lib/utils';
import { applyPrivacy } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function ReflectionTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isBackground = hasImage && layout === 'background_image';
  const isSplit = hasImage && layout === 'split_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div className={cn('relative h-full w-full overflow-hidden select-none', isSplit ? 'flex flex-row' : 'flex flex-col')}
      style={{ background: t.bgGradient }}>

      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      {!isBackground && !isSplit && (
        <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none opacity-[0.06]"
          style={{ background: `radial-gradient(ellipse at 30% 80%, ${t.accentHex}, transparent 60%)` }} />
      )}

      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className={cn('relative flex flex-col', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{ padding: '24px 24px 20px' }}>

        {/* Top identifier — fixed */}
        <div className="flex-shrink-0" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 3, height: 16, borderRadius: 2, background: t.accentHex }} />
            <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              {data.identityLabel || 'Reflection'}
            </span>
          </div>
        </div>

        {/* Main reflection content — flexible */}
        <div className={cn('flex-1 min-h-0 flex flex-col justify-center', animate && 'share-hero-fade')}
          style={{ gap: 12 }}>
          <div className="flex-shrink-0" style={{ fontSize: 40, lineHeight: 0.6, color: t.accentHex, opacity: 0.2, fontFamily: '"Playfair Display", serif' }}>"</div>

          <p className={t.textPrimary} style={{ fontSize: 'clamp(0.9375rem, 2.8vw, 1.125rem)', fontWeight: 500,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.45, fontStyle: 'italic',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {data.subtitle || data.title}
          </p>

          {data.title !== data.subtitle && data.subtitle && (
            <p className={cn('flex-shrink-0', t.accent)} style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {data.title}
            </p>
          )}
        </div>

        {/* AI insight — fixed */}
        {aiInsight && (
          <div className="flex-shrink-0" style={{ paddingLeft: 14, borderLeft: `2px solid ${t.accentHex}40`, marginTop: 8 }}>
            <p className={t.textSecondary} style={{ fontSize: '0.6875rem', lineHeight: 1.45,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                  <span key={i} style={{ fontSize: 8, color: t.accentHex, opacity: 0.7 }}>
                    🔗 {link.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Footer — fixed, anchored */}
        <div className="flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10, marginTop: 'auto' }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
