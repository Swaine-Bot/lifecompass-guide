import { cn } from '@/lib/utils';
import { getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, TemplateFooter, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function ReflectionTemplate({ data, theme: t, format, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const preset = getRenderPreset(format);
  const { safeArea } = preset;
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({
    data,
    includeImage,
    imageLayout: imageLayoutProp,
    showImageCount,
  });

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
            : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
        }}>

        <div className="flex-shrink-0" style={{ marginBottom: 10 }}>
          <div className="flex items-center gap-2 min-w-0">
            <div style={{ width: 3, height: 14, borderRadius: 2, background: t.accentHex }} />
            <span className={cn('truncate', t.textMuted)} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              {data.identityLabel || 'Reflection'}
            </span>
          </div>
        </div>

        <div className={cn('flex-1 min-h-0 flex flex-col justify-center overflow-hidden', animate && 'share-hero-fade')}
          style={{ gap: 10 }}>
          <div className="flex-shrink-0" style={{ fontSize: 32, lineHeight: 0.8, color: t.accentHex, opacity: 0.2, fontFamily: '"Playfair Display", serif' }}>
            "
          </div>

          <p className={t.textPrimary} style={{
            ...getClampStyle(5, 1.42),
            fontSize: 'clamp(0.875rem, 2.5vw, 1.0625rem)',
            fontWeight: 500,
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
          }}>
            {data.subtitle || data.title}
          </p>

          {data.title !== data.subtitle && data.subtitle && (
            <p className={t.accent} style={{ ...getClampStyle(1, 1.3), fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — {data.title}
            </p>
          )}
        </div>

        {aiInsight && (
          <div className="flex-shrink-0" style={{ paddingLeft: 12, borderLeft: `2px solid ${t.accentHex}40`, marginTop: 6 }}>
            <p className={t.textSecondary} style={{ ...getClampStyle(3, 1.42), fontSize: '0.625rem' }}>
              {aiInsight}
            </p>
            {data.aiInsightLinks?.length ? (
              <div className="flex flex-wrap gap-1 mt-1">
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
