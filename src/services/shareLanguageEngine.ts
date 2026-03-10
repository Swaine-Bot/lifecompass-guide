// ═══════════════════════════════════════════════════════════════════════
// LifeStack Share Card Language Engine
// Generates elegant, disciplined, identity-driven text for all cards.
// Structure: Identity → Achievement → Proof → Philosophy
// ═══════════════════════════════════════════════════════════════════════

import type { CardType } from './shareService';

// ─── Domain System ──────────────────────────────────────────────────

export type ShareDomain =
  | 'health' | 'discipline' | 'wealth' | 'focus'
  | 'mind' | 'relationships' | 'learning' | 'adventure' | 'legacy';

export type AchievementType =
  | 'streak' | 'milestone' | 'level_up' | 'completion'
  | 'breakthrough' | 'consistency' | 'progress';

export interface CardLanguage {
  identityLabel: string;
  heroText: string;
  proofMetrics: string;
  philosophyLine: string;
  footerText: string;
}

// ─── Identity Labels ────────────────────────────────────────────────

const IDENTITY_LABELS: Record<ShareDomain, string[]> = {
  health:        ['Strength', 'Vitality', 'Endurance', 'Resilience'],
  discipline:    ['Discipline', 'Consistency', 'Standards', 'Commitment'],
  wealth:        ['Prosperity', 'Foundation', 'Wealth', 'Financial Clarity'],
  focus:         ['Focus', 'Clarity', 'Precision', 'Execution'],
  mind:          ['Awareness', 'Reflection', 'Insight', 'Depth'],
  relationships: ['Connection', 'Trust', 'Presence', 'Belonging'],
  learning:      ['Knowledge', 'Growth', 'Mastery', 'Understanding'],
  adventure:     ['Exploration', 'Courage', 'Discovery', 'Challenge'],
  legacy:        ['Legacy', 'Contribution', 'Impact', 'Purpose'],
};

export function getIdentityLabel(domain: ShareDomain): string {
  const labels = IDENTITY_LABELS[domain] || IDENTITY_LABELS.discipline;
  return labels[Math.floor(Math.random() * labels.length)];
}

// ─── Philosophy Line Library ────────────────────────────────────────

const PHILOSOPHY_LINES: Record<ShareDomain, string[]> = {
  health: [
    'Strength grows where excuses stop.',
    'The body remembers what the mind commits to.',
    'Health is the quiet foundation of ambition.',
    'Movement builds what rest alone cannot.',
    'Energy is earned through daily discipline.',
  ],
  discipline: [
    'Consistency builds a life that luck cannot.',
    'Discipline quietly compounds into freedom.',
    'Momentum begins with one decision repeated.',
    'Standards kept today shape outcomes tomorrow.',
    'The work speaks when words fall short.',
  ],
  wealth: [
    'Financial clarity is a form of self-respect.',
    'Wealth grows in the gap between patience and action.',
    'Security is built one deliberate choice at a time.',
    'Money follows the discipline that earns it.',
    'Prosperity begins where impulse ends.',
  ],
  focus: [
    'Focus turns effort into momentum.',
    'Clarity is the reward of saying no.',
    'Attention directed is potential realized.',
    'Precision outperforms volume every time.',
    'One priority executed beats ten intentions.',
  ],
  mind: [
    'A life improves when attention improves.',
    'Self-awareness is the highest leverage skill.',
    'Reflection converts experience into wisdom.',
    'The examined day builds the intentional life.',
    'Insight arrives where stillness is practiced.',
  ],
  relationships: [
    'Presence is the rarest gift you can offer.',
    'Connection deepens where ego retreats.',
    'Trust is built in unremarkable moments.',
    'The quality of life mirrors the quality of bonds.',
    'Belonging grows from showing up consistently.',
  ],
  learning: [
    'Knowledge compounds faster than any asset.',
    'Every lesson completed rewrites what is possible.',
    'Curiosity sustained becomes quiet expertise.',
    'Growth favors those who return tomorrow.',
    'Understanding deepens with each honest attempt.',
  ],
  adventure: [
    'Comfort zones shrink what they claim to protect.',
    'Challenge accepted is potential unlocked.',
    'Courage practiced becomes courage owned.',
    'Discovery begins past the edge of routine.',
    'New terrain builds the adaptable mind.',
  ],
  legacy: [
    'Impact outlives the effort that created it.',
    'Contribution is the highest form of purpose.',
    'What you build for others echoes longest.',
    'Legacy is written in actions, not intentions.',
    'Purpose clarifies when service begins.',
  ],
};

