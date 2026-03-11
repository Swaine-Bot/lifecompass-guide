import { cn } from '@/lib/utils';
import { applyPrivacy } from '@/services/shareService';
import { HeroImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function ReflectionTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && (layout === 'hero_image' || layout === 'split_image'); // Reflection maps split→hero

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden select-none"
      style={{ background: t.bgGradient }}>

      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}

      {/* Subtle gradient orb */}
      {!isBackground && (
        <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none opacity-[0.06]"
          style={{ background: `radial-gradient(ellipse at 30% 80%, ${t.accentHex}, transparent 60%)` }} />
      )}

      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className="relative flex-1 flex flex-col justify-between" style={{ padding: '32px 28px' }}>
        {/* Top identifier */}
        <div>
          <div className="flex items-center gap-2">
            <div style={{ width: 3, height: 16, borderRadius: 2, background: t.accentHex }} />
            <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              {data.identityLabel || 'Reflection'}
            </span>
          </div>
        </div>

        {/* Main reflection content */}
        <div className={cn('flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: 24 }}>
          <div style={{ fontSize: 56, lineHeight: 0.6, color: t.accentHex, opacity: 0.2, fontFamily: '"Playfair Display", serif' }}>"</div>
          
          <p className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.375rem)', fontWeight: 500,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.5, fontStyle: 'italic' }}>
            {data.subtitle || data.title}
          </p>

          {aiInsight && (
            <div style={{ paddingLeft: 16, borderLeft: `2px solid ${t.accentHex}40` }}>
              <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                {aiInsight}
              </p>
            </div>
          )}

          {data.title !== data.subtitle && data.subtitle && (
            <p className={t.accent} style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {data.title}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 14 }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
        </div>
      </div>

      <PostedFromBadge footerHex={t.footerHex} />
    </div>
  );
}
