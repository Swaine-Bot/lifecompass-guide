import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';
import type { FeedbackEvent } from '@/engines/feedbackEngine';

/**
 * Visual feedback pulse — brief glow on feedback events.
 * 
 * Three intensity tiers for emotional precision:
 * - reward:     strong glow (milestone, streak)
 * - standard:   medium glow (daily signal, insight)
 * - completion: soft glow (micro move, reflection)
 */

const REWARD_EVENTS: FeedbackEvent[] = ['milestone_reached', 'streak_continued'];
const COMPLETION_EVENTS: FeedbackEvent[] = ['micro_move_complete', 'reflection_saved', 'goal_created'];

function getPulseIntensity(event: FeedbackEvent): { opacity: number; spread: string } {
  if (REWARD_EVENTS.includes(event)) return { opacity: 0.16, spread: '60%' };
  if (COMPLETION_EVENTS.includes(event)) return { opacity: 0.06, spread: '40%' };
  return { opacity: 0.10, spread: '50%' }; // standard
}

export const FeedbackPulse = memo(function FeedbackPulse() {
  const { activePulse, environment } = useSensory();

  if (!activePulse) return null;

  const { opacity, spread } = getPulseIntensity(activePulse);

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