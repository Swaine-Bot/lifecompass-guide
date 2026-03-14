import { useState } from 'react';
import { Play } from 'lucide-react';
import type { ThemeDefinition } from '@/services/shareService';

// ─── Shared Panel Wrapper ─────────────────────────────────────────
interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BentoPanel({ children, className = '', style }: PanelProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'hsla(220,18%,10%,0.6)',
        borderRadius: '14px',
        border: '1px solid hsla(0,0%,100%,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── MEDIA PANEL ──────────────────────────────────────────────────
interface MediaPanelProps {
  url?: string;
  urls?: string[];
  isVideo?: boolean;
  isAudio?: boolean;
  showCount?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MediaPanel({ url, urls, isVideo, isAudio, showCount = true, className = '' }: MediaPanelProps) {
  const [failed, setFailed] = useState(false);
  const imageCount = urls?.length || (url ? 1 : 0);

  if (!url || failed) {
    return (
      <BentoPanel className={`flex items-center justify-center ${className}`} style={{ minHeight: 120 }}>
        <div className="text-center opacity-30">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center mb-2">
            <span className="text-lg">📷</span>
          </div>
          <span style={{ fontSize: 11, color: 'hsl(220,10%,40%)' }}>No media</span>
        </div>
      </BentoPanel>
    );
  }

  return (
    <BentoPanel className={`relative ${className}`}>
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {/* Play overlay for video/audio */}
      {(isVideo || isAudio) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'hsla(0,0%,0%,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid hsla(0,0%,100%,0.15)',
            }}
          >
            <Play style={{ width: 20, height: 20, color: 'hsl(0,0%,95%)', marginLeft: 2 }} />
          </div>
        </div>
      )}
      {/* Count badge */}
      {showCount && imageCount > 1 && (
        <div
          className="absolute top-3 right-3"
          style={{
            padding: '3px 10px',
            borderRadius: 100,
            background: 'hsla(0,0%,0%,0.55)',
            backdropFilter: 'blur(4px)',
            fontSize: 10,
            fontWeight: 600,
            color: 'hsl(0,0%,90%)',
          }}
        >
          +{imageCount - 1}
        </div>
      )}
    </BentoPanel>
  );
}

// ─── INSIGHT PANEL ────────────────────────────────────────────────
interface InsightPanelProps {
  insight: string;
  theme: ThemeDefinition;
  className?: string;
}

export function InsightPanel({ insight, theme, className = '' }: InsightPanelProps) {
  return (
    <BentoPanel className={`p-5 flex flex-col justify-center ${className}`}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 10,
        }}
      >
        AI INSIGHT
      </div>
      <p
        style={{
          fontSize: 15,
          fontStyle: 'italic',
          lineHeight: 1.55,
          color: 'hsl(220,10%,82%)',
          fontFamily: '"Playfair Display", serif',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical' as const,
        }}
      >
        "{insight}"
      </p>
    </BentoPanel>
  );
}

// ─── USER TEXT PANEL ──────────────────────────────────────────────
interface UserTextPanelProps {
  title: string;
  subtitle?: string;
  theme: ThemeDefinition;
  className?: string;
  maxTitleLines?: number;
  maxSubtitleLines?: number;
}

export function UserTextPanel({ title, subtitle, theme, className = '', maxTitleLines = 3, maxSubtitleLines = 3 }: UserTextPanelProps) {
  return (
    <BentoPanel className={`p-5 flex flex-col justify-center ${className}`}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.25,
          color: theme.headlineHex,
          fontFamily: '"Playfair Display", serif',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: maxTitleLines,
          WebkitBoxOrient: 'vertical' as const,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: 'hsl(220,10%,55%)',
            fontFamily: '"Poppins", sans-serif',
            marginTop: 8,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: maxSubtitleLines,
            WebkitBoxOrient: 'vertical' as const,
          }}
        >
          {subtitle}
        </p>
      )}
    </BentoPanel>
  );
}

// ─── META PANEL ───────────────────────────────────────────────────
interface MetaPanelProps {
  cardType: string;
  timeAnchor?: string;
  domain?: string;
  theme: ThemeDefinition;
  className?: string;
}

export function MetaPanel({ cardType, timeAnchor, domain, theme, className = '' }: MetaPanelProps) {
  return (
    <BentoPanel className={`p-4 flex flex-col justify-center ${className}`}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 6,
        }}
      >
        {cardType.replace(/_/g, ' ')}
      </div>
      {timeAnchor && (
        <div style={{ fontSize: 12, color: 'hsl(220,10%,45%)', fontFamily: '"Poppins", sans-serif' }}>
          {timeAnchor}
        </div>
      )}
      {domain && (
        <div
          style={{
            fontSize: 10,
            color: 'hsl(220,10%,40%)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: 4,
          }}
        >
          {domain}
        </div>
      )}
    </BentoPanel>
  );
}

// ─── MOMENTUM PANEL ───────────────────────────────────────────────
interface MomentumPanelProps {
  statValue?: string;
  statLabel?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  phrase: string;
  theme: ThemeDefinition;
  showNumbers?: boolean;
  className?: string;
}

export function MomentumPanel({ statValue, statLabel, secondaryValue, secondaryLabel, phrase, theme, showNumbers = true, className = '' }: MomentumPanelProps) {
  return (
    <BentoPanel className={`p-5 flex flex-col justify-center ${className}`}>
      {statValue && (
        <div className="flex items-baseline gap-3 mb-2">
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: theme.accentHex,
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1,
            }}
          >
            {showNumbers ? statValue : '•••'}
          </span>
          {statLabel && (
            <span style={{ fontSize: 12, fontWeight: 500, color: 'hsl(220,10%,50%)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {statLabel}
            </span>
          )}
        </div>
      )}
      {secondaryValue && (
        <div className="flex items-baseline gap-2 mb-2">
          <span style={{ fontSize: 18, fontWeight: 600, color: theme.metricHex, fontFamily: '"Playfair Display", serif' }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span style={{ fontSize: 11, color: 'hsl(220,10%,45%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{secondaryLabel}</span>
          )}
        </div>
      )}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          fontStyle: 'italic',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          opacity: 0.7,
          marginTop: statValue ? 4 : 0,
        }}
      >
        {phrase}
      </p>
    </BentoPanel>
  );
}

// ─── BRAND PANEL ──────────────────────────────────────────────────
interface BrandPanelProps {
  theme: ThemeDefinition;
  className?: string;
}

export function BrandPanel({ theme, className = '' }: BrandPanelProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      style={{
        padding: '14px 20px',
        borderRadius: '14px',
        background: 'hsla(220,18%,8%,0.7)',
        border: '1px solid hsla(0,0%,100%,0.04)',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
          boxShadow: '0 2px 8px -2px hsla(43,74%,52%,0.3)',
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', color: 'hsl(220,10%,45%)' }}>
        Posted from <span style={{ color: theme.accentHex, fontWeight: 600 }}>LifeStack</span>
      </span>
    </div>
  );
}
