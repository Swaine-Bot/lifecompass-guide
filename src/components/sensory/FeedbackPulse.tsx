import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Visual feedback pulse — brief glow on feedback events.
 * Uses opacity-only animation for GPU safety.
 */
export const FeedbackPulse = memo(function FeedbackPulse() {
  const { activePulse, environment } = useSensory();

  if (!activePulse) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none animate-sensory-pulse"
      style={{
        zIndex: 3,
        background: `radial-gradient(circle at 50% 50%, hsl(${environment.theme.pulseHue} / 0.12), transparent 50%)`,
      }}
      aria-hidden="true"
    />
  );
});
