import { useState } from 'react';
import type { ThemeDefinition } from '@/services/shareService';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Optional subtle glow color */
  glowColor?: string;
}

function detectMediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|mov|webm|avi|m4v)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(url)) return 'audio';
  return 'image';
}

/**
 * Base panel — Premium dark glass card with soft border glow.
 * Every panel enforces overflow:hidden so no content bleeds.
 */
export function BentoPanel({ children, className = '', style, glowColor }: PanelProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(145deg, hsla(220,20%,12%,0.82) 0%, hsla(220,18%,9%,0.76) 100%)',
        borderRadius: '16px',
        border: '1px solid hsla(0,0%,100%,0.06)',
        boxShadow: glowColor
          ? `0 4px 24px -8px ${glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.04)`
          : '0 4px 24px -8px hsla(0,0%,0%,0.4), inset 0 1px 0 hsla(0,0%,100%,0.04)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Media Panel ──────────────────────────────────────────────

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
      <BentoPanel className={`flex items-center justify-center ${className}`} style={{ minHeight: 80, ...style }}>
        <div className="text-center opacity-30">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2"
            style={{ background: 'hsla(0,0%,100%,0.04)', border: '1px solid hsla(0,0%,100%,0.06)' }}
          >
            <span className="text-xl">📷</span>
          </div>
          <span style={{ fontSize: 10, color: 'hsl(220,10%,38%)', letterSpacing: '0.05em' }}>No media</span>
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
              'linear-gradient(160deg, hsla(220,26%,14%,0.92) 0%, hsla(220,18%,8%,0.86) 60%, hsla(220,20%,5%,0.94) 100%)',
          }}
        >
          {/* Premium play button */}
          <div
            className="flex items-center justify-center mb-5"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsla(43,74%,52%,0.15) 0%, hsla(43,74%,52%,0.06) 100%)',
              border: '1.5px solid hsla(43,74%,52%,0.3)',
              boxShadow: '0 0 24px -4px hsla(43,74%,52%,0.15)',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1, color: 'hsl(43,74%,52%)' }}>🎙️</span>
          </div>
          {/* Waveform */}
          <div className="flex items-end gap-[3px] px-8" style={{ height: 28 }}>
            {[...Array(22)].map((_, i) => (
              <span
                key={i}
                style={{
                  width: 2.5,
                  height: `${6 + ((i * 7 + 3) % 18)}px`,
                  borderRadius: 4,
                  background: `hsla(43,74%,52%,${0.18 + ((i * 3) % 5) * 0.06})`,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 9, color: 'hsl(220,10%,50%)', letterSpacing: '0.12em', marginTop: 10, textTransform: 'uppercase' }}>
            Voice Note
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

      {/* Premium play indicator for video */}
      {isMediaVideo && !isMediaAudio && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'hsla(0,0%,0%,0.48)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid hsla(0,0%,100%,0.18)',
              boxShadow: '0 8px 32px -8px hsla(0,0%,0%,0.5)',
            }}
          >
            <span style={{ fontSize: 18, color: 'hsl(0,0%,96%)', marginLeft: 3 }}>▶</span>
          </div>
        </div>
      )}

      {showCount && imageCount > 1 && (
        <div
          className="absolute top-3 right-3"
          style={{
            padding: '4px 12px',
            borderRadius: 100,
            background: 'hsla(0,0%,0%,0.52)',
            backdropFilter: 'blur(8px)',
            border: '1px solid hsla(0,0%,100%,0.1)',
            fontSize: 10,
            fontWeight: 600,
            color: 'hsl(0,0%,92%)',
            letterSpacing: '0.02em',
          }}
        >
          +{imageCount - 1}
        </div>
      )}
    </BentoPanel>
  );
}

// ── Insight Panel ──────────────────────────────────────────────

interface InsightPanelProps {
  insight: string;
  links?: { label: string; url: string }[];
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  fullText?: boolean;
}

function computeInsightFontSize(
  insightLen: number,
  baseFontSize: number,
): { fontSize: number; lineHeight: number; maxLines: number } {
  if (insightLen < 80) {
    return { fontSize: Math.min(baseFontSize, 18), lineHeight: 1.55, maxLines: 4 };
  }
  if (insightLen < 160) {
    return { fontSize: Math.min(baseFontSize, 15), lineHeight: 1.5, maxLines: 6 };
  }
  if (insightLen < 300) {
    return { fontSize: Math.min(baseFontSize, 13.5), lineHeight: 1.44, maxLines: 10 };
  }
  if (insightLen < 500) {
    return { fontSize: Math.min(baseFontSize, 12), lineHeight: 1.38, maxLines: 16 };
  }
  return { fontSize: Math.min(baseFontSize, 11), lineHeight: 1.34, maxLines: 22 };
}

