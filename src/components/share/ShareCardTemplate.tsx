import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ShareCardData, PrivacySettings, ShareTheme, ShareFormat,
  CARD_TYPE_LABELS, THEMES, applyPrivacy, SHARE_TOKENS, ImageLayout,
} from '@/services/shareService';
import { StreakFlameModule } from './modules/StreakFlameModule';
import { ProgressRingModule } from './modules/ProgressRingModule';
import { RadarLifeDomainsModule } from './modules/RadarLifeDomainsModule';
import { MilestoneBadgeModule } from './modules/MilestoneBadgeModule';
import { MiniBarChartModule } from './modules/MiniBarChartModule';
import { MentorQuoteModule } from './modules/MentorQuoteModule';

interface ShareCardTemplateProps {
  data: ShareCardData;
  theme: ShareTheme;
  format: ShareFormat;
  privacy: PrivacySettings;
  phrase: string;
  userName?: string;
  animate?: boolean;
  includeImage?: boolean;
  imageLayoutOverride?: ImageLayout;
  showImageCount?: boolean;
}

const formatAspect: Record<ShareFormat, string> = {
  story: 'aspect-[9/16]',
  feed: 'aspect-[4/5]',
  square: 'aspect-square',
  linkedin: 'aspect-[4/5]',
  tiktok: 'aspect-[9/16]',
};

interface ModuleProps {
  accentHex: string;
  trackHex: string;
  animate?: boolean;
}

const VisualModuleMap: Record<string, React.FC<ModuleProps>> = {
  flame: StreakFlameModule,
  ring: ProgressRingModule,
  radar: RadarLifeDomainsModule,
  badge: MilestoneBadgeModule,
  chart: MiniBarChartModule,
  quote: MentorQuoteModule,
};

// ─── Image Component ────────────────────────────────────────────────
function CardImage({ url, layout, imageCount, showCount, accentHex }: {
  url: string;
  layout: ImageLayout;
  imageCount: number;
  showCount: boolean;
  accentHex: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !url) return null;

  const countBadge = showCount && imageCount > 1 && (
    <div
      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: 'hsla(0,0%,0%,0.6)',
        color: 'hsla(0,0%,100%,0.9)',
        backdropFilter: 'blur(4px)',
      }}
    >
      +{imageCount - 1} more
    </div>
  );

  if (layout === 'hero_image') {
    return (
      <div className="relative w-full overflow-hidden" style={{ borderRadius: '10px', maxHeight: '45%' }}>
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          style={{ aspectRatio: '16/9', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        {countBadge}
      </div>
    );
  }

  if (layout === 'split_image') {
    return (
      <div className="relative overflow-hidden flex-shrink-0" style={{ borderRadius: '10px', width: '40%' }}>
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
        {countBadge}
      </div>
    );
  }

  // background_image
  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          style={{ filter: 'blur(18px) brightness(0.35)', transform: 'scale(1.15)' }}
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />
      </div>
      {countBadge && <div className="absolute top-4 right-4 z-10">{countBadge}</div>}
    </>
  );
}

