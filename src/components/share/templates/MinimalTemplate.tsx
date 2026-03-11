import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import { HeroImage, BackgroundImage, PostedFromBadge, useTemplateImage } from './SharedImageLayer';
import type { ShareTemplateProps } from './types';

export function MinimalTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight, includeImage, imageLayout: imageLayoutProp }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const { hasImage, url, layout, imageCount, showCount, setImgFailed } = useTemplateImage({ data, includeImage, imageLayout: imageLayoutProp });

  const isBackground = hasImage && layout === 'background_image';
  const isHero = hasImage && (layout === 'hero_image' || layout === 'split_image'); // Minimal maps split→hero

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden select-none"
      style={{ background: t.bgGradient }}>

      {isBackground && <BackgroundImage url={url} onError={() => setImgFailed(true)} />}
      {isHero && <HeroImage url={url} imageCount={imageCount} showCount={showCount} onError={() => setImgFailed(true)} />}

      <div className={cn('relative flex-1 flex flex-col justify-center items-center text-center', animate && 'share-hero-fade')}
        style={{ padding: '40px 28px', gap: 24 }}>
        {/* Quote marks */}
        <div style={{ fontSize: 48, lineHeight: 1, color: t.accentHex, opacity: 0.3, fontFamily: 'serif' }}>"</div>
        
        <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1.125rem, 3.5vw, 1.5rem)', fontWeight: 600,
          fontFamily: '"Playfair Display", serif', lineHeight: 1.4, letterSpacing: '-0.01em', maxWidth: '90%' }}>
          {data.subtitle || data.title}
        </h2>

        {aiInsight && (
          <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5, maxWidth: '80%', fontStyle: 'italic' }}>
            {aiInsight}
          </p>
        )}

        <div style={{ width: 32, height: 1, background: t.accentHex, opacity: 0.3 }} />

        <p className={t.accent} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {phrase}
        </p>
      </div>

      <PostedFromBadge footerHex={t.footerHex} />
    </div>
  );
}
