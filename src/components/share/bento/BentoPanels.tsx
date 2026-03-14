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

/**
 * Base panel — RULE 1: every panel enforces overflow:hidden
 * so no child content can bleed outside panel bounds.
 */
export function BentoPanel({ children, className = '', style }: PanelProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'hsla(220,18%,10%,0.68)',
        borderRadius: '14px',
        border: '1px solid hsla(0,0%,100%,0.07)',
        boxShadow: '0 8px 24px -16px hsla(0,0%,0%,0.58)',
        overflow: 'hidden',          // RULE 1 — hard boundary
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

// ── Insight Panel ──────────────────────────────────────────────
// RULE 3: Content-aware font scaling.  Never overflow.

interface InsightPanelProps {
  insight: string;
  links?: { label: string; url: string }[];
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  fullText?: boolean;
}

/**
 * Compute a font size that lets the insight text fit
 * within the panel.  We estimate lines from character count
 * and a rough chars-per-line value, then scale down if needed.
 *
 * RULE 3 — AI insight priority logic:
 *   short  → larger font, elegant
 *   medium → smaller font, full visibility
 *   long   → smallest font, tighter line-height, line clamp as last resort
 */
function computeInsightFontSize(
  insightLen: number,
  baseFontSize: number,
): { fontSize: number; lineHeight: number; maxLines: number } {
  // Bracket by length
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
  // Very long
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
      style={{
        ...style,
        // Inner padding handled here so the panel boundary is the BentoPanel edge
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 6,
          flexShrink: 0,
        }}
      >
        AI INSIGHT
      </div>

      {/* RULE 1+3: text is clamped and overflow hidden — never bleeds */}
      <p
        style={{
          fontSize,
          fontStyle: 'italic',
          lineHeight,
          color: 'hsl(220,10%,84%)',
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

// ── User Text Panel ──────────────────────────────────────────────
// RULE 4: title + body must fit.  Content-aware font scaling.

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
  // RULE 4 — content-aware scaling for title
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
        padding: '12px 14px',
      }}
    >
      <h2
        style={{
          fontSize: effectiveTitleSize,
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
            fontSize: effectiveSubSize,
            lineHeight: 1.44,
            color: 'hsl(220,10%,58%)',
            fontFamily: '"Poppins", sans-serif',
            marginTop: 6,
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
      style={{ ...style, padding: compact ? '10px 12px' : '12px 14px' }}
    >
      <div
        style={{
          fontSize: compact ? 9 : 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          marginBottom: 3,
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
      style={{ ...style, padding: compact ? '10px 14px' : '14px 18px' }}
    >
      {statValue && (
        <div className="flex items-baseline gap-2 mb-1">
          <span
            style={{
              fontSize: compact ? 26 : 30,
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
                fontSize: compact ? 10 : 11,
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
        <div className="flex items-baseline gap-2 mb-1">
          <span style={{ fontSize: compact ? 14 : 16, fontWeight: 600, color: theme.metricHex, fontFamily: '"Playfair Display", serif' }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span style={{ fontSize: 10, color: 'hsl(220,10%,47%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.accentHex,
          opacity: 0.74,
          marginTop: statValue ? 2 : 0,
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
        padding: compact ? '10px 14px' : '12px 18px',
        borderRadius: '14px',
        background: 'hsla(220,18%,8%,0.72)',
        border: '1px solid hsla(0,0%,100%,0.05)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: compact ? 20 : 22,
          height: compact ? 20 : 22,
          borderRadius: 6,
          background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
          boxShadow: '0 2px 8px -2px hsla(43,74%,52%,0.3)',
        }}
      >
        <span style={{ fontSize: 7, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
      </div>
      <span style={{ fontSize: compact ? 10 : 11, fontWeight: 500, letterSpacing: '0.06em', color: 'hsl(220,10%,48%)' }}>
        Posted from <span style={{ color: theme.accentHex, fontWeight: 600 }}>LifeStack</span>
      </span>
    </div>
  );
}
