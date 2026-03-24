import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Screen-specific gradient overlay.
 * Subtle color tint that distinguishes mentor/journal/goals contexts.
 */
export const ContextOverlay = memo(function ContextOverlay() {
  const { environment } = useSensory();
  const { screenOverlay } = environment;

  if (!screenOverlay) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        background: `radial-gradient(ellipse at 50% 0%, hsl(${screenOverlay} / 0.08), transparent 60%)`,
        transition: 'background 600ms ease',
      }}
      aria-hidden="true"
    />
  );
});
