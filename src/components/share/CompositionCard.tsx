/**
 * CompositionCard — Fixed-artboard preview component.
 *
 * Renders the card at EXACT export dimensions on an internal artboard,
 * then scales it down via CSS transform for on-screen preview.
 * This guarantees preview/export parity.
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

    async function render() {
      setRendered(false);
      try {
        const canvas = await renderCompositionToCanvas(spec, content);
        if (cancelled) return;

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

    render();
    return () => { cancelled = true; };
  }, [spec, content]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: maxPreviewWidth,
        height: previewHeight,
        borderRadius: 48,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: maxPreviewWidth,
          height: previewHeight,
          display: 'block',
        }}
      />
      {!rendered && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(10, 10, 15, 0.9)' }}
        >
          <div className="text-center space-y-2">
            <div
              className="w-6 h-6 mx-auto border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'hsla(43, 74%, 52%, 0.5)', borderTopColor: 'transparent' }}
            />
            <p style={{ fontSize: 11, color: 'hsl(220,10%,50%)', fontFamily: 'Inter, sans-serif' }}>
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
    const canvas = await renderCompositionToCanvas(spec, content);
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
    );
  } catch (err) {
    console.error('[exportCompositionToBlob] Failed:', err);
    return null;
  }
}
