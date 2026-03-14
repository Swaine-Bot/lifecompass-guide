import { useState, useRef, useEffect } from 'react';
import type { ThemeDefinition } from '@/services/shareService';

// ── Shared font constant ──
const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';

/**
 * Auto-size text to fill its container.
 * Starts at maxFontSize and shrinks until text fits without overflow.
 */
function useAutoSizeText(
  text: string | undefined,
  maxFontSize: number,
  minFontSize: number = 8,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;

    // Reset to max to measure
    let size = maxFontSize;
    el.style.fontSize = `${size}px`;

    // Binary search for fitting size
    let lo = minFontSize;
    let hi = maxFontSize;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}px`;
      if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    setFontSize(lo);
    el.style.fontSize = `${lo}px`;
  }, [text, maxFontSize, minFontSize]);

  return { ref, fontSize };
}

// ── Panel wrapper ──

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
}

/**
 * Base panel — clean dark glass card. Every element gets its own box.
 */
export function BentoPanel({ children, className = '', style, glowColor }: PanelProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(145deg, hsla(220,20%,12%,0.82) 0%, hsla(220,18%,9%,0.76) 100%)',
        borderRadius: 14,
        border: '1px solid hsla(0,0%,100%,0.07)',
        boxShadow: glowColor
          ? `0 2px 16px -6px ${glowColor}, inset 0 1px 0 hsla(0,0%,100%,0.04)`
          : '0 2px 16px -6px hsla(0,0%,0%,0.35), inset 0 1px 0 hsla(0,0%,100%,0.04)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Media Panel ──

function detectMediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|mov|webm|avi|m4v)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(url)) return 'audio';
  return 'image';
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

/**
 * Media panel that wraps tightly around its content.
 * Images/videos use object-fit: contain so no cropping, and the panel
 * shrinks to fit rather than leaving dead space.
 */
export function MediaPanel({ url, urls, isVideo, isAudio, showCount = true, className = '', style }: MediaPanelProps) {
  const [failed, setFailed] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const imageCount = urls?.length || (url ? 1 : 0);
  const mediaType = url ? detectMediaType(url) : 'image';
  const isMediaVideo = isVideo || mediaType === 'video';
  const isMediaAudio = isAudio || mediaType === 'audio';

  if (!url || failed) {
    return (
      <BentoPanel className={`flex items-center justify-center ${className}`} style={{ minHeight: 60, ...style }}>
        <div className="text-center opacity-30 py-3">
          <span style={{ fontSize: 20 }}>📷</span>
          <div style={{ fontSize: 9, color: 'hsl(220,10%,38%)', fontFamily: FONT_FAMILY, letterSpacing: '0.05em', marginTop: 4 }}>
            No media
          </div>
        </div>
      </BentoPanel>
    );
  }

  const countBadge = showCount && imageCount > 1 && (
    <div
      className="absolute top-2.5 right-2.5"
      style={{
        padding: '3px 10px',
        borderRadius: 100,
        background: 'hsla(0,0%,0%,0.55)',
        backdropFilter: 'blur(8px)',
        border: '1px solid hsla(0,0%,100%,0.1)',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: FONT_FAMILY,
        color: 'hsl(0,0%,92%)',
      }}
    >
      +{imageCount - 1}
    </div>
  );

  // Audio: fixed compact layout
  if (isMediaAudio) {
    return (
      <BentoPanel className={`flex items-center gap-3 ${className}`} style={{ padding: '14px 16px', ...style }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, hsla(43,74%,52%,0.12) 0%, hsla(43,74%,52%,0.04) 100%)',
            border: '1.5px solid hsla(43,74%,52%,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>🎙️</span>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-end gap-[2px]" style={{ height: 20 }}>
            {[...Array(18)].map((_, i) => (
              <span
                key={i}
                style={{
                  width: 2.5, borderRadius: 4, flexShrink: 0,
                  height: `${5 + ((i * 7 + 3) % 14)}px`,
                  background: `hsla(43,74%,52%,${0.2 + ((i * 3) % 5) * 0.06})`,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 9, color: 'hsl(220,10%,50%)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: FONT_FAMILY }}>
            Voice Note
          </span>
        </div>
      </BentoPanel>
    );
  }

  // Image/Video: tight-wrapping panel
  return (
    <BentoPanel className={`relative ${className}`} style={{ ...style }}>
      {isMediaVideo ? (
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) {
              setNaturalAspect(v.videoWidth / v.videoHeight);
            }
          }}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <img
          src={url}
          alt=""
          onError={() => setFailed(true)}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setNaturalAspect(img.naturalWidth / img.naturalHeight);
            }
          }}
          crossOrigin="anonymous"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Play button overlay for video */}
      {isMediaVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'hsla(0,0%,0%,0.5)', backdropFilter: 'blur(12px)',
              border: '1.5px solid hsla(0,0%,100%,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 16, color: 'hsl(0,0%,96%)', marginLeft: 2 }}>▶</span>
          </div>
        </div>
      )}

      {countBadge}
    </BentoPanel>
  );
}

// ── Insight Panel ──

interface InsightPanelProps {
  insight: string;
  links?: { label: string; url: string }[];
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
}

export function InsightPanel({
  insight,
  links,
  theme,
  className = '',
  style,
  fontSize: maxFont = 16,
}: InsightPanelProps) {
  const { ref } = useAutoSizeText(insight, maxFont, 9);

  return (
    <BentoPanel
      className={`flex flex-col ${className}`}
      glowColor={`hsla(43,74%,52%,0.06)`}
      style={{ padding: '12px 14px', ...style }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-1.5" style={{ flexShrink: 0 }}>
        <div style={{ width: 3, height: 12, borderRadius: 2, background: theme.accentHex, opacity: 0.7 }} />
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: theme.accentHex, opacity: 0.85, fontFamily: FONT_FAMILY,
        }}>
          AI Insight
        </span>
      </div>

      {/* Auto-sized text */}
      <div
        ref={ref}
        style={{
          flex: '1 1 0', minHeight: 0, overflow: 'hidden',
          fontStyle: 'italic', lineHeight: 1.45,
          color: 'hsl(220,10%,86%)', fontFamily: FONT_FAMILY,
          overflowWrap: 'break-word', wordBreak: 'break-word',
        }}
      >
        {insight}
      </div>

      {links?.length ? (
        <div className="flex flex-wrap gap-1.5 mt-1.5" style={{ flexShrink: 0 }}>
          {links.slice(0, 3).map((link, i) => (
            <a
              key={`${link.url}-${i}`}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{ fontSize: 8, color: theme.accentHex, textDecoration: 'underline', textUnderlineOffset: '2px', opacity: 0.8, fontFamily: FONT_FAMILY }}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </BentoPanel>
  );
}

// ── User Text Panel ──

interface UserTextPanelProps {
  title: string;
  subtitle?: string;
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  maxTitleSize?: number;
  maxSubtitleSize?: number;
}

export function UserTextPanel({
  title,
  subtitle,
  theme,
  className = '',
  style,
  maxTitleSize = 22,
  maxSubtitleSize = 14,
}: UserTextPanelProps) {
  const titleRef = useAutoSizeText(title, maxTitleSize, 12);
  const subRef = useAutoSizeText(subtitle, maxSubtitleSize, 9);

  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      style={{ padding: '12px 14px', ...style }}
    >
      <div
        ref={titleRef.ref}
        style={{
          fontWeight: 600, lineHeight: 1.28, color: theme.headlineHex,
          fontFamily: FONT_FAMILY, overflow: 'hidden',
          flex: subtitle ? '0 1 auto' : '1 1 0', minHeight: 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          ref={subRef.ref}
          style={{
            lineHeight: 1.45, color: 'hsl(220,10%,56%)',
            fontFamily: FONT_FAMILY, marginTop: 6,
            overflow: 'hidden', flex: '1 1 0', minHeight: 0,
          }}
        >
          {subtitle}
        </div>
      )}
    </BentoPanel>
  );
}

// ── Meta Panel ──

interface MetaPanelProps {
  cardType: string;
  timeAnchor?: string;
  domain?: string;
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
}

export function MetaPanel({ cardType, timeAnchor, domain, theme, className = '', style }: MetaPanelProps) {
  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      style={{ padding: '10px 12px', ...style }}
    >
      <div style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: theme.accentHex, opacity: 0.75, fontFamily: FONT_FAMILY, marginBottom: 3,
      }}>
        {cardType.replace(/_/g, ' ')}
      </div>
      {timeAnchor && (
        <div style={{ fontSize: 11, color: 'hsl(220,10%,48%)', fontFamily: FONT_FAMILY }}>
          {timeAnchor}
        </div>
      )}
      {domain && (
        <div style={{
          fontSize: 8, color: 'hsl(220,10%,40%)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginTop: 2, fontFamily: FONT_FAMILY,
        }}>
          {domain}
        </div>
      )}
    </BentoPanel>
  );
}

// ── Momentum Panel ──

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
  statValue, statLabel, secondaryValue, secondaryLabel,
  phrase, theme, showNumbers = true, className = '', style, compact,
}: MomentumPanelProps) {
  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      glowColor={statValue ? `hsla(43,74%,52%,0.05)` : undefined}
      style={{ padding: compact ? '10px 12px' : '12px 14px', ...style }}
    >
      {statValue && (
        <div className="flex items-baseline gap-2 mb-1">
          <span style={{
            fontSize: compact ? 26 : 32, fontWeight: 700, color: theme.accentHex,
            fontFamily: FONT_FAMILY, lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {showNumbers ? statValue : '•••'}
          </span>
          {statLabel && (
            <span style={{
              fontSize: compact ? 8 : 9, fontWeight: 600, color: 'hsl(220,10%,50%)',
              textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT_FAMILY,
            }}>
              {statLabel}
            </span>
          )}
        </div>
      )}

      {secondaryValue && (
        <div className="flex items-baseline gap-2 mb-1">
          <span style={{ fontSize: compact ? 14 : 17, fontWeight: 600, color: theme.metricHex, fontFamily: FONT_FAMILY }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span style={{ fontSize: 8, color: 'hsl(220,10%,44%)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT_FAMILY }}>
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      <p style={{
        fontSize: compact ? 8 : 9, fontWeight: 500, fontStyle: 'italic',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: theme.accentHex, opacity: 0.6,
        marginTop: statValue ? 3 : 0, fontFamily: FONT_FAMILY,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {phrase}
      </p>
    </BentoPanel>
  );
}

// ── Milestone Panel ──

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
      style={{ padding: '10px 12px', ...style }}
    >
      <div className="flex items-center gap-2">
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: theme.accentHex, boxShadow: `0 0 8px ${theme.accentHex}`, opacity: 0.7,
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.headlineHex, letterSpacing: '0.02em', fontFamily: FONT_FAMILY }}>
          {label}
        </span>
      </div>
      {sublabel && (
        <span style={{ fontSize: 9, color: 'hsl(220,10%,44%)', marginTop: 2, marginLeft: 14, fontFamily: FONT_FAMILY }}>
          {sublabel}
        </span>
      )}
    </BentoPanel>
  );
}

// ── Brand Panel ──

interface BrandPanelProps {
  theme: ThemeDefinition;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function BrandPanel({ theme, className = '', style, compact }: BrandPanelProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2.5 ${className}`}
      style={{
        padding: compact ? '8px 14px' : '10px 18px',
        borderRadius: 14,
        background: 'linear-gradient(145deg, hsla(220,20%,10%,0.8) 0%, hsla(220,18%,7%,0.72) 100%)',
        border: '1px solid hsla(0,0%,100%,0.05)',
        overflow: 'hidden', flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          width: compact ? 18 : 22, height: compact ? 18 : 22, borderRadius: 6, flexShrink: 0,
          background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
          boxShadow: '0 2px 8px -2px hsla(43,74%,52%,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: compact ? 6 : 7, fontWeight: 800, color: 'hsl(220,20%,6%)', letterSpacing: '0.06em', fontFamily: FONT_FAMILY }}>LS</span>
      </div>
      <span style={{
        fontSize: compact ? 9 : 10, fontWeight: 500, letterSpacing: '0.04em',
        color: 'hsl(220,10%,44%)', fontFamily: FONT_FAMILY,
      }}>
        Posted from <span style={{ color: theme.accentHex, fontWeight: 600 }}>LifeStack</span>
      </span>
    </div>
  );
}
