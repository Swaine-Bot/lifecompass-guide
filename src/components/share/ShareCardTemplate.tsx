import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ShareCardData, PrivacySettings, ShareTheme, ShareFormat,
  CARD_TYPE_LABELS, THEMES, applyPrivacy, SHARE_TOKENS,
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

export const ShareCardTemplate = forwardRef<HTMLDivElement, ShareCardTemplateProps>(
  ({ data, theme, format, privacy: rawPrivacy, phrase, userName, animate = true }, ref) => {
    const t = THEMES[theme];
    const privacy = applyPrivacy(rawPrivacy);
    const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
    const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';
    const VisualModule = VisualModuleMap[data.visualType || 'none'];
    const tokens = SHARE_TOKENS;

    return (
      <div
        ref={ref}
        className={cn(
          'share-card relative overflow-hidden select-none',
          formatAspect[format],
          'flex flex-col justify-between',
        )}
        style={{
          background: t.bgGradient,
          borderRadius: tokens.radius.card,
          padding: tokens.spacing.cardPadding,
          border: '1px solid hsla(0,0%,100%,0.04)',
          boxShadow: `${tokens.elevation.cardShadow} hsla(0,0%,0%,0.4)`,
        }}
      >
        {/* Subtle dot texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(${t.dotPattern} 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Gradient drift overlay */}
        {animate && (
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
            {/* LifeStack mark */}
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

          {/* Identity pill */}
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

        {/* ═══ HERO AREA ═══ */}
        <div className={cn('relative flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: tokens.spacing.sectionGap }}>

          {/* Visual Module (single per card) */}
          {VisualModule && (
            <div className="flex items-center justify-center py-1">
              <VisualModule accentHex={t.accentHex} trackHex={t.trackHex} animate={animate} />
            </div>
          )}

          {/* Hero stat */}
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

          {/* Hero headline */}
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

          {/* ═══ METRICS BAND ═══ */}
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

          {/* Subtitle */}
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

          {/* Time anchor */}
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

        {/* ═══ NARRATIVE LINE ═══ */}
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
    );
  }
);

ShareCardTemplate.displayName = 'ShareCardTemplate';
