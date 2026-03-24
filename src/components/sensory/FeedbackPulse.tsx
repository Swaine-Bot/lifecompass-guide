import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Visual feedback pulse — brief glow on feedback events.
 * Pulse color adapts to current mood's accent hue.
 */
export const FeedbackPulse = memo(function FeedbackPulse() {
  const { activePulse, environment } = useSensory();

  if (!activePulse) return null;

  // Stronger pulse for reward events
  const isReward = activePulse === 'milestone_reached' || activePulse === 'streak_continued';
  const opacity = isReward ? 0.18 : 0.12;
  const spread = isReward ? '60%' : '50%';

  return (
    <div
      className="fixed inset-0 pointer-events-none animate-sensory-pulse"
      style={{
        zIndex: 3,
        background: `radial-gradient(circle at 50% 50%, hsl(${environment.theme.pulseHue} / ${opacity}), transparent ${spread})`,
      }}
      aria-hidden="true"
    />
  );
});
