import { cn } from '@/lib/utils';
import { Flame, Trophy, Brain, TrendingUp, Calendar, Zap } from 'lucide-react';
import { ShareCardData, PrivacySettings, ShareTheme, ShareFormat, CARD_TYPE_LABELS } from '@/services/shareService';

interface ShareCardTemplateProps {
  data: ShareCardData;
  theme: ShareTheme;
  format: ShareFormat;
  privacy: PrivacySettings;
  phrase: string;
  userName?: string;
}

const themeStyles: Record<ShareTheme, { bg: string; accent: string; border: string; glow: string }> = {
  executive: {
    bg: 'bg-gradient-to-br from-[hsl(220,20%,6%)] via-[hsl(220,18%,9%)] to-[hsl(220,20%,12%)]',
    accent: 'text-[hsl(43,74%,52%)]',
    border: 'border-[hsl(43,74%,52%)]/15',
    glow: 'shadow-[0_0_60px_-15px_hsl(43,74%,52%,0.15)]',
  },
  warrior: {
    bg: 'bg-gradient-to-br from-[hsl(0,15%,6%)] via-[hsl(350,12%,10%)] to-[hsl(220,15%,8%)]',
    accent: 'text-red-400',
    border: 'border-red-500/15',
    glow: 'shadow-[0_0_60px_-15px_hsl(0,70%,50%,0.15)]',
  },
  minimal: {
    bg: 'bg-[hsl(220,20%,5%)]',
    accent: 'text-[hsl(0,0%,92%)]',
    border: 'border-[hsl(220,15%,20%)]/30',
    glow: 'shadow-none',
  },
  cinematic: {
    bg: 'bg-gradient-to-br from-[hsl(260,20%,8%)] via-[hsl(220,18%,7%)] to-[hsl(190,18%,8%)]',
    accent: 'text-[hsl(43,74%,52%)]',
    border: 'border-[hsl(260,30%,30%)]/15',
    glow: 'shadow-[0_0_80px_-20px_hsl(260,50%,40%,0.15)]',
  },
};

const visualIcons: Record<string, typeof Flame> = {
  flame: Flame,
  badge: Trophy,
  none: Brain,
  ring: TrendingUp,
  chart: Calendar,
  radar: Zap,
};

const formatAspect: Record<ShareFormat, string> = {
  story: 'aspect-[9/16]',
  feed: 'aspect-[4/5]',
  square: 'aspect-square',
  linkedin: 'aspect-[4/5]',
};

export function ShareCardTemplate({ data, theme, format, privacy, phrase, userName }: ShareCardTemplateProps) {
  const t = themeStyles[theme];
  const Icon = visualIcons[data.visualType || 'none'];
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border',
        formatAspect[format],
        t.bg, t.border, t.glow,
        'flex flex-col justify-between p-6 sm:p-8'
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(43,74%,52%)] to-[hsl(43,65%,40%)] flex items-center justify-center">
            <span className="text-[8px] font-bold text-[hsl(220,20%,6%)] tracking-wider">LS</span>
          </div>
          {privacy.includeName && userName && (
            <span className="text-[11px] text-[hsl(220,10%,55%)] font-medium">{userName}</span>
          )}
        </div>
        <span className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full',
          'bg-[hsl(220,15%,14%)] border border-[hsl(220,15%,22%)]',
          t.accent
        )}>
          {CARD_TYPE_LABELS[data.cardType] || data.cardType}
        </span>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col justify-center space-y-4">
        {/* Visual Module */}
        {data.visualType && data.visualType !== 'none' && (
          <div className={cn('flex items-center justify-center', t.accent)}>
            <Icon className="w-10 h-10 opacity-40" />
          </div>
        )}

        {/* Hero Stat */}
        {displayValue && (
          <div className="text-center space-y-1">
            <div className={cn('text-5xl sm:text-6xl font-bold font-serif tracking-tight', t.accent)}>
              {displayValue}
            </div>
            {data.statLabel && (
              <p className="text-sm text-[hsl(220,10%,50%)] font-medium tracking-wide">
                {data.statLabel}
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-center text-[hsl(40,15%,92%)] leading-tight">
          {data.title}
        </h2>

        {/* Secondary Metric */}
        {data.secondaryValue && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,18%)] rounded-xl px-4 py-2">
              <span className={cn('text-lg font-bold', t.accent)}>{displaySecondary}</span>
              {data.secondaryLabel && (
                <span className="text-xs text-[hsl(220,10%,50%)]">{data.secondaryLabel}</span>
              )}
            </div>
          </div>
        )}

        {/* Subtitle */}
        {data.subtitle && (
          <p className="text-sm text-[hsl(220,10%,55%)] text-center leading-relaxed max-w-xs mx-auto">
            {data.subtitle}
          </p>
        )}

        {/* Time anchor */}
        {privacy.includeDateTime && data.timeAnchor && (
          <p className="text-[11px] text-[hsl(220,10%,40%)] text-center tracking-wide">
            {data.timeAnchor}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="relative space-y-3">
        {/* Philosophy line */}
        {data.philosophy && (
          <p className={cn(
            'text-xs text-center italic tracking-wide opacity-70',
            t.accent
          )}>
            "{data.philosophy}"
          </p>
        )}

        {/* Signature + Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[hsl(220,15%,15%)]">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', t.accent)}>
            {phrase}
          </p>
          {privacy.includeFooter && (
            <span className="text-[9px] text-[hsl(220,10%,35%)] tracking-[0.1em]">
              Shared from LifeStack
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
