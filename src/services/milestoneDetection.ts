import { supabase } from '@/integrations/supabase/client';

const STREAK_THRESHOLDS = [7, 14, 30, 60, 100];
const DISMISSED_KEY = 'lifestack_dismissed_milestones';

export interface MilestonePayload {
  type: 'streak' | 'level_up' | 'goal_complete';
  title: string;
  subtitle: string;
  value: string;
  sourceId?: string;
  sourceType: string;
  shareCardType: string;
  triggerKey: string;
}

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addDismissed(key: string) {
  const dismissed = getDismissed();
  dismissed.add(key);
  // Keep only last 200 entries to avoid bloat
  const arr = Array.from(dismissed).slice(-200);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
}

export function dismissMilestone(triggerKey: string) {
  addDismissed(triggerKey);
}

export function detectStreakMilestone(currentStreak: number, userId: string): MilestonePayload | null {
  const threshold = STREAK_THRESHOLDS.find(t => currentStreak === t);
  if (!threshold) return null;

  const triggerKey = `streak_${threshold}_${userId}`;
  if (getDismissed().has(triggerKey)) return null;

  return {
    type: 'streak',
    title: `${threshold}-Day Momentum Streak`,
    subtitle: 'Consistency compounds. This streak is proof.',
    value: `${threshold}`,
    sourceType: 'momentum_streak',
    shareCardType: 'streak_milestone',
    triggerKey,
  };
}

export function detectLevelUpMilestone(
  domain: string,
  newLevel: number,
  userId: string
): MilestonePayload | null {
  const triggerKey = `level_${domain}_${newLevel}_${userId}`;
  if (getDismissed().has(triggerKey)) return null;

  const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    type: 'level_up',
    title: `${domainLabel} Level ${newLevel} Achieved`,
    subtitle: 'Growth has evidence.',
    value: `Level ${newLevel}`,
    sourceType: 'xp_level',
    shareCardType: 'level_up',
    triggerKey,
  };
}

export function detectGoalCompleteMilestone(
  goalId: string,
  goalTitle: string,
  userId: string
): MilestonePayload | null {
  const triggerKey = `goal_${goalId}_${userId}`;
  if (getDismissed().has(triggerKey)) return null;

  return {
    type: 'goal_complete',
    title: goalTitle,
    subtitle: 'Chapter complete.',
    value: '✓',
    sourceId: goalId,
    sourceType: 'goal',
    shareCardType: 'goal_achievement',
    triggerKey,
  };
}
