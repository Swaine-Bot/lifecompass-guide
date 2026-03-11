import { useState } from 'react';
import type { ImageLayout } from '@/services/shareService';

interface SharedImageLayerProps {
  url: string;
  layout: ImageLayout;
  imageCount: number;
  showCount: boolean;
  accentHex: string;
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
 * Hero: fills a top region with smart cover crop
 */
export function HeroImage({ url, imageCount, showCount, onError }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void;
}) {
  return (
    <div className="relative w-full overflow-hidden" style={{ flex: '0 0 45%', minHeight: 0 }}>
      <img
        src={url}
        alt=""
        onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      {showCount && <CountBadge count={imageCount} />}
    </div>
  );
}

/**
 * Split: image on the left, content on the right
 */
export function SplitImage({ url, imageCount, showCount, onError }: {
  url: string; imageCount: number; showCount: boolean; onError: () => void;
}) {
  return (
    <div className="relative overflow-hidden flex-shrink-0" style={{ width: '42%', minHeight: 0 }}>
      <img
        src={url}
        alt=""
        onError={onError}
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
      {showCount && <CountBadge count={imageCount} />}
    </div>
  );
}

/**
 * Background: full bleed behind all content with readability overlay
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
        style={{ objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'blur(12px) brightness(0.3) saturate(1.2)', transform: 'scale(1.15)' }}
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, hsla(0,0%,0%,0.55) 0%, hsla(0,0%,0%,0.4) 50%, hsla(0,0%,0%,0.6) 100%)',
      }} />
    </div>
  );
}

/**
 * "Posted from LifeStack" brand badge — always bottom-right, above all layers
 */
export function PostedFromBadge({ footerHex }: { footerHex: string }) {
  return (
    <div
      className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5"
      style={{
        padding: '4px 10px 4px 6px',
        borderRadius: 100,
        background: 'hsla(0,0%,0%,0.45)',
        backdropFilter: 'blur(8px)',
        border: '1px solid hsla(0,0%,100%,0.08)',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))',
        }}
      >
        <span style={{ fontSize: 5.5, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.05em' }}>LS</span>
      </div>
      <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', color: 'hsla(0,0%,100%,0.75)', whiteSpace: 'nowrap' }}>
        Posted from LifeStack
      </span>
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

  return { hasImage, url: url || '', layout, imageCount, showCount, imgFailed, setImgFailed };
}
