import { cn } from '@/lib/utils';
import { applyPrivacy, CARD_TYPE_LABELS, SHARE_TOKENS } from '@/services/shareService';
import type { ShareTemplateProps } from './types';

export function MomentumTemplate({ data, theme: t, privacy: rawPrivacy, phrase, userName, animate, aiInsight }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const displayValue = privacy.includeExactNumbers ? data.statValue : '•••';
  const displaySecondary = privacy.includeExactNumbers ? data.secondaryValue : '•••';

  return (
    <div className="relative flex flex-col justify-between h-full w-full overflow-hidden"
      style={{ background: t.bgGradient, padding: '24px' }}>
      {/* Radial accent glow */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 pointer-events-none opacity-[0.08]"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${t.accentHex}, transparent 70%)` }} />

      {/* Top */}
      <div className="relative flex items-center justify-between">
        <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
          {data.identityLabel || CARD_TYPE_LABELS[data.cardType]}
        </span>
        <div className="flex items-center justify-center"
          style={{ width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)' }}>LS</span>
        </div>
      </div>

      {/* Center - big number + context */}
      <div className={cn('relative flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: 16 }}>
        {displayValue && (
          <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 800, color: t.accentHex,
            fontFamily: '"Playfair Display", serif', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
            {displayValue}
          </div>
        )}
        <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.375rem)', fontWeight: 600,
          fontFamily: '"Playfair Display", serif', lineHeight: 1.3 }}>
          {data.title}
        </h2>
        {data.subtitle && (
          <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
            {data.subtitle}
          </p>
        )}

        {/* Progress bar visual */}
        <div style={{ height: 4, borderRadius: 2, background: t.trackHex, overflow: 'hidden', marginTop: 4 }}>
          <div style={{ width: '72%', height: '100%', borderRadius: 2, background: t.accentHex,
            transition: 'width 1s ease' }} />
        </div>

        {/* Secondary metric */}
        {displaySecondary && (
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1rem', fontWeight: 700, color: t.metricHex, fontFamily: '"Playfair Display", serif' }}>
              {displaySecondary}
            </span>
            {data.secondaryLabel && (
              <span className={t.textSecondary} style={{ fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {data.secondaryLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Insight note */}
      {aiInsight && (
        <div className="relative" style={{ padding: '10px 12px', borderRadius: 8,
          background: 'hsla(0,0%,100%,0.04)', border: '1px solid hsla(0,0%,100%,0.06)', marginBottom: 12 }}>
          <p className={t.textSecondary} style={{ fontSize: '0.6875rem', lineHeight: 1.4 }}>
            {aiInsight}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="relative" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 12 }}>
        <div className="flex items-center justify-between">
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          {privacy.includeName && userName && (
            <span className={t.textMuted} style={{ fontSize: 9 }}>{userName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
