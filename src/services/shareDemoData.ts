// ═══════════════════════════════════════════════════════════════════════
// LifeStack Share Demo Data — powered by language engine
// ═══════════════════════════════════════════════════════════════════════

import type { ShareCardData } from './shareService';
import {
  generateCardLanguage,
  getPhilosophyLine,
  formatProofMetrics,
  formatMentorInsight,
  type ShareDomain,
} from './shareLanguageEngine';

export function generateDemoCards(): ShareCardData[] {
  // Streak card
  const streak = generateCardLanguage({ cardType: 'streak', domain: 'discipline', metric: 90 });
  // Milestone card
  const milestone = generateCardLanguage({ cardType: 'milestone', domain: 'wealth', title: 'Wealth Milestone Reached' });
  // Mentor insight
  const mentorInsight = formatMentorInsight();
  // Progress
  const progress = generateCardLanguage({ cardType: 'progress', domain: 'health', beforeValue: 'Level 3', afterValue: 'Level 6', timeContext: 'This month' });
  // Weekly recap
  const weeklyRecap = generateCardLanguage({
    cardType: 'weekly_recap',
    dateRange: 'Week of Mar 3 – Mar 9',
    stats: [
      { value: 7, label: 'habits completed' },
      { value: 3, label: 'goals progressed' },
      { value: 2, label: 'workouts' },
      { value: 5, label: 'journal entries' },
    ],
  });
  // Level up
  const levelUp = generateCardLanguage({ cardType: 'level_up', domain: 'health', level: 8, stats: [{ value: 12, label: 'workouts completed' }] });

  return [
    {
      cardType: 'streak',
      title: streak.heroText,
      subtitle: 'Three months of unbroken consistency.',
      statValue: '90',
      statLabel: 'Consecutive Days',
      secondaryValue: '347',
      secondaryLabel: 'Total Actions Logged',
      timeAnchor: 'Since Dec 10, 2025',
      philosophy: streak.philosophyLine,
      visualType: 'flame',
      domain: 'physical',
      identityLabel: streak.identityLabel,
    },
    {
      cardType: 'milestone',
      title: milestone.heroText,
      subtitle: 'Emergency fund target achieved ahead of schedule.',
      statValue: '✓',
      statLabel: 'Emergency Fund Goal',
      secondaryValue: '63',
      secondaryLabel: 'Days to Completion',
      timeAnchor: 'Completed Mar 8, 2026',
      philosophy: milestone.philosophyLine,
      visualType: 'badge',
      domain: 'wealth',
      identityLabel: milestone.identityLabel,
    },
    {
      cardType: 'mentor_insight',
      title: 'Mentor Insight',
      subtitle: mentorInsight.quote,
      statValue: mentorInsight.contextTag,
      statLabel: '',
      timeAnchor: 'Insight from Mar 8, 2026',
      philosophy: '',
      visualType: 'quote',
      domain: 'mind',
      identityLabel: mentorInsight.identityLabel,
    },
    {
      cardType: 'progress',
      title: progress.heroText,
      subtitle: 'Consistent gains across all tracked metrics.',
      statValue: '2,450',
      statLabel: 'Total XP Earned',
      secondaryValue: 'Level 6',
      secondaryLabel: 'Current Level',
      timeAnchor: progress.proofMetrics,
      philosophy: progress.philosophyLine,
      visualType: 'ring',
      domain: 'physical',
      identityLabel: progress.identityLabel,
    },
    {
      cardType: 'weekly_recap',
      title: weeklyRecap.heroText,
      subtitle: weeklyRecap.proofMetrics,
      statValue: '24',
      statLabel: 'Actions Completed',
      secondaryValue: '4.2',
      secondaryLabel: 'Avg Mood Score',
      timeAnchor: 'Weekly Summary',
      philosophy: weeklyRecap.philosophyLine,
      visualType: 'chart',
      domain: 'mind',
      identityLabel: weeklyRecap.identityLabel,
    },
    {
      cardType: 'level_up',
      title: levelUp.heroText,
      subtitle: levelUp.proofMetrics,
      statValue: 'Level 8',
      statLabel: 'Physical Domain',
      secondaryValue: '1,200',
      secondaryLabel: 'XP This Quarter',
      timeAnchor: 'Leveled up Mar 10, 2026',
      philosophy: levelUp.philosophyLine,
      visualType: 'radar',
      domain: 'physical',
      identityLabel: levelUp.identityLabel,
    },
  ];
}