export function InsightPanel({
  insight,
  links,
  theme,
  className = '',
  style,
  fontSize: baseFontSize = 15,
  fullText = false,
}: InsightPanelProps) {
  const { fontSize, lineHeight, maxLines } = computeInsightFontSize(insight.length, baseFontSize);

  return (
    <BentoPanel
      className={`flex flex-col ${className}`}
      glowColor={`hsla(43,74%,52%,0.06)`}
      style={{
        ...style,
        padding: '14px 16px',
      }}
    >
      {/* Label bar */}
      <div
        className="flex items-center gap-2 mb-2"
        style={{ flexShrink: 0 }}
      >
        <div
          style={{
            width: 3,
            height: 14,
            borderRadius: 2,
            background: theme.accentHex,
            opacity: 0.7,
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: theme.accentHex,
            opacity: 0.85,
          }}
        >
          AI Insight
        </span>
      </div>

      {/* Insight text */}
      <p
        style={{
          fontSize,
          fontStyle: 'italic',
          lineHeight,
          color: 'hsl(220,10%,86%)',
          fontFamily: '"Playfair Display", serif',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical' as const,
          flex: '1 1 0',
          minHeight: 0,
        }}
      >
        {insight}
      </p>

      {links?.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2" style={{ flexShrink: 0 }}>
          {links.slice(0, 3).map((link, index) => (
            <a
              key={`${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                fontSize: 9,
                color: theme.accentHex,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                opacity: 0.8,
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

// ── User Text Panel ──────────────────────────────────────────────

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
  const totalLen = title.length + (subtitle?.length || 0);
  let effectiveTitleSize = titleSize;
  let effectiveSubSize = subtitleSize;

  if (totalLen > 200) {
    effectiveTitleSize = Math.max(14, titleSize - 4);
    effectiveSubSize = Math.max(11, subtitleSize - 2);
  } else if (totalLen > 120) {
    effectiveTitleSize = Math.max(16, titleSize - 2);
    effectiveSubSize = Math.max(12, subtitleSize - 1);
  }

  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      style={{
        ...style,
        padding: '14px 16px',
      }}
    >
      <h2
        style={{
          fontSize: effectiveTitleSize,
          fontWeight: 600,
          lineHeight: 1.26,
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
            fontSize: effectiveSubSize,
            lineHeight: 1.48,
            color: 'hsl(220,10%,56%)',
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

// ── Meta Panel ──────────────────────────────────────────────

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
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      style={{ ...style, padding: compact ? '10px 14px' : '14px 16px' }}
    >
      <div
        style={{
          fontSize: compact ? 8 : 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          opacity: 0.75,
          marginBottom: 4,
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
            fontSize: 9,
            color: 'hsl(220,10%,40%)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: 3,
          }}
        >
          {domain}
        </div>
      )}
    </BentoPanel>
  );
}

// ── Momentum Panel ──────────────────────────────────────────────

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
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      glowColor={statValue ? `hsla(43,74%,52%,0.05)` : undefined}
      style={{ ...style, padding: compact ? '10px 14px' : '14px 18px' }}
    >
      {statValue && (
        <div className="flex items-baseline gap-2 mb-1">
          <span
            style={{
              fontSize: compact ? 28 : 34,
              fontWeight: 700,
              color: theme.accentHex,
              fontFamily: '"Playfair Display", serif',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {showNumbers ? statValue : '•••'}
          </span>
          {statLabel && (
            <span
              style={{
                fontSize: compact ? 9 : 10,
                fontWeight: 600,
                color: 'hsl(220,10%,50%)',
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
        <div className="flex items-baseline gap-2 mb-1">
          <span style={{ fontSize: compact ? 15 : 18, fontWeight: 600, color: theme.metricHex, fontFamily: '"Playfair Display", serif' }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span style={{ fontSize: 9, color: 'hsl(220,10%,44%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      <p
        style={{
          fontSize: compact ? 9 : 10,
          fontWeight: 500,
          fontStyle: 'italic',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          opacity: 0.6,
          marginTop: statValue ? 4 : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {phrase}
      </p>
    </BentoPanel>
  );
}

// ── Milestone / Life Phase Panel ──────────────────────────────

interface MilestonePanelProps {
  label: string;
  sublabel?: string;
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
}

export function MilestonePanel({ label, sublabel, theme, className = '', style }: MilestonePanelProps) {
  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      glowColor={`hsla(43,74%,52%,0.04)`}
      style={{ ...style, padding: '12px 14px' }}
    >
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: theme.accentHex,
            boxShadow: `0 0 8px ${theme.accentHex}`,
            opacity: 0.7,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: theme.headlineHex,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      </div>
      {sublabel && (
        <span
          style={{
            fontSize: 9,
            color: 'hsl(220,10%,44%)',
            marginTop: 3,
            marginLeft: 14,
            letterSpacing: '0.04em',
          }}
        >
          {sublabel}
        </span>
      )}
    </BentoPanel>
  );
}

// ── Brand Panel ──────────────────────────────────────────────

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
        padding: compact ? '10px 16px' : '12px 20px',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, hsla(220,20%,10%,0.8) 0%, hsla(220,18%,7%,0.72) 100%)',
        border: '1px solid hsla(0,0%,100%,0.05)',
        boxShadow: 'inset 0 1px 0 hsla(0,0%,100%,0.03)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: compact ? 20 : 24,
          height: compact ? 20 : 24,
          borderRadius: 7,
          background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
          boxShadow: '0 2px 10px -2px hsla(43,74%,52%,0.35)',
        }}
      >
        <span style={{ fontSize: compact ? 7 : 8, fontWeight: 800, color: 'hsl(220,20%,6%)', letterSpacing: '0.06em' }}>LS</span>
      </div>
      <span style={{
        fontSize: compact ? 10 : 11,
        fontWeight: 500,
        letterSpacing: '0.05em',
        color: 'hsl(220,10%,44%)',
      }}>
        Posted from <span style={{ color: theme.accentHex, fontWeight: 600 }}>LifeStack</span>
      </span>
    </div>
  );
}
