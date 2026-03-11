import { useState } from 'react';
import { cn } from '@/lib/utils';
import { applyPrivacy, SHARE_TOKENS } from '@/services/shareService';
import type { ShareTemplateProps } from './types';

export function MediaSpotlightTemplate({ data, theme: t, privacy: rawPrivacy, phrase, animate, aiInsight }: ShareTemplateProps) {
  const privacy = applyPrivacy(rawPrivacy);
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!data.imageUrl && !imgFailed;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden" style={{ background: t.bgGradient }}>
      {/* Media area - top 55% */}
      <div className="relative" style={{ flex: '0 0 55%', overflow: 'hidden' }}>
        {hasImage ? (
          <>
            <img src={data.imageUrl!} alt="" onError={() => setImgFailed(true)}
              className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsla(0,0%,100%,0.03)' }}>
            {data.secondaryValue ? (
              <div className="text-center" style={{ gap: 8 }}>
                <p style={{ fontSize: 32, opacity: 0.6 }}>
                  {data.secondaryValue.includes('🎬') ? '🎬' : data.secondaryValue.includes('🎙') ? '🎙️' : '📷'}
                </p>
                <p className={t.textMuted} style={{ fontSize: 11 }}>{data.secondaryValue}</p>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${t.accentHex}15`, border: `1px solid ${t.accentHex}30` }}>
                <span style={{ fontSize: 28, opacity: 0.5 }}>📷</span>
              </div>
            )}
          </div>
        )}

        {/* Image count badge */}
        {(data.imageUrls?.length || 0) > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
            style={{ background: 'hsla(0,0%,0%,0.6)', color: 'hsla(0,0%,100%,0.9)', fontSize: 10, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            +{(data.imageUrls?.length || 1) - 1} more
          </div>
        )}
      </div>

      {/* Content area - bottom 45% */}
      <div className={cn('relative flex-1 flex flex-col justify-between', animate && 'share-hero-fade')}
        style={{ padding: '20px 24px' }}>
        <div style={{ gap: 8 }} className="flex flex-col">
          <h2 className={t.textPrimary} style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 600,
            fontFamily: '"Playfair Display", serif', lineHeight: 1.3 }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={t.textSecondary} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              {data.subtitle.slice(0, 100)}{data.subtitle.length > 100 ? '…' : ''}
            </p>
          )}
          {/* AI Insight as caption */}
          {aiInsight && (
            <p style={{ fontSize: '0.6875rem', lineHeight: 1.4, color: t.accentHex, fontStyle: 'italic', marginTop: 4 }}>
              {aiInsight}
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10 }}>
          <p className={t.accent} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {phrase}
          </p>
        </div>
      </div>
    </div>
  );
}
