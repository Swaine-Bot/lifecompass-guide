import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS } from '@/services/shareService';
import type { ShareTemplateProps } from './types';

export function StoryTemplate({ data, theme: t, privacy: rawPrivacy, phrase, userName, animate, aiInsight }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden"
      style={{ background: t.bgGradient }}>
      {/* Large accent gradient splash */}
      <div className="absolute top-0 left-0 w-full h-1/3 pointer-events-none opacity-[0.12]"
        style={{ background: `radial-gradient(ellipse at 20% 0%, ${t.accentHex}, transparent 70%)` }} />

      <div className="relative flex flex-col justify-between h-full" style={{ padding: '28px 24px' }}>
        {/* Top label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)' }}>LS</span>
          </div>
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
          </span>
        </div>

        {/* Hero content */}
        <div className={cn('flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: 20 }}>
          {displayValue && (
            <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 700, color: t.accentHex,
              fontFamily: '"Playfair Display", serif', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {displayValue}
            </div>
          )}
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 700,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              {data.subtitle}
            </p>
          )}
          {data.statLabel && (
            <p className={t.textMuted} style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {data.statLabel}
            </p>
          )}
        </div>

        {/* AI Insight pull-quote */}
        {aiInsight && (
          <div style={{ padding: '16px 0', borderLeft: `3px solid ${t.accentHex}`, paddingLeft: 16, marginBottom: 12 }}>
            <p className={t.textSecondary} style={{ fontSize: '0.8125rem', fontStyle: 'italic', lineHeight: 1.5 }}>
              {aiInsight}
            </p>
          </div>
        )}

        {/* Bottom */}
        <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 12 }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          {privacy.includeName && userName && (
            <p className={t.textMuted} style={{ fontSize: 10, marginTop: 4 }}>{userName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
