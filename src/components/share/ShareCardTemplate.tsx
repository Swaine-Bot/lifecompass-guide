import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ShareCardData, PrivacySettings, ShareTheme, ShareFormat,
  CARD_TYPE_LABELS, THEMES, applyPrivacy,
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
}

const formatAspect: Record<ShareFormat, string> = {
  story: 'aspect-[9/16]',
  feed: 'aspect-[4/5]',
  square: 'aspect-square',
  linkedin: 'aspect-[4/5]',
};

const VisualModuleMap: Record<string, React.FC<{ accentHex: string }>> = {
  flame: StreakFlameModule,
  ring: ProgressRingModule,
  radar: RadarLifeDomainsModule,
  badge: MilestoneBadgeModule,
  chart: MiniBarChartModule,
  quote: MentorQuoteModule,
};

export const ShareCardTemplate = forwardRef<HTMLDivElement, ShareCardTemplateProps>(
  ({ data, theme, format, privacy: rawPrivacy, phrase, userName }, ref) => {
    const t = THEMES[theme];
    const privacy = applyPrivacy(rawPrivacy);
    const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
    const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';
    const VisualModule = VisualModuleMap[data.visualType || 'none'];

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border select-none',
          formatAspect[format],
          t.bg, `border-[${t.accentHex}]/10`,
          'flex flex-col justify-between p-6 sm:p-8',
          'shadow-[0_0_80px_-20px] shadow-current/5'
        )}
      >
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${t.dotPattern} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(43,74%,52%)] to-[hsl(43,65%,38%)] flex items-center justify-center shadow-lg shadow-[hsl(43,74%,52%)]/20">
              <span className="text-[9px] font-bold text-[hsl(220,20%,6%)] tracking-wider">LS</span>
            </div>
            {privacy.includeName && userName && (
              <span className={cn('text-[11px] font-medium', t.textSecondary)}>{userName}</span>
            )}
          </div>
          <span className={cn(
            'text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border',
            t.pillBg, t.pillBorder, t.accent
          )}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col justify-center space-y-4 py-4">
          {/* Visual Module */}
          {VisualModule && (
            <div className="flex items-center justify-center">
              <VisualModule accentHex={t.accentHex} />
            </div>
          )}

          {/* Hero Stat */}
          {displayValue && (
            <div className="text-center space-y-1">
              <div className={cn('text-5xl sm:text-6xl font-bold font-serif tracking-tight', t.accent)}>
                {displayValue}
              </div>
              {data.statLabel && (
                <p className={cn('text-sm font-medium tracking-wide', t.textSecondary)}>
                  {data.statLabel}
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className={cn('text-xl sm:text-2xl font-serif font-semibold text-center leading-tight', t.textPrimary)}>
            {data.title}
          </h2>

          {/* Secondary Metric */}
          {data.secondaryValue && (
            <div className="flex justify-center">
              <div className={cn('flex items-center gap-3 rounded-xl px-4 py-2 border', t.metricBg, t.metricBorder)}>
                <span className={cn('text-lg font-bold', t.accent)}>{displaySecondary}</span>
                {data.secondaryLabel && (
                  <span className={cn('text-xs', t.textSecondary)}>{data.secondaryLabel}</span>
                )}
              </div>
            </div>
          )}

          {/* Subtitle */}
          {data.subtitle && (
            <p className={cn('text-sm text-center leading-relaxed max-w-xs mx-auto', t.textSecondary)}>
              {data.subtitle}
            </p>
          )}

          {/* Time anchor */}
          {privacy.includeDateTime && data.timeAnchor && (
            <p className={cn('text-[11px] text-center tracking-wide', t.textMuted)}>
              {data.timeAnchor}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="relative space-y-3">
          {data.philosophy && (
            <p className={cn('text-xs text-center italic tracking-wide opacity-60', t.accent)}>
              "{data.philosophy}"
            </p>
          )}
          <div className={cn('flex items-center justify-between pt-3 border-t', t.borderLine)}>
            <p className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', t.accent)}>
              {phrase}
            </p>
            {privacy.includeFooter && (
              <span className={cn('text-[9px] tracking-[0.1em]', t.textMuted)}>
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
