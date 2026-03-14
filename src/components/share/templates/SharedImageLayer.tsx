import { useState, type CSSProperties } from 'react';
import type { ImageLayout } from '@/services/shareService';
import lifestackLogo from '@/assets/lifestack-logo-mark.png';

/** Detect media type from URL */
export function detectMediaType(url: string): 'image' | 'video' | 'audio' {
  if (/\.(mp4|mov|webm|avi)/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|webm)/i.test(url)) return 'audio';
  return 'image';
}

function CountBadge({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <div
      className="absolute top-3 right-3 px-2 py-0.5 rounded-full z-10"
      style={{
        background: 'hsla(0,0%,0%,0.6)',
        color: 'hsla(0,0%,100%,0.9)',
        fontSize: 10,
        fontWeight: 600,
        backdropFilter: 'blur(4px)',
      }}
    >
      +{count - 1} more
    </div>
  );
}

/**
 * SAFE TEXT STYLE — prevents text from being cut off.
 * Uses word-wrap and overflow-wrap instead of line-clamp for safety.
 * Line-clamp is only used when explicitly needed with proper padding.
 */
export function getClampStyle(maxLines: number, lineHeight: number, overrides: CSSProperties = {}): CSSProperties {
  return {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    lineHeight,
    // Extra bottom padding prevents descender/last-line clipping
    paddingBottom: '0.2em',
    overflowWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    hyphens: 'auto' as const,
    ...overrides,
  };
}

/** Play button overlay for video/audio media */
export function PlayOverlay({ mediaType, size = 'lg' }: { mediaType: 'video' | 'audio'; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 56 : 40;
  const iconSize = size === 'lg' ? 22 : 16;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: dim, height: dim,
          background: 'hsla(0,0%,0%,0.55)',
          backdropFilter: 'blur(12px)',
          border: '2px solid hsla(0,0%,100%,0.25)',
          boxShadow: '0 4px 24px hsla(0,0%,0%,0.4)',
        }}
      >
        {mediaType === 'video' ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" fill="hsla(0,0%,100%,0.9)" />
          </svg>
        ) : (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="hsla(0,0%,100%,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0118 0v6" />
            <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
          </svg>
        )}
      </div>
      {mediaType === 'audio' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-[2px]">
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              width: 2,
              height: 4 + Math.sin(i * 0.7) * 8 + Math.random() * 4,
              borderRadius: 1,
              background: 'hsla(0,0%,100%,0.35)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Media type badge */
export function MediaTypeBadge({ mediaType }: { mediaType: 'video' | 'audio' }) {
  return (
    <div
      className="absolute top-3 left-3 px-2 py-0.5 rounded-full z-10"
      style={{
        background: 'hsla(0,0%,0%,0.6)',
        color: 'hsla(0,0%,100%,0.85)',
        fontSize: 9, fontWeight: 600,
        backdropFilter: 'blur(4px)',
        letterSpacing: '0.05em',
      }}
    >
      {mediaType === 'video' ? '🎬 Video' : '🎙️ Audio'}
    </div>
  );
}

/**
 * HERO IMAGE — media dominates the card (65-70% of card height).
 * Uses object-fit: contain to preserve aspect ratio.
 */
export function HeroImage({ url, imageCount, showCount, onError, heroRatio = 0.48 }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void; heroRatio?: number;
}) {
  const mediaType = detectMediaType(url);
  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{
        flex: `0 0 ${Math.round(heroRatio * 100)}%`,
        minHeight: 80,
        background: 'hsla(0,0%,0%,0.12)',
      }}
    >
      <img
        src={url} alt="" onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'contain', display: 'block', maxHeight: '100%' }}
        crossOrigin="anonymous"
      />
      {mediaType !== 'image' && <PlayOverlay mediaType={mediaType} size="lg" />}
      {mediaType !== 'image' && <MediaTypeBadge mediaType={mediaType} />}
      {showCount && <CountBadge count={imageCount} />}
    </div>
  );
}

/**
 * SPLIT IMAGE — true 50/50 side-by-side layout.
 */
export function SplitImage({ url, imageCount, showCount, onError }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void;
}) {
  const mediaType = detectMediaType(url);
  return (
    <div
      className="relative overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: '50%', minHeight: 0, background: 'hsla(0,0%,0%,0.12)' }}
    >
      <img
        src={url} alt="" onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'contain', display: 'block' }}
        crossOrigin="anonymous"
      />
      {mediaType !== 'image' && <PlayOverlay mediaType={mediaType} size="sm" />}
      {mediaType !== 'image' && <MediaTypeBadge mediaType={mediaType} />}
      {showCount && <CountBadge count={imageCount} />}
    </div>
  );
}

/**
 * BACKGROUND IMAGE — atmospheric, blurred, full bleed.
 */
