import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Screen-specific gradient overlay with mood-aware tinting.
 */
export const ContextOverlay = memo(function ContextOverlay() {
  const { environment } = useSensory();
  const { screenOverlay, theme } = environment;

  // Use screen overlay if available, otherwise fall back to mood overlay tint
  const tint = screenOverlay;
  if (!tint) return null;

  const transitionMs = theme.transitionMs ?? 800;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background: `radial-gradient(ellipse at 50% 0%, hsl(${tint} / 0.08), transparent 60%)`,
        transition: `background ${transitionMs}ms ease`,
      }}
      aria-hidden="true"
    />
  );
});
