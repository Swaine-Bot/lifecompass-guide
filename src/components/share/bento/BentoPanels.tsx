import { useState } from 'react';
import type { ThemeDefinition } from '@/services/shareService';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function detectMediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|mov|webm|avi|m4v)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(url)) return 'audio';
  return 'image';
}

export function BentoPanel({ children, className = '', style }: PanelProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'hsla(220,18%,10%,0.68)',
        borderRadius: '14px',
        border: '1px solid hsla(0,0%,100%,0.07)',
        boxShadow: '0 8px 24px -16px hsla(0,0%,0%,0.58)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface MediaPanelProps {
  url?: string;
  urls?: string[];
  isVideo?: boolean;
  isAudio?: boolean;
  showCount?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MediaPanel({ url, urls, isVideo, isAudio, showCount = true, className = '', style }: MediaPanelProps) {
  const [failed, setFailed] = useState(false);
  const imageCount = urls?.length || (url ? 1 : 0);
  const mediaType = url ? detectMediaType(url) : 'image';
  const isMediaVideo = isVideo || mediaType === 'video';
  const isMediaAudio = isAudio || mediaType === 'audio';

  if (!url || failed) {
    return (
      <BentoPanel className={`flex items-center justify-center ${className}`} style={{ minHeight: 120, ...style }}>
        <div className="text-center opacity-35">
          <div
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2"
            style={{ background: 'hsla(0,0%,100%,0.06)' }}
          >
            <span className="text-lg">📷</span>
          </div>
          <span style={{ fontSize: 11, color: 'hsl(220,10%,42%)' }}>No media</span>
        </div>
      </BentoPanel>
    );
  }

  return (
    <BentoPanel className={`relative ${className}`} style={style}>
      {isMediaAudio ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background:
              'linear-gradient(145deg, hsla(220,26%,14%,0.9) 0%, hsla(220,18%,10%,0.82) 60%, hsla(220,20%,7%,0.92) 100%)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{
              background: 'hsla(0,0%,100%,0.08)',
              border: '1px solid hsla(0,0%,100%,0.16)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>🎙️</span>
          </div>
          <div className="flex items-end gap-[3px] px-6" style={{ height: 32 }}>
            {[...Array(18)].map((_, i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: `${8 + ((i * 7) % 19)}px`,
                  borderRadius: 4,
                  background: 'hsla(0,0%,100%,0.32)',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 10, color: 'hsl(220,10%,62%)', letterSpacing: '0.07em', marginTop: 8 }}>
            AUDIO PREVIEW
          </span>
        </div>
      ) : isMediaVideo ? (
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          className="w-full h-full"
          style={{ objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          crossOrigin="anonymous"
          className="w-full h-full"
          style={{ objectFit: 'contain', display: 'block' }}
        />
      )}

      {(isMediaVideo || isMediaAudio) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'hsla(0,0%,0%,0.52)',
              backdropFilter: 'blur(8px)',
              border: '1px solid hsla(0,0%,100%,0.2)',
            }}
          >
            <span style={{ fontSize: 20, color: 'hsl(0,0%,95%)', marginLeft: 2 }}>▶</span>
          </div>
        </div>
      )}

      {showCount && imageCount > 1 && (
        <div
          className="absolute top-3 right-3"
          style={{
            padding: '3px 10px',
            borderRadius: 100,
            background: 'hsla(0,0%,0%,0.58)',
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

interface InsightPanelProps {
  insight: string;
  links?: { label: string; url: string }[];
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  fullText?: boolean;
}

export function InsightPanel({
  insight,
  links,
  theme,
  className = '',
  style,
  fontSize = 15,
  fullText = false,
}: InsightPanelProps) {
  return (
    <BentoPanel className={`p-4 flex flex-col justify-center ${className}`} style={style}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 8,
        }}
      >
        AI INSIGHT
      </div>
      <p
        style={{
          fontSize,
          fontStyle: 'italic',
          lineHeight: 1.52,
          color: 'hsl(220,10%,84%)',
          fontFamily: '"Playfair Display", serif',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          ...(fullText
            ? {}
            : {
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical' as const,
              }),
        }}
      >
        {insight}
      </p>

      {links?.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {links.slice(0, 3).map((link, index) => (
            <a
              key={`${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                fontSize: 10,
                color: theme.accentHex,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                opacity: 0.82,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </BentoPanel>
  );
}

interface UserTextPanelProps {
  title: string;
  subtitle?: string;
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  maxTitleLines?: number;
  maxSubtitleLines?: number;
  titleSize?: number;
  subtitleSize?: number;
}

export function UserTextPanel({
  title,
  subtitle,
  theme,
  className = '',
  style,
  maxTitleLines = 3,
  maxSubtitleLines = 3,
  titleSize = 22,
  subtitleSize = 14,
}: UserTextPanelProps) {
  return (
    <BentoPanel className={`p-4 flex flex-col justify-center ${className}`} style={style}>
      <h2
        style={{
          fontSize: titleSize,
          fontWeight: 600,
          lineHeight: 1.24,
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
            fontSize: subtitleSize,
            lineHeight: 1.48,
            color: 'hsl(220,10%,58%)',
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

interface MetaPanelProps {
  cardType: string;
  timeAnchor?: string;
  domain?: string;
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function MetaPanel({ cardType, timeAnchor, domain, theme, className = '', style, compact }: MetaPanelProps) {
  return (
    <BentoPanel className={`p-3.5 flex flex-col justify-center ${className}`} style={style}>
      <div
        style={{
          fontSize: compact ? 9 : 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 5,
        }}
      >
        {cardType.replace(/_/g, ' ')}
      </div>
      {timeAnchor && (
        <div style={{ fontSize: compact ? 11 : 12, color: 'hsl(220,10%,48%)', fontFamily: '"Poppins", sans-serif' }}>
          {timeAnchor}
        </div>
      )}
      {domain && (
        <div
          style={{
            fontSize: 10,
            color: 'hsl(220,10%,43%)',
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

interface MomentumPanelProps {
  statValue?: string;
  statLabel?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  phrase: string;
  theme: ThemeDefinition;
  showNumbers?: boolean;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function MomentumPanel({
  statValue,
  statLabel,
  secondaryValue,
  secondaryLabel,
  phrase,
  theme,
  showNumbers = true,
  className = '',
  style,
  compact,
}: MomentumPanelProps) {
  return (
    <BentoPanel className={`p-4 flex flex-col justify-center ${className}`} style={style}>
      {statValue && (
        <div className="flex items-baseline gap-2.5 mb-2">
          <span
            style={{
              fontSize: compact ? 30 : 34,
              fontWeight: 700,
              color: theme.accentHex,
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1,
            }}
          >
            {showNumbers ? statValue : '•••'}
          </span>
          {statLabel && (
            <span
              style={{
                fontSize: compact ? 11 : 12,
                fontWeight: 500,
                color: 'hsl(220,10%,54%)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {statLabel}
            </span>
          )}
        </div>
      )}

      {secondaryValue && (
        <div className="flex items-baseline gap-2 mb-2">
          <span style={{ fontSize: compact ? 16 : 18, fontWeight: 600, color: theme.metricHex, fontFamily: '"Playfair Display", serif' }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span
              style={{
                fontSize: 11,
                color: 'hsl(220,10%,47%)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      <p
        style={{
          fontSize: compact ? 10 : 11,
          fontWeight: 500,
          fontStyle: 'italic',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          opacity: 0.74,
          marginTop: statValue ? 4 : 0,
        }}
      >
        {phrase}
      </p>
    </BentoPanel>
  );
}

interface BrandPanelProps {
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function BrandPanel({ theme, className = '', style, compact }: BrandPanelProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      style={{
        padding: compact ? '12px 16px' : '14px 20px',
        borderRadius: '14px',
        background: 'hsla(220,18%,8%,0.72)',
        border: '1px solid hsla(0,0%,100%,0.05)',
        ...style,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: compact ? 22 : 24,
          height: compact ? 22 : 24,
          borderRadius: 7,
          background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
          boxShadow: '0 2px 8px -2px hsla(43,74%,52%,0.3)',
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
      </div>
      <span style={{ fontSize: compact ? 10 : 11, fontWeight: 500, letterSpacing: '0.06em', color: 'hsl(220,10%,48%)' }}>
        Posted from <span style={{ color: theme.accentHex, fontWeight: 600 }}>LifeStack</span>
      </span>
    </div>
  );
}