export const ShareCardTemplate = forwardRef<HTMLDivElement, ShareCardTemplateProps>(
  ({
    data, theme, format, privacy: rawPrivacy, phrase, userName, animate = true,
    includeImage = true, imageLayoutOverride, showImageCount = true,
  }, ref) => {
    const t = THEMES[theme];
    const privacy = applyPrivacy(rawPrivacy);
    const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
    const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';
    const VisualModule = VisualModuleMap[data.visualType || 'none'];
    const tokens = SHARE_TOKENS;

    const hasImage = includeImage && !!data.imageUrl;
    const imageLayout: ImageLayout = imageLayoutOverride || data.imageLayout || 'hero_image';
    const imageCount = data.imageUrls?.length || (data.imageUrl ? 1 : 0);
    const isSplit = hasImage && imageLayout === 'split_image';
    const isBackground = hasImage && imageLayout === 'background_image';

    return (
      <div
        ref={ref}
        className={cn(
          'share-card relative overflow-hidden select-none',
          formatAspect[format],
          isSplit ? 'flex flex-row' : 'flex flex-col justify-between',
        )}
        style={{
          background: t.bgGradient,
          borderRadius: tokens.radius.card,
          padding: isSplit ? '0' : tokens.spacing.cardPadding,
          border: '1px solid hsla(0,0%,100%,0.04)',
          boxShadow: `${tokens.elevation.cardShadow} hsla(0,0%,0%,0.4)`,
        }}
      >
        {/* Background image mode */}
        {hasImage && isBackground && (
          <CardImage
            url={data.imageUrl!}
            layout="background_image"
            imageCount={imageCount}
            showCount={showImageCount}
            accentHex={t.accentHex}
          />
        )}

        {/* Split image (left side) */}
        {hasImage && isSplit && (
          <CardImage
            url={data.imageUrl!}
            layout="split_image"
            imageCount={imageCount}
            showCount={showImageCount}
            accentHex={t.accentHex}
          />
        )}

        {/* Main content wrapper */}
        <div
          className={cn(
            'relative flex flex-col justify-between',
            isSplit ? 'flex-1 min-w-0' : 'flex-1',
          )}
          style={{ padding: isSplit ? tokens.spacing.cardPadding : undefined }}
        >
          {/* Subtle dot texture */}
          {!isBackground && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(${t.dotPattern} 0.5px, transparent 0.5px)`,
              backgroundSize: '32px 32px',
            }} />
          )}

          {/* Gradient drift overlay */}
          {animate && !isBackground && (
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.06] share-gradient-drift"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, ${t.accentHex}, transparent 70%)`,
              }}
            />
          )}

          {/* ═══ TOP BAND ═══ */}
          <div className="relative flex items-center justify-between" style={{ minHeight: tokens.spacing.topBandHeight }}>
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
                  boxShadow: '0 2px 12px -2px hsla(43,74%,52%,0.3)',
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
              </div>
              {privacy.includeName && userName && (
                <span className={cn('font-medium', t.textSecondary)} style={{ fontSize: 11 }}>{userName}</span>
              )}
            </div>
            <span
              className={cn(t.pillBg, t.pillBorder, t.accent)}
              style={{
                fontSize: tokens.typography.pillSize,
                fontWeight: Number(tokens.typography.pillWeight),
                letterSpacing: tokens.typography.pillLetterSpacing,
                textTransform: 'uppercase' as const,
                padding: '4px 10px',
                borderRadius: tokens.radius.pill,
                borderWidth: 1,
                borderStyle: 'solid',
                boxShadow: `${tokens.elevation.pillShadow} hsla(0,0%,0%,0.15)`,
              }}
            >
              {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
            </span>
          </div>

          {/* ═══ HERO IMAGE (hero mode) ═══ */}
          {hasImage && imageLayout === 'hero_image' && (
            <CardImage
              url={data.imageUrl!}
              layout="hero_image"
              imageCount={imageCount}
              showCount={showImageCount}
              accentHex={t.accentHex}
            />
          )}

          {/* ═══ HERO AREA ═══ */}
          <div className={cn('relative flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: tokens.spacing.sectionGap }}>
            {VisualModule && !hasImage && (
              <div className="flex items-center justify-center py-1">
                <VisualModule accentHex={t.accentHex} trackHex={t.trackHex} animate={animate} />
              </div>
            )}

            {displayValue && (
              <div className="text-center" style={{ gap: tokens.spacing.elementGap }}>
                <div
                  className={cn(animate && 'share-metric-count')}
                  style={{
                    fontSize: tokens.typography.heroSize,
                    fontWeight: Number(tokens.typography.heroWeight),
                    letterSpacing: tokens.typography.heroLetterSpacing,
                    lineHeight: 1.1,
                    color: t.headlineHex,
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  {displayValue}
                </div>
                {data.statLabel && (
                  <p
                    className={t.textSecondary}
                    style={{
                      fontSize: tokens.typography.metricSize,
                      fontWeight: Number(tokens.typography.metricWeight),
                      letterSpacing: tokens.typography.metricLetterSpacing,
                      textTransform: 'uppercase' as const,
                      marginTop: 4,
                    }}
                  >
                    {data.statLabel}
                  </p>
                )}
              </div>
            )}

            <h2
              className={t.textPrimary}
              style={{
                fontSize: 'clamp(1.125rem, 3.5vw, 1.5rem)',
                fontWeight: 600,
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {data.title}
            </h2>

            {data.secondaryValue && (
              <div className="flex justify-center">
                <div
                  className={cn(t.metricBg, t.metricBorder)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 16px',
                    borderRadius: tokens.radius.metric,
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: t.metricHex,
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {displaySecondary}
                  </span>
                  {data.secondaryLabel && (
                    <span
                      className={t.textSecondary}
                      style={{
                        fontSize: tokens.typography.metricSize,
                        letterSpacing: tokens.typography.metricLetterSpacing,
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      {data.secondaryLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {data.subtitle && (
              <p
                className={t.textSecondary}
                style={{
                  fontSize: '0.8125rem',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  maxWidth: '85%',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {data.subtitle}
              </p>
            )}

            {privacy.includeDateTime && data.timeAnchor && (
              <p
                className={t.textMuted}
                style={{
                  fontSize: 11,
                  textAlign: 'center',
                  letterSpacing: '0.06em',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {data.timeAnchor}
              </p>
            )}
          </div>

          {data.philosophy && (
            <div className="relative" style={{ paddingBottom: 12 }}>
              <p
                className={t.accent}
                style={{
                  fontSize: tokens.typography.narrativeSize,
                  fontWeight: Number(tokens.typography.narrativeWeight),
                  letterSpacing: tokens.typography.narrativeLetterSpacing,
                  textAlign: 'center',
                  fontStyle: 'italic',
                  opacity: 0.55,
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                "{data.philosophy}"
              </p>
            </div>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="relative" style={{ borderTop: `1px solid hsla(0,0%,100%,0.06)`, paddingTop: 12 }}>
            <div className="flex items-center justify-between">
              <p
                className={t.accent}
                style={{
                  fontSize: tokens.typography.footerSize,
                  fontWeight: Number(tokens.typography.footerWeight),
                  letterSpacing: tokens.typography.footerLetterSpacing,
                  textTransform: 'uppercase' as const,
                }}
              >
                {phrase}
              </p>
              {privacy.includeFooter && (
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: t.footerHex,
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Shared from LifeStack
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCardTemplate.displayName = 'ShareCardTemplate';
