import { cn } from '@/lib/utils';
import { applyPrivacy } from '@/services/shareService';
import type { ShareTemplateProps } from './types';

export function ReflectionTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);

  return (
    <div className="relative flex flex-col justify-between h-full w-full overflow-hidden"
      style={{ background: t.bgGradient, padding: '32px 28px' }}>
      {/* Subtle gradient orb */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none opacity-[0.06]"
        style={{ background: `radial-gradient(ellipse at 30% 80%, ${t.accentHex}, transparent 60%)` }} />

      {/* Top identifier */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div style={{ width: 3, height: 16, borderRadius: 2, background: t.accentHex }} />
          <span className={t.textMuted} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
            {data.identityLabel || 'Reflection'}
          </span>
        </div>
      </div>

      {/* Main reflection content */}
      <div className={cn('relative flex-1 flex flex-col justify-center', animate && 'share-hero-fade')} style={{ gap: 24 }}>
        {/* Opening quote mark */}
        <div style={{ fontSize: 56, lineHeight: 0.6, color: t.accentHex, opacity: 0.2, fontFamily: '"Playfair Display", serif' }}>"</div>
        
        <p className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.375rem)', fontWeight: 500,
          fontFamily: '"Playfair Display", serif', lineHeight: 1.5, fontStyle: 'italic' }}>
          {data.subtitle || data.title}
        </p>

        {/* AI Insight as emotional framing */}
        {aiInsight && (
          <div style={{ paddingLeft: 16, borderLeft: `2px solid ${t.accentHex}40` }}>
            <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {aiInsight}
            </p>
          </div>
        )}

        {data.title !== data.subtitle && data.subtitle && (
          <p className={t.accent} style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            — {data.title}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="relative" style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 14 }}>
        <div className="flex items-center justify-between">
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
          {privacy.includeFooter && (
            <div className="flex items-center gap-1.5">
              <div style={{ width: 16, height: 16, borderRadius: 4,
                background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}
                className="flex items-center justify-center">
                <span style={{ fontSize: 6, fontWeight: 700, color: 'hsl(220,20%,6%)' }}>LS</span>
              </div>
              <span style={{ fontSize: 8, letterSpacing: '0.1em', color: t.footerHex }}>LifeStack</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
