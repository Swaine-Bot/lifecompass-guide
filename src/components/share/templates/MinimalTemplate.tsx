import { cn } from '@/lib/utils';
import { getRenderPreset } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, TemplateFooter, useTemplateImage, getClampStyle } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MinimalTemplate({ data, theme: t, format, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp, showImageCount }: ShareTemplateProps) {
  const preset = getRenderPreset(format);
  const { safeArea } = preset;
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({
    data, includeImage, imageLayout: imageLayoutProp, showImageCount,
  });

  const isBackground = hasImage && layout === 'background_image';
  const isSplit = hasImage && layout === 'split_image';
  const isHero = hasImage && layout === 'hero_image';

  return (
    <div className={cn('relative h-full w-full overflow-hidden select-none', isSplit ? 'flex flex-row' : 'flex flex-col')}
      style={{ background: t.bgGradient }}>

      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isSplit && <SplitImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}
      {isHero && (
        <HeroImage url={url} imageCount={imageCount} showCount={showCount}
          onError={() => setImgFailed(true)} heroRatio={preset.heroImageRatio} />
      )}

      {/* CONTENT COLUMN */}
      <div className={cn('relative flex flex-col items-center text-center overflow-hidden', isSplit ? 'flex-1 min-w-0' : 'flex-1')}
        style={{
          padding: isSplit
            ? `${safeArea.top}px ${preset.splitContentPadding}px ${safeArea.bottom}px ${preset.splitContentPadding}px`
            : `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
        }}>

        {/* TEXT REGION — centered */}
        <div className={cn('flex-1 min-h-0 flex flex-col justify-center items-center', animate && 'share-hero-fade')}
          style={{ gap: 14 }}>

          <div className="flex-shrink-0" style={{ fontSize: 32, lineHeight: 1, color: t.accentHex, opacity: 0.3, fontFamily: 'serif' }}>
            "
          </div>

          <h2 className={t.textPrimary} style={{
            ...getClampStyle(6, 1.45),
            fontSize: 'clamp(0.9375rem, 2.8vw, 1.1875rem)',
            fontWeight: 600, fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.01em', maxWidth: '92%',
          }}>
            {data.subtitle || data.title}
          </h2>

          {aiInsight && (
            <p className={t.textSecondary} style={{
              ...getClampStyle(3, 1.45),
              fontSize: 'clamp(0.625rem, 1.8vw, 0.75rem)',
              maxWidth: '88%', fontStyle: 'italic',
            }}>
              {aiInsight}
            </p>
          )}

          <div className="flex-shrink-0" style={{ width: 36, height: 1, background: t.accentHex, opacity: 0.3 }} />
        </div>

        {/* FOOTER REGION */}
        <TemplateFooter
          phrase={phrase} accentHex={t.accentHex} footerHex={t.footerHex}
          footerMinHeight={safeArea.footerMinHeight} compact={isSplit}
        />
      </div>
    </div>
  );
}