export function BackgroundImage({ url, onError }: { url: string; onError: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
      <img
        src={url} alt="" onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'blur(14px) brightness(0.28) saturate(1.3)', transform: 'scale(1.15)' }}
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, hsla(0,0%,0%,0.5) 0%, hsla(0,0%,0%,0.35) 50%, hsla(0,0%,0%,0.6) 100%)',
      }} />
    </div>
  );
}

/** Life phase pill */
export function LifePhaseBadge({ lifePhase, accentHex }: { lifePhase?: string; accentHex: string }) {
  if (!lifePhase) return null;
  const labels: Record<string, string> = {
    student_early_career: 'Early Career', builder: 'Builder',
    family_home: 'Family & Home', explorer: 'Explorer', legacy_impact: 'Legacy & Impact',
  };
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        background: 'hsla(0,0%,0%,0.4)', backdropFilter: 'blur(6px)', color: accentHex, border: `1px solid ${accentHex}30` }}>
      {labels[lifePhase] || lifePhase}
    </span>
  );
}

/**
 * POSTED FROM LIFESTACK — brand lockup badge.
 * NEVER clipped: uses nowrap, flex-shrink-0, and dedicated safe zone.
 */
export function PostedFromBadge({ footerHex, compact = false }: { footerHex: string; compact?: boolean }) {
  const iconSize = compact ? 14 : 16;
  const fontSize = compact ? 7.5 : 8;
  return (
    <div
      className="inline-flex items-center gap-1.5 flex-shrink-0"
      style={{
        padding: compact ? '3px 8px 3px 5px' : '4px 10px 4px 6px',
        borderRadius: 100,
        background: 'hsla(0,0%,0%,0.5)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${footerHex}55`,
        whiteSpace: 'nowrap',
      }}
    >
      <img
        src={lifestackLogo} alt="LifeStack"
        className="flex-shrink-0"
        style={{ width: iconSize, height: iconSize, borderRadius: 3, objectFit: 'contain' }}
        crossOrigin="anonymous"
      />
      <span style={{
        fontSize, fontWeight: 600, letterSpacing: '0.07em',
        color: 'hsla(0,0%,100%,0.84)', whiteSpace: 'nowrap', lineHeight: 1.2,
      }}>
        Posted from LifeStack
      </span>
    </div>
  );
}

/**
 * TEMPLATE FOOTER — dedicated safe zone at card bottom.
 * Uses flex-shrink-0 and mt-auto to always stick to bottom.
 * Contains signature phrase + "Posted from LifeStack" badge.
 */
export function TemplateFooter({
  phrase, accentHex, footerHex, footerMinHeight, compact = false, metaText,
}: {
  phrase: string; accentHex: string; footerHex: string;
  footerMinHeight: number; compact?: boolean; metaText?: string;
}) {
  return (
    <div
      className="flex-shrink-0 mt-auto"
      style={{
        borderTop: '1px solid hsla(0,0%,100%,0.06)',
        paddingTop: compact ? 10 : 14,
        minHeight: footerMinHeight,
      }}
    >
      <div className="flex items-center justify-between gap-3" style={{ flexWrap: 'nowrap' }}>
        <div className="min-w-0 flex-1">
          <p style={{
            fontSize: compact ? 9 : 10,
            fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase',
            color: accentHex, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', lineHeight: 1.3,
          }}>
            {phrase}
          </p>
          {metaText && (
            <p style={{
              fontSize: 9, marginTop: 2, color: footerHex,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {metaText}
            </p>
          )}
        </div>
        <PostedFromBadge footerHex={footerHex} compact={compact} />
      </div>
    </div>
  );
}

/** Small LifeStack logo mark for template headers */
export function BrandLogoMark({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
        boxShadow: '0 2px 12px -2px hsla(43,74%,52%,0.3)',
        overflow: 'hidden', padding: 3,
      }}>
      <img src={lifestackLogo} alt="LS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
    </div>
  );
}

/** Hook to manage image state in a template */
export function useTemplateImage(props: {
  data: { imageUrl?: string; imageUrls?: string[]; imageLayout?: ImageLayout };
  includeImage?: boolean; imageLayout?: ImageLayout; showImageCount?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = props.data.imageUrl;
  const includeImage = props.includeImage !== false;
  const hasImage = includeImage && !!url && !imgFailed;
  const layout: ImageLayout = props.imageLayout || props.data.imageLayout || 'hero_image';
  const imageCount = props.data.imageUrls?.length || (url ? 1 : 0);
  const showCount = props.showImageCount !== false;
  const mediaType = url ? detectMediaType(url) : 'image';
  return { hasImage, url: url || '', layout, imageCount, showCount, imgFailed, setImgFailed, mediaType };
}
