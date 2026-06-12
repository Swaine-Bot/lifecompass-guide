/**
 * CompositionCard — Fixed-artboard preview component.
 *
 * Renders the card at EXACT export dimensions on an internal artboard,
 * then scales it down via CSS transform for on-screen preview.
 * Premium outer shell with architectural shadow and edge glow.
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import type { SharePlatform } from './platformProfiles';
import { getPlatformProfile } from './platformProfiles';
import type { NormalizedShareContent } from './composition/normalizeShareContent';
import { computeCompositionSpec, type CompositionSpec } from './composition/computeCompositionSpec';
import { renderCompositionToCanvas } from './render/renderCompositionToCanvas';

interface CompositionCardProps {
  content: NormalizedShareContent;
  platform: SharePlatform;
  /** Max width in CSS pixels for the preview container */
  maxPreviewWidth?: number;
  className?: string;
}

export function CompositionCard({
  content,
  platform,
  maxPreviewWidth = 320,
  className = '',
}: CompositionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderSeqRef = useRef(0);
  const [rendered, setRendered] = useState(false);

  const spec = useMemo(
    () => computeCompositionSpec(content, platform),
    [content, platform],
  );

  // Scale factor: render at full res, display scaled down
  const profile = getPlatformProfile(platform);
  const scale = maxPreviewWidth / profile.width;
  const previewHeight = profile.height * scale;

  useEffect(() => {
    let cancelled = false;
    const renderSeq = ++renderSeqRef.current;
    let rafId = 0;

    async function render() {
      setRendered(false);
      try {
        const canvas = await renderCompositionToCanvas(spec, content, { quality: 'preview' });
        if (cancelled || renderSeq !== renderSeqRef.current) return;

        const target = canvasRef.current;
        if (!target) return;

        target.width = canvas.width;
        target.height = canvas.height;
        const ctx = target.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
        }
        setRendered(true);
      } catch (err) {
        console.error('[CompositionCard] Render failed:', err);
      }
    }

    rafId = window.requestAnimationFrame(() => { void render(); });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [spec, content]);

  const accentHex = content.theme?.accentHex || 'rgba(200,164,106,0.15)';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: maxPreviewWidth,
        height: previewHeight,
        borderRadius: 34,
        // Premium shadow system — depth + accent glow
        boxShadow: [
          `0 32px 80px -12px rgba(0,0,0,0.55)`,
          `0 16px 40px -8px rgba(0,0,0,0.35)`,
          `0 0 60px -20px ${accentHex}`,
          `0 0 0 1px rgba(255,255,255,0.06)`,
          `inset 0 1px 0 rgba(255,255,255,0.04)`,
        ].join(', '),
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: maxPreviewWidth,
          height: previewHeight,
          display: 'block',
          borderRadius: 34,
        }}
      />
      {!rendered && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(6, 8, 16, 0.7)',
            borderRadius: 34,
            backdropFilter: 'blur(80px) saturate(145%)',
            WebkitBackdropFilter: 'blur(80px) saturate(145%)',
          }}
        >
          <div className="text-center space-y-3">
            <div
              className="w-7 h-7 mx-auto border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'hsla(43, 74%, 52%, 0.25)', borderTopColor: 'transparent' }}
            />
            <p style={{
              fontSize: 10,
              color: 'hsl(40,10%,42%)',
              fontFamily: '"Playfair Display", serif',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Composing…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Export helper — renders the composition to a PNG Blob.
 * Uses the exact same CompositionSpec as the preview.
 */
export async function exportCompositionToBlob(
  content: NormalizedShareContent,
  platform: SharePlatform,
): Promise<Blob | null> {
  try {
    const spec = computeCompositionSpec(content, platform);
    const canvas = await renderCompositionToCanvas(spec, content, { quality: 'export' });
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
    );
  } catch (err) {
    console.error('[exportCompositionToBlob] Failed:', err);
    return null;
  }
}
