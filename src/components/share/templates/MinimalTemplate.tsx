import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import type { ShareTemplateProps } from './types';

export function MinimalTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);

  return (
    <div className="relative flex flex-col justify-center h-full w-full overflow-hidden"
      style={{ background: t.bgGradient, padding: '40px 28px' }}>

      <div className={cn('flex flex-col items-center text-center', animate && 'share-hero-fade')} style={{ gap: 24 }}>
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

        {privacy.includeFooter && (
          <span style={{ fontSize: 8, letterSpacing: '0.12em', color: t.footerHex, textTransform: 'uppercase' }}>
            LifeStack
          </span>
        )}
      </div>
    </div>
  );
}
