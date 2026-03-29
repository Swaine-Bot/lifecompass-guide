import { useState, useRef, useEffect, useCallback } from 'react';
import type { ThemeDefinition } from '@/services/shareService';

// ── Shared font constant ──
const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';

/**
 * Auto-size text to fill its container without overflow.
 */
function useAutoSizeText(
  text: string | undefined,
  maxFontSize: number,
  minFontSize: number = 8,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || !text) return;

    const parentH = el.parentElement?.clientHeight || el.clientHeight;
    const parentW = el.parentElement?.clientWidth || el.clientWidth;
    if (parentH < 4 || parentW < 4) return;

    let lo = minFontSize;
    let hi = maxFontSize;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = `${mid}px`;
      if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    setFontSize(lo);
    el.style.fontSize = `${lo}px`;
  }, [text, maxFontSize, minFontSize]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        requestAnimationFrame(measure);
      });
      ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
    };
  }, [measure]);

  return { ref, fontSize };
}

// ── Panel wrapper — Premium Sculpted Glass ──

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  tier?: 'hero' | 'secondary' | 'tertiary';
}

/**
 * Premium panel — sculpted obsidian glass with internal light behavior.
 * Matches the canvas renderer's drawPanelBackground aesthetic.
 */
export function BentoPanel({ children, className = '', style, glowColor, tier = 'secondary' }: PanelProps) {
  const fillAlpha = tier === 'hero' ? 0.52 : tier === 'secondary' ? 0.44 : 0.36;
  const borderAlpha = tier === 'hero' ? 0.14 : tier === 'secondary' ? 0.10 : 0.06;

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: `linear-gradient(155deg, 
          rgba(24, 30, 44, ${fillAlpha * 0.9}) 0%, 
          rgba(16, 22, 38, ${fillAlpha}) 50%, 
          rgba(10, 14, 32, ${fillAlpha * 1.05}) 100%)`,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: 'solid',
        borderImage: `linear-gradient(to bottom, 
          rgba(255,255,255,${borderAlpha}), 
          rgba(255,255,255,${borderAlpha * 0.4}), 
          rgba(255,255,255,${borderAlpha * 0.15})) 1`,
        borderImageSlice: 1,
        boxShadow: glowColor
          ? `0 4px 24px -8px ${glowColor}, inset 0 1px 0 rgba(255,255,255,${borderAlpha * 0.5})`
          : `0 4px 24px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,${borderAlpha * 0.5})`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Internal light highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,${tier === 'hero' ? 0.06 : 0.03}) 0%, transparent 40%)`,
          borderRadius: 'inherit',
        }}
      />
      <div className="relative">{children}</div>
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

export function MediaPanel({ url, urls, isVideo, isAudio, showCount = true, className = '', style }: MediaPanelProps) {
  const [failed, setFailed] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const imageCount = urls?.length || (url ? 1 : 0);
  const mediaType = url ? detectMediaType(url) : 'image';
  const isMediaVideo = isVideo || mediaType === 'video';
  const isMediaAudio = isAudio || mediaType === 'audio';

  if (!url || failed) {
    return (
      <BentoPanel className={`flex items-center justify-center ${className}`} tier="tertiary" style={{ minHeight: 60, ...style }}>
        <div className="text-center opacity-25 py-3">
          <span style={{ fontSize: 20 }}>📷</span>
          <div style={{ fontSize: 9, color: 'hsl(220,10%,35%)', fontFamily: FONT_FAMILY, letterSpacing: '0.08em', marginTop: 4 }}>
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
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: FONT_FAMILY,
        color: 'hsl(0,0%,92%)',
      }}
    >
      +{imageCount - 1}
    </div>
  );

  // Audio: compact waveform layout
  if (isMediaAudio) {
    return (
      <BentoPanel className={`flex items-center gap-3 ${className}`} tier="secondary" style={{ padding: '12px 14px', ...style }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, hsla(43,74%,52%,0.10) 0%, hsla(43,74%,52%,0.03) 100%)',
            border: '1.5px solid hsla(43,74%,52%,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 16 }}>🎙️</span>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-end gap-[2px]" style={{ height: 18 }}>
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                style={{
                  width: 2.5, borderRadius: 4, flexShrink: 0, flex: '1 0 0',
                  height: `${4 + ((i * 7 + 3) % 13)}px`,
                  background: `hsla(43,74%,52%,${0.15 + ((i * 3) % 5) * 0.05})`,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 8, color: 'hsl(220,10%,45%)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: FONT_FAMILY }}>
            Voice Note
          </span>
        </div>
      </BentoPanel>
    );
  }

  const hasExplicitHeight = style?.height !== undefined;

  return (
    <BentoPanel className={`relative ${className}`} tier="secondary" style={{ ...style }}>
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
            height: hasExplicitHeight ? '100%' : undefined,
            aspectRatio: !hasExplicitHeight && naturalAspect ? `${naturalAspect}` : undefined,
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
            height: hasExplicitHeight ? '100%' : undefined,
            aspectRatio: !hasExplicitHeight && naturalAspect ? `${naturalAspect}` : undefined,
            objectFit: 'cover',
          }}
        />
      )}

      {/* Play button overlay for video */}
      {isMediaVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: 'hsl(0,0%,96%)', marginLeft: 2 }}>▶</span>
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
  const { ref } = useAutoSizeText(insight, maxFont, 8);

  return (
    <BentoPanel
      className={`flex flex-col ${className}`}
      tier="secondary"
      glowColor={`hsla(43,74%,52%,0.05)`}
      style={{ padding: '12px 14px', ...style }}
    >
      {/* Label bar with accent glow */}
      <div className="flex items-center gap-2.5 mb-1.5" style={{ flexShrink: 0 }}>
        <div style={{
          width: 3.5, height: 12, borderRadius: 2,
          background: theme.accentHex, opacity: 0.8,
          boxShadow: `0 0 8px ${theme.accentHex}`,
        }} />
        <span style={{
          fontSize: 7, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: theme.accentHex, opacity: 0.85, fontFamily: FONT_FAMILY,
        }}>
          AI Insight
        </span>
      </div>

      {/* Auto-sized insight text — italic serif */}
      <div
        ref={ref}
        style={{
          flex: '1 1 0', minHeight: 0, overflow: 'hidden',
          fontStyle: 'italic', lineHeight: 1.45,
          color: 'hsl(220,10%,84%)', fontFamily: '"Playfair Display", Georgia, serif',
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
              style={{ fontSize: 7, color: theme.accentHex, textDecoration: 'underline', textUnderlineOffset: '2px', opacity: 0.75, fontFamily: FONT_FAMILY }}
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
  const titleRef = useAutoSizeText(title, maxTitleSize, 10);
  const subRef = useAutoSizeText(subtitle, maxSubtitleSize, 8);

  return (
    <BentoPanel
      className={`flex flex-col ${className}`}
      tier="hero"
      style={{ padding: '12px 14px', ...style }}
    >
      {/* Title — editorial serif */}
      <div
        ref={titleRef.ref}
        style={{
          fontWeight: 700, lineHeight: 1.22, color: theme.headlineHex,
          fontFamily: '"Playfair Display", Georgia, serif',
          overflow: 'hidden', letterSpacing: '0.02em',
          flex: subtitle ? '1 1 0' : '1 1 0', minHeight: 0,
          overflowWrap: 'break-word', wordBreak: 'break-word',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          ref={subRef.ref}
          style={{
            lineHeight: 1.5, color: 'hsl(220,10%,52%)',
            fontFamily: FONT_FAMILY, marginTop: 6,
            overflow: 'hidden', flex: '1.2 1 0', minHeight: 0,
            overflowWrap: 'break-word', wordBreak: 'break-word',
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
  const typeLabel = cardType.replace(/_/g, ' ');
  const { ref: typeRef } = useAutoSizeText(typeLabel, 10, 6);
  const { ref: timeRef } = useAutoSizeText(timeAnchor, 11, 7);

  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      tier="tertiary"
      style={{ padding: '10px 12px', ...style }}
    >
      <div
        ref={typeRef}
        style={{
          fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: theme.accentHex, opacity: 0.75, fontFamily: FONT_FAMILY,
          overflow: 'hidden', lineHeight: 1.3,
        }}
      >
        {typeLabel}
      </div>
      {timeAnchor && (
        <div
          ref={timeRef}
          style={{ color: 'hsl(220,10%,45%)', fontFamily: FONT_FAMILY, marginTop: 3, overflow: 'hidden', lineHeight: 1.3 }}
        >
          {timeAnchor}
        </div>
      )}
      {domain && (
        <div style={{
          fontSize: 7, color: 'hsl(220,10%,38%)', textTransform: 'uppercase',
          letterSpacing: '0.12em', marginTop: 3, fontFamily: FONT_FAMILY,
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
  const displayStat = showNumbers ? statValue : '•••';
  const { ref: statRef } = useAutoSizeText(displayStat, compact ? 24 : 30, 14);
  const { ref: phraseRef } = useAutoSizeText(phrase, compact ? 9 : 10, 6);

  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      tier="secondary"
      glowColor={statValue ? `hsla(43,74%,52%,0.04)` : undefined}
      style={{ padding: compact ? '10px 12px' : '12px 14px', ...style }}
    >
      {statValue && (
        <div className="flex items-baseline gap-2" style={{ flexShrink: 0, marginBottom: 5 }}>
          <div
            ref={statRef}
            style={{
              fontWeight: 700, color: theme.accentHex,
              fontFamily: '"Playfair Display", Georgia, serif',
              lineHeight: 1, letterSpacing: '-0.02em',
              overflow: 'hidden', whiteSpace: 'nowrap',
              textShadow: `0 0 20px ${theme.accentHex}40`,
            }}
          >
            {displayStat}
          </div>
          {statLabel && (
            <span style={{
              fontSize: compact ? 7 : 8, fontWeight: 600, color: 'hsl(220,10%,46%)',
              textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: FONT_FAMILY,
              flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              {statLabel}
            </span>
          )}
        </div>
      )}

      {secondaryValue && (
        <div className="flex items-baseline gap-2" style={{ flexShrink: 0, marginBottom: 4 }}>
          <span style={{ fontSize: compact ? 13 : 16, fontWeight: 600, color: theme.metricHex, fontFamily: FONT_FAMILY, whiteSpace: 'nowrap' }}>
            {showNumbers ? secondaryValue : '•••'}
          </span>
          {secondaryLabel && (
            <span style={{ fontSize: 7, color: 'hsl(220,10%,42%)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: FONT_FAMILY, whiteSpace: 'nowrap' }}>
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      <div
        ref={phraseRef}
        style={{
          fontWeight: 500, fontStyle: 'italic',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: theme.accentHex, opacity: 0.5,
          marginTop: 'auto',
          fontFamily: '"Playfair Display", Georgia, serif',
          overflow: 'hidden', lineHeight: 1.3,
          overflowWrap: 'break-word', wordBreak: 'break-word',
          flexShrink: 0,
        }}
      >
        {phrase}
      </div>
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
  const { ref: labelRef } = useAutoSizeText(label, 12, 8);

  return (
    <BentoPanel
      className={`flex flex-col justify-center ${className}`}
      tier="secondary"
      glowColor={`hsla(43,74%,52%,0.03)`}
      style={{ padding: '10px 12px', ...style }}
    >
      <div className="flex items-center gap-2.5">
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: theme.accentHex,
          boxShadow: `0 0 10px ${theme.accentHex}`,
          opacity: 0.7,
        }} />
        <span
          ref={labelRef}
          style={{
            fontWeight: 600, color: theme.headlineHex, letterSpacing: '0.02em',
            fontFamily: FONT_FAMILY, overflow: 'hidden', lineHeight: 1.3,
            flex: '1 1 0', minWidth: 0,
          }}
        >
          {label}
        </span>
      </div>
      {sublabel && (
        <span style={{ fontSize: 8, color: 'hsl(220,10%,42%)', marginTop: 3, marginLeft: 14, fontFamily: FONT_FAMILY }}>
          {sublabel}
        </span>
      )}
    </BentoPanel>
  );
}

// ── Brand Panel — Elegant Signature ──

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
        borderRadius: 18,
        background: 'linear-gradient(155deg, rgba(18,24,40,0.45) 0%, rgba(10,14,28,0.35) 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden', flexShrink: 0,
        ...style,
      }}
    >
      {/* Premium LS icon with glow */}
      <div
        style={{
          width: compact ? 18 : 22, height: compact ? 18 : 22, borderRadius: 6, flexShrink: 0,
          background: 'linear-gradient(135deg, hsl(43,74%,58%) 0%, hsl(40,65%,40%) 100%)',
          boxShadow: '0 3px 12px -3px hsla(43,74%,52%,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: compact ? 5 : 6, fontWeight: 800, color: 'hsl(220,25%,8%)', letterSpacing: '0.06em', fontFamily: FONT_FAMILY }}>LS</span>
      </div>
      <span style={{
        fontSize: compact ? 8 : 9, fontWeight: 300, letterSpacing: '0.06em',
        color: 'hsl(220,10%,40%)', fontFamily: FONT_FAMILY,
      }}>
        Posted from{' '}
        <span style={{
          color: theme.accentHex,
          fontWeight: 600,
          fontFamily: '"Playfair Display", Georgia, serif',
          letterSpacing: '0.04em',
          opacity: 0.65,
        }}>
          LifeStack
        </span>
      </span>
    </div>
  );
}
