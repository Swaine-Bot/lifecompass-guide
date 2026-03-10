import { useState, useCallback } from 'react';
import {
  MilestonePayload,
  detectStreakMilestone,
  detectLevelUpMilestone,
  detectGoalCompleteMilestone,
} from '@/services/milestoneDetection';

/**
 * Hook that manages the milestone prompt modal state.
 * Call the check* methods after relevant mutations succeed.
 */
export function useMilestonePrompt() {
  const [milestone, setMilestone] = useState<MilestonePayload | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((m: MilestonePayload) => {
    setMilestone(m);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Keep milestone data briefly for exit animation
    setTimeout(() => setMilestone(null), 300);
  }, []);

  const checkStreak = useCallback((currentStreak: number, userId: string) => {
    const m = detectStreakMilestone(currentStreak, userId);
    if (m) show(m);
  }, [show]);

  const checkLevelUp = useCallback((domain: string, newLevel: number, leveledUp: boolean, userId: string) => {
    if (!leveledUp) return;
    const m = detectLevelUpMilestone(domain, newLevel, userId);
    if (m) show(m);
  }, [show]);

  const checkGoalComplete = useCallback((goalId: string, goalTitle: string, userId: string) => {
    const m = detectGoalCompleteMilestone(goalId, goalTitle, userId);
    if (m) show(m);
  }, [show]);

  return {
    milestone,
    open,
    close,
    checkStreak,
    checkLevelUp,
    checkGoalComplete,
  };
}
