import { useState } from 'react';
import type { ImageLayout } from '@/services/shareService';
import lifestackLogo from '@/assets/lifestack-logo-mark.png';

interface SharedImageLayerProps {
  url: string;
  layout: ImageLayout;
  imageCount: number;
  showCount: boolean;
  accentHex: string;
}

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

/** Play button overlay for video/audio media */
export function PlayOverlay({ mediaType, size = 'lg' }: { mediaType: 'video' | 'audio'; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 56 : 40;
  const iconSize = size === 'lg' ? 22 : 16;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: dim,
          height: dim,
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

/** Media type badge — e.g. "🎬 Video" or "🎙️ Audio" */
export function MediaTypeBadge({ mediaType }: { mediaType: 'video' | 'audio' }) {
  return (
    <div
      className="absolute top-3 left-3 px-2 py-0.5 rounded-full z-10"
      style={{
        background: 'hsla(0,0%,0%,0.6)',
        color: 'hsla(0,0%,100%,0.85)',
        fontSize: 9,
        fontWeight: 600,
        backdropFilter: 'blur(4px)',
        letterSpacing: '0.05em',
      }}
    >
      {mediaType === 'video' ? '🎬 Video' : '🎙️ Audio'}
    </div>
  );
}

/**
 * Hero: media displayed with preserved aspect ratio, no cropping, no overlays on media.
 * Uses object-fit:contain so the full image is always visible.
 */
export function HeroImage({ url, imageCount, showCount, onError }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void;
}) {
  const mediaType = detectMediaType(url);
  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ flex: '0 0 48%', minHeight: 0, background: 'hsla(0,0%,0%,0.15)' }}
    >
      <img
        src={url}
        alt=""
        onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'contain', display: 'block' }}
        crossOrigin="anonymous"
      />
      {mediaType !== 'image' && <PlayOverlay mediaType={mediaType} size="lg" />}
      {mediaType !== 'image' && <MediaTypeBadge mediaType={mediaType} />}
      {showCount && <CountBadge count={imageCount} />}
    </div>
  );
}

/**
 * Split: image on the left — true 50/50, aspect ratio preserved, no overlays on media.
 */
export function SplitImage({ url, imageCount, showCount, onError }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void;
}) {
  const mediaType = detectMediaType(url);
  return (
    <div
      className="relative overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: '50%', minHeight: 0, background: 'hsla(0,0%,0%,0.15)' }}
    >
      <img
        src={url}
        alt=""
        onError={onError}
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
 * Background: full bleed behind all content with readability overlay.
 * Media is intentionally blurred/atmospheric — this is the design intent for background mode.
 */
export function BackgroundImage({ url, onError }: {
  url: string; onError: () => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
      <img
        src={url}
        alt=""
        onError={onError}
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

/**
 * Life phase pill — small identifier
 */
export function LifePhaseBadge({ lifePhase, accentHex }: { lifePhase?: string; accentHex: string }) {
  if (!lifePhase) return null;
  const labels: Record<string, string> = {
    student_early_career: 'Early Career',
    builder: 'Builder',
    family_home: 'Family & Home',
    explorer: 'Explorer',
    legacy_impact: 'Legacy & Impact',
  };
  const label = labels[lifePhase] || lifePhase;
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-full"
      style={{
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: 'hsla(0,0%,0%,0.4)',
        backdropFilter: 'blur(6px)',
        color: accentHex,
        border: `1px solid ${accentHex}30`,
      }}
    >
      {label}
    </span>
  );
}

/**
 * "Posted from LifeStack" brand badge — inline flow element (not absolute positioned).
 * Place this inside a text/footer container, not overlapping media.
 */
export function PostedFromBadge({ footerHex }: { footerHex: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 flex-shrink-0"
      style={{
        padding: '3px 10px 3px 4px',
        borderRadius: 100,
        background: 'hsla(0,0%,0%,0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid hsla(0,0%,100%,0.1)',
        whiteSpace: 'nowrap',
      }}
    >
      <img
        src={lifestackLogo}
        alt="LifeStack"
        className="flex-shrink-0"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          objectFit: 'contain',
        }}
        crossOrigin="anonymous"
      />
      <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', color: 'hsla(0,0%,100%,0.8)', whiteSpace: 'nowrap' }}>
        Posted from LifeStack
      </span>
    </div>
  );
}

/**
 * Small LifeStack logo mark for template headers
 */
export function BrandLogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, hsl(43,74%,55%) 0%, hsl(43,65%,38%) 100%)',
        boxShadow: '0 2px 12px -2px hsla(43,74%,52%,0.3)',
        overflow: 'hidden',
        padding: 3,
      }}
    >
      <img
        src={lifestackLogo}
        alt="LS"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        crossOrigin="anonymous"
      />
    </div>
  );
}

/**
 * Hook to manage image state in a template
 */
export function useTemplateImage(props: {
  data: { imageUrl?: string; imageUrls?: string[]; imageLayout?: ImageLayout };
  includeImage?: boolean;
  imageLayout?: ImageLayout;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = props.data.imageUrl;
  const includeImage = props.includeImage !== false;
  const hasImage = includeImage && !!url && !imgFailed;
  const layout: ImageLayout = props.imageLayout || props.data.imageLayout || 'hero_image';
  const imageCount = props.data.imageUrls?.length || (url ? 1 : 0);
  const showCount = (props as any).showImageCount !== false;
  const mediaType = url ? detectMediaType(url) : 'image';

  return { hasImage, url: url || '', layout, imageCount, showCount, imgFailed, setImgFailed, mediaType };
}