const UNIVERSAL_PHILOSOPHY: string[] = [
  'Small daily victories shape extraordinary outcomes.',
  'Action clarifies what intention alone never could.',
  'Progress is the quiet reward of persistence.',
  'Evidence over intention.',
  'Another brick laid.',
  'The future is built in unremarkable moments.',
  'Quiet proof speaks loudest.',
  'Growth has evidence.',
];

export function getPhilosophyLine(domain?: ShareDomain): string {
  if (domain && PHILOSOPHY_LINES[domain]) {
    const pool = [...PHILOSOPHY_LINES[domain], ...UNIVERSAL_PHILOSOPHY];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return UNIVERSAL_PHILOSOPHY[Math.floor(Math.random() * UNIVERSAL_PHILOSOPHY.length)];
}

export function getAllPhilosophyLines(): string[] {
  const all = [...UNIVERSAL_PHILOSOPHY];
  for (const lines of Object.values(PHILOSOPHY_LINES)) {
    all.push(...lines);
  }
  return all;
}

// ─── Achievement Naming Service ─────────────────────────────────────

interface AchievementNamingInput {
  domain: ShareDomain;
  type: AchievementType;
  metric?: number;
  unit?: string;
  level?: number;
  goalTitle?: string;
}

const ACHIEVEMENT_TEMPLATES: Record<AchievementType, (d: ShareDomain, m?: number, u?: string, l?: number, g?: string) => string> = {
  streak: (d, m) => {
    const days = m ?? 30;
    return `${days} ${days === 1 ? 'day' : 'days'} of ${domainAction(d)}`;
  },
  milestone: (_d, _m, _u, _l, g) => {
    return g ? `${g} milestone reached` : 'Milestone reached';
  },
  level_up: (d, _m, _u, l) => {
    const level = l ?? 1;
    return `${domainNoun(d)} Level ${level} achieved`;
  },
  completion: (d, m, u) => {
    const count = m ?? 1;
    const unit = u || domainUnit(d);
    return `${count} ${unit} completed`;
  },
  breakthrough: (d) => {
    return `${domainNoun(d)} breakthrough achieved`;
  },
  consistency: (d, m) => {
    const days = m ?? 7;
    return `${writtenNumber(days)} days of consistent ${domainAction(d)}`;
  },
  progress: (d) => {
    return `${domainNoun(d)} progress recorded`;
  },
};

function domainAction(d: ShareDomain): string {
  const map: Record<ShareDomain, string> = {
    health: 'disciplined training',
    discipline: 'disciplined action',
    wealth: 'financial discipline',
    focus: 'focused execution',
    mind: 'intentional reflection',
    relationships: 'meaningful connection',
    learning: 'dedicated learning',
    adventure: 'personal challenge',
    legacy: 'purposeful contribution',
  };
  return map[d] || 'disciplined action';
}

function domainNoun(d: ShareDomain): string {
  const map: Record<ShareDomain, string> = {
    health: 'Health', discipline: 'Discipline', wealth: 'Wealth',
    focus: 'Focus', mind: 'Mind', relationships: 'Relationships',
    learning: 'Knowledge', adventure: 'Adventure', legacy: 'Legacy',
  };
  return map[d] || 'Growth';
}

function domainUnit(d: ShareDomain): string {
  const map: Record<ShareDomain, string> = {
    health: 'workouts', discipline: 'actions', wealth: 'targets',
    focus: 'sessions', mind: 'reflections', relationships: 'connections',
    learning: 'lessons', adventure: 'challenges', legacy: 'contributions',
  };
  return map[d] || 'actions';
}

function writtenNumber(n: number): string {
  const names: Record<number, string> = {
    1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
    6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
    14: 'Fourteen', 21: 'Twenty-one', 28: 'Twenty-eight', 30: 'Thirty',
    60: 'Sixty', 90: 'Ninety', 100: 'One hundred', 365: 'Three hundred sixty-five',
  };
  return names[n] || String(n);
}

export function generateAchievementName(input: AchievementNamingInput): string {
  const template = ACHIEVEMENT_TEMPLATES[input.type];
  if (!template) return 'Achievement unlocked';
  return template(input.domain, input.metric, input.unit, input.level, input.goalTitle);
}

// ─── Proof Metrics Formatter ────────────────────────────────────────

export function formatProofMetrics(metrics: { value: string | number; label: string }[]): string {
  return metrics.map(m => `${m.value} ${m.label}`).join(' · ');
}

// ─── Mentor Quote Formatter ─────────────────────────────────────────

const CURATED_MENTOR_QUOTES: string[] = [
  'The future rarely belongs to those who wait for certainty.',
  'Your patterns reveal your priorities more honestly than your words.',
  'Discomfort in the right direction is growth in disguise.',
  'Decisions made in clarity compound faster than those made in haste.',
  'What you measure with honesty improves without force.',
  'The gap between knowing and doing is bridged by starting.',
  'Progress hides in the habits you keep when no one watches.',
  'Your energy follows your attention, not your ambition.',
  'Simplicity in action outperforms complexity in planning.',
  'Tomorrow\'s clarity begins with today\'s honest assessment.',
  'Strength is not absence of doubt but action in spite of it.',
  'Growth is quieter than you expect and louder than you realize.',
];

export interface MentorInsightCard {
  identityLabel: string;
  quote: string;
  contextTag: string;
  footerText: string;
}

const MENTOR_CONTEXT_TAGS = [
  'Decision-making', 'Self-awareness', 'Habit formation', 'Energy management',
  'Focus strategy', 'Mindset', 'Growth patterns', 'Resilience',
  'Consistency', 'Priorities', 'Personal clarity', 'Momentum',
];

export function formatMentorInsight(userQuote?: string, contextTag?: string): MentorInsightCard {
  const quote = userQuote || CURATED_MENTOR_QUOTES[Math.floor(Math.random() * CURATED_MENTOR_QUOTES.length)];
  // Safety: enforce max 20 words
  const words = quote.split(/\s+/);
  const safeQuote = words.length > 20 ? words.slice(0, 20).join(' ') + '…' : quote;

  return {
    identityLabel: 'Mentor Insight',
    quote: safeQuote,
    contextTag: contextTag || MENTOR_CONTEXT_TAGS[Math.floor(Math.random() * MENTOR_CONTEXT_TAGS.length)],
    footerText: 'Shared from LifeStack',
  };
}

// ─── Weekly Recap Formatter ─────────────────────────────────────────

export interface WeeklyRecapLanguage extends CardLanguage {
  summaryLine: string;
  statsBlock: string;
}

const WEEKLY_SUMMARIES = [
  'A week of consistent effort.',
  'Steady momentum maintained.',
  'Seven days of deliberate progress.',
  'Another week built, not wasted.',
  'Quiet progress across multiple fronts.',
  'A week that moved the needle.',
];

export function formatWeeklyRecap(stats: { value: string | number; label: string }[], dateRange?: string): WeeklyRecapLanguage {
  return {
    identityLabel: 'Weekly Reflection',
    heroText: dateRange || 'This Week',
    summaryLine: WEEKLY_SUMMARIES[Math.floor(Math.random() * WEEKLY_SUMMARIES.length)],
    statsBlock: formatProofMetrics(stats),
    proofMetrics: formatProofMetrics(stats),
    philosophyLine: getPhilosophyLine('discipline'),
    footerText: 'Shared from LifeStack',
  };
}

// ─── Progress Formatter ─────────────────────────────────────────────

export interface ProgressLanguage extends CardLanguage {
  beforeValue: string;
  afterValue: string;
  timeContext: string;
}

export function formatProgress(
  domain: ShareDomain,
  before: string,
  after: string,
  timeContext?: string
): ProgressLanguage {
  return {
    identityLabel: 'Progress',
    heroText: `${domainNoun(domain)} domain progress`,
    beforeValue: before,
    afterValue: after,
    timeContext: timeContext || 'Last 30 days',
    proofMetrics: `${before} → ${after}`,
    philosophyLine: getPhilosophyLine(domain),
    footerText: 'Shared from LifeStack',
  };
}

// ─── Streak Formatter ───────────────────────────────────────────────

export function formatStreak(domain: ShareDomain, days: number): CardLanguage {
  return {
    identityLabel: getIdentityLabel(domain),
    heroText: `${days} day streak`,
    proofMetrics: 'Daily commitment maintained.',
    philosophyLine: getPhilosophyLine(domain),
    footerText: 'Shared from LifeStack',
  };
}

// ─── Level-Up Formatter ─────────────────────────────────────────────

export function formatLevelUp(domain: ShareDomain, level: number, metric?: string): CardLanguage {
  return {
    identityLabel: 'Level Up',
    heroText: `${domainNoun(domain)} Level ${level} Achieved`,
    proofMetrics: metric || `${domainNoun(domain)} domain progressed`,
    philosophyLine: getPhilosophyLine(domain),
    footerText: 'Shared from LifeStack',
  };
}

// ─── Milestone Formatter ────────────────────────────────────────────

export function formatMilestone(domain: ShareDomain, title: string, metric?: string): CardLanguage {
  return {
    identityLabel: domainNoun(domain),
    heroText: title,
    proofMetrics: metric || 'Milestone completed.',
    philosophyLine: getPhilosophyLine(domain),
    footerText: 'Shared from LifeStack',
  };
}

// ─── Unified Card Language Generator ────────────────────────────────

export interface CardLanguageInput {
  cardType: CardType;
  domain?: ShareDomain;
  title?: string;
  metric?: number;
  unit?: string;
  level?: number;
  goalTitle?: string;
  mentorQuote?: string;
  mentorContext?: string;
  stats?: { value: string | number; label: string }[];
  dateRange?: string;
  beforeValue?: string;
  afterValue?: string;
  timeContext?: string;
}

export function generateCardLanguage(input: CardLanguageInput): CardLanguage {
  const domain: ShareDomain = (input.domain as ShareDomain) || 'discipline';

  switch (input.cardType) {
    case 'streak':
      return formatStreak(domain, input.metric ?? 30);

    case 'milestone':
      return formatMilestone(domain, input.title || 'Milestone reached', input.stats ? formatProofMetrics(input.stats) : undefined);

    case 'mentor_insight': {
      const mi = formatMentorInsight(input.mentorQuote, input.mentorContext);
      return {
        identityLabel: mi.identityLabel,
        heroText: mi.quote,
        proofMetrics: mi.contextTag,
        philosophyLine: '',
        footerText: mi.footerText,
      };
    }

    case 'progress': {
      const p = formatProgress(domain, input.beforeValue || '—', input.afterValue || '—', input.timeContext);
      return {
        identityLabel: p.identityLabel,
        heroText: p.heroText,
        proofMetrics: p.proofMetrics,
        philosophyLine: p.philosophyLine,
        footerText: p.footerText,
      };
    }

    case 'weekly_recap': {
      const wr = formatWeeklyRecap(input.stats || [], input.dateRange);
      return {
        identityLabel: wr.identityLabel,
        heroText: wr.heroText,
        proofMetrics: wr.proofMetrics,
        philosophyLine: wr.philosophyLine,
        footerText: wr.footerText,
      };
    }

    case 'level_up':
      return formatLevelUp(domain, input.level ?? 1, input.stats ? formatProofMetrics(input.stats) : undefined);

    default:
      return {
        identityLabel: getIdentityLabel(domain),
        heroText: input.title || 'Achievement unlocked',
        proofMetrics: '',
        philosophyLine: getPhilosophyLine(domain),
        footerText: 'Shared from LifeStack',
      };
  }
}

// ─── Map life_domain enum to ShareDomain ────────────────────────────

export function mapLifeDomain(d?: string): ShareDomain {
  const map: Record<string, ShareDomain> = {
    physical: 'health',
    mind: 'mind',
    wealth: 'wealth',
    relationships: 'relationships',
    legacy: 'legacy',
  };
  return (d && map[d]) || 'discipline';
}
