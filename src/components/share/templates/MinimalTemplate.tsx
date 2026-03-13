import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, SplitImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MinimalTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp }: ShareTemplateProps) {
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
      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className={cn('relative flex flex-col justify-center items-center text-center', isSplit ? 'flex-1 min-w-0' : 'flex-1', animate && 'share-hero-fade')}
        style={{ padding: '32px 24px', gap: 20, overflow: 'hidden' }}>
        {/* Quote marks */}
        <div className="flex-shrink-0" style={{ fontSize: 40, lineHeight: 1, color: t.accentHex, opacity: 0.3, fontFamily: 'serif' }}>"</div>
        
        <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.375rem)', fontWeight: 600,
          fontFamily: '"Playfair Display", serif', lineHeight: 1.4, letterSpacing: '-0.01em', maxWidth: '90%',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
          {data.subtitle || data.title}
        </h2>

        {aiInsight && (
          <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5, maxWidth: '80%', fontStyle: 'italic',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {aiInsight}
          </p>
        )}

        <div className="flex-shrink-0" style={{ width: 32, height: 1, background: t.accentHex, opacity: 0.3 }} />

        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <p className={t.accent} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          <PostedFromBadge footerHex={t.footerHex} />
        </div>
      </div>
    </div>
  );
}
