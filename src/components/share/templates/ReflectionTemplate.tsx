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

      <div className={cn('relative flex flex-col justify-between', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{ padding: '28px 24px', overflow: 'hidden' }}>
        {/* Top identifier */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <div style={{ width: 3, height: 16, borderRadius: 2, background: t.accentHex }} />
            <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              {data.identityLabel || 'Reflection'}
            </span>
          </div>
        </div>

        {/* Main reflection content */}
        <div className={cn('flex-1 flex flex-col justify-center', animate && 'share-hero-fade')}
          style={{ gap: 16, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontSize: 48, lineHeight: 0.6, color: t.accentHex, opacity: 0.2, fontFamily: '"Playfair Display", serif' }}>"</div>
          
          <p className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 500,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.5, fontStyle: 'italic',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {data.subtitle || data.title}
          </p>

          {aiInsight && (
            <div className="flex-shrink-0" style={{ paddingLeft: 16, borderLeft: `2px solid ${t.accentHex}40` }}>
              <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {aiInsight}
              </p>
              {data.aiInsightLinks?.length ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.aiInsightLinks.slice(0, 2).map((link, i) => (
                    <span key={i} style={{ fontSize: 8, color: t.accentHex, opacity: 0.7 }}>
                      🔗 {link.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {data.title !== data.subtitle && data.subtitle && (
            <p className={t.accent} style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {data.title}
            </p>
          )}
        </div>

        {/* Footer with badge in flow */}
        <div className="flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 14 }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
