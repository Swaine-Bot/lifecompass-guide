/**
 * Contextual Action Engine
 * 
 * Analyzes text content and user context to suggest relevant cross-feature
 * actions. This is the core integration layer that makes LifeStack feel
 * like one unified system rather than separate screens.
 */

export type ActionType =
  | 'goal'
  | 'habit'
  | 'micro_moves'
  | 'calendar'
  | 'playbook'
  | 'community_post'
  | 'journal';

export interface SuggestedAction {
  type: ActionType;
  label: string;
  description: string;
  /** Route to navigate to */
  route: string;
  /** URL search params for prefilling */
  prefill: Record<string, string>;
  /** Relevance score 0–1 */
  score: number;
  /** Icon name from lucide */
  icon: string;
}

interface ActionContext {
  text: string;
  lifePhase?: string | null;
  source?: 'mentor' | 'goal' | 'habit' | 'playbook' | 'journal';
  category?: string | null;
  domain?: string | null;
}

/* ── Signal patterns ── */

const GOAL_SIGNALS = [
  /\bwant to\b/i, /\bplan(ning)? to\b/i, /\bgoal\b/i, /\bachieve\b/i,
  /\bcomplete\b/i, /\bfinish\b/i, /\baccomplish\b/i, /\blaunch\b/i,
  /\bbuild\b/i, /\bstart\b/i, /\bcreate\b/i, /\bgrow\b/i, /\bimprove\b/i,
  /\bmaster\b/i, /\btransition\b/i, /\btransform\b/i, /\bbuy\b/i,
  /\bsave (?:for|up)\b/i, /\brun (?:a|my)\b/i, /\bwrite (?:a|my)\b/i,
];

const HABIT_SIGNALS = [
  /\bevery (?:day|morning|evening|week|night)\b/i, /\bdaily\b/i,
  /\broutine\b/i, /\bconsisten(?:t|cy)\b/i, /\bhabit\b/i,
  /\bpractice\b/i, /\brepeat\b/i, /\brecurring\b/i,
  /\bregularly?\b/i, /\bdiscipline\b/i, /\bmeditat(?:e|ion)\b/i,
  /\bexercise\b/i, /\bworkout\b/i, /\bread(?:ing)?\b/i,
  /\bjournal(?:ing)?\b/i, /\bstretch(?:ing)?\b/i,
];

const CALENDAR_SIGNALS = [
  /\bschedule\b/i, /\bdeadline\b/i, /\bby (?:next|this|end of)\b/i,
  /\bappointment\b/i, /\breminder\b/i, /\bbirthday\b/i,
  /\banniversary\b/i, /\bevent\b/i, /\bdate\b/i, /\bcalendar\b/i,
  /\bnext (?:week|month|quarter|year)\b/i, /\bthis (?:week|month|quarter)\b/i,
  /\bprepare for\b/i, /\bcoming up\b/i, /\bdue\b/i,
];

const MICRO_MOVE_SIGNALS = [
  /\bstep(?:s)?\b/i, /\baction(?:s)?\b/i, /\bfirst (?:thing|step)\b/i,
  /\bbreak (?:it )?down\b/i, /\bstart (?:with|by|small)\b/i,
  /\bquick\b/i, /\bmove(?:s)?\b/i, /\btask(?:s)?\b/i,
  /\bto-?do\b/i, /\boverwhelm\b/i, /\bwhere (?:do|should) I (?:start|begin)\b/i,
  /\bnot sure (?:how|where)\b/i, /\bdon'?t know (?:how|where)\b/i,
];

const COMMUNITY_SIGNALS = [
  /\bshare\b/i, /\baccountab/i, /\bsupport\b/i, /\bcelebrat/i,
  /\bproud\b/i, /\bachieved\b/i, /\bwin\b/i, /\bmilestone\b/i,
  /\bbreakthrough\b/i, /\binsight\b/i, /\blearned\b/i,
];

const JOURNAL_SIGNALS = [
  /\breflect(?:ion|ing)?\b/i, /\bfeel(?:ing)?\b/i, /\bgrateful\b/i,
  /\bgratitude\b/i, /\bthink(?:ing)? about\b/i, /\bprocess(?:ing)?\b/i,
  /\bemotion(?:s|al)?\b/i, /\bthought(?:s)?\b/i, /\bwriting\b/i,
  /\bexperience\b/i,
];

/* ── Category mapping ── */

const TEXT_TO_CATEGORY: [RegExp, string][] = [
  [/\b(?:health|fit|exercise|workout|run|gym|weight|diet|nutrition|sleep|meditat|yoga|stretch)\b/i, 'health'],
  [/\b(?:career|job|work|business|startup|launch|revenue|profit|salary|promotion|interview|resume|cv|leadership)\b/i, 'career'],
  [/\b(?:money|financ|invest|budget|sav(?:e|ing)|wealth|income|debt|retire)\b/i, 'money'],
  [/\b(?:relationship|partner|spouse|family|friend|parent|child|marriage|dating|love|social)\b/i, 'relationships'],
  [/\b(?:mindset|growth|learn|skill|educat|read|study|discipline|habit|focus|mental)\b/i, 'mindset'],
  [/\b(?:legacy|will|estate|testament|mentor|impact|contribution|succession|values|purpose|end.of.life)\b/i, 'legacy'],
];

const CATEGORY_TO_DOMAIN: Record<string, string> = {
  health: 'physical',
  career: 'mind',
  money: 'wealth',
  relationships: 'relationships',
  mindset: 'mind',
  legacy: 'legacy',
};

/* ── Phase-aware playbook suggestions ── */

const PHASE_PLAYBOOK_KEYWORDS: Record<string, [RegExp, string][]> = {
  student: [
    [/\b(?:resume|cv|job|interview|network)\b/i, 'student'],
    [/\b(?:budget|money|financ)\b/i, 'student'],
    [/\b(?:discipline|study|learn)\b/i, 'student'],
  ],
  builder: [
    [/\b(?:business|launch|revenue|lead|productiv|stress|decision)\b/i, 'builder'],
  ],
  family: [
    [/\b(?:parent|child|household|family|relationship|emergency|work.life)\b/i, 'family'],
  ],
  explorer: [
    [/\b(?:reinvent|travel|pivot|meaning|lifestyle|social|skill)\b/i, 'explorer'],
  ],
  legacy: [
    [/\b(?:will|estate|testament|legacy|knowledge.transfer|values|mentor|succession|end.of.life|impact|contribution)\b/i, 'legacy'],
  ],
};

/* ── Scoring ── */

function scoreSignals(text: string, patterns: RegExp[]): number {
  const matches = patterns.filter(r => r.test(text)).length;
  if (matches === 0) return 0;
  return Math.min(1, 0.3 + matches * 0.15);
}

function detectCategory(text: string): string | null {
  for (const [pattern, cat] of TEXT_TO_CATEGORY) {
    if (pattern.test(text)) return cat;
  }
  return null;
}

function extractTitle(text: string): string {
  // Try to extract a concise intent from text
  const intentPatterns = [
    /(?:want to|plan(?:ning)? to|goal is to|trying to|need to|going to)\s+(.{5,60}?)(?:\.|,|$)/i,
    /(?:start|begin|build|create|launch|improve|learn)\s+(.{5,50}?)(?:\.|,|$)/i,
  ];
  for (const p of intentPatterns) {
    const m = text.match(p);
    if (m?.[1]) {
      let title = m[1].trim();
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);
      return title;
    }
  }
  // Fallback: first meaningful sentence fragment
  const first = text.split(/[.!?\n]/)[0]?.trim() || '';
  if (first.length > 10 && first.length < 80) {
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return '';
}

/* ── Main API ── */

export function analyzeForActions(ctx: ActionContext): SuggestedAction[] {
  const { text, lifePhase, source, category: ctxCategory, domain: ctxDomain } = ctx;
  if (!text || text.length < 20) return [];

  const detectedCategory = ctxCategory || detectCategory(text);
  const detectedDomain = ctxDomain || (detectedCategory ? CATEGORY_TO_DOMAIN[detectedCategory] : null);
  const title = extractTitle(text);

  const actions: SuggestedAction[] = [];

  // Goal
  const goalScore = scoreSignals(text, GOAL_SIGNALS);
  if (goalScore > 0 && source !== 'goal') {
    actions.push({
      type: 'goal',
      label: 'Add as Goal',
      description: 'Create a structured goal from this',
      route: '/goals/new',
      prefill: {
        ...(title && { title }),
        ...(detectedCategory && { category: detectedCategory }),
      },
      score: goalScore,
      icon: 'Target',
    });
  }

  // Habit
  const habitScore = scoreSignals(text, HABIT_SIGNALS);
  if (habitScore > 0 && source !== 'habit') {
    actions.push({
      type: 'habit',
      label: 'Add as Habit',
      description: 'Create a recurring habit from this',
      route: '/habits/new',
      prefill: {
        ...(title && { title }),
        ...(detectedDomain && { domain: detectedDomain }),
      },
      score: habitScore,
      icon: 'Flame',
    });
  }

  // Micro Moves
  const microScore = scoreSignals(text, MICRO_MOVE_SIGNALS);
  if (microScore > 0) {
    actions.push({
      type: 'micro_moves',
      label: 'Add Micro Moves',
      description: 'Break this into small actionable steps',
      route: '/home',
      prefill: {
        ...(title && { quickTask: title }),
      },
      score: microScore,
      icon: 'Zap',
    });
  }

  // Calendar
  const calScore = scoreSignals(text, CALENDAR_SIGNALS);
  if (calScore > 0) {
    actions.push({
      type: 'calendar',
      label: 'Add to Calendar',
      description: 'Schedule this as a life event or reminder',
      route: '/life-events',
      prefill: {
        ...(title && { title }),
      },
      score: calScore,
      icon: 'Calendar',
    });
  }

  // Playbook
  let playbookScore = 0;
  const normalizedPhase = normalizePhase(lifePhase);
  if (normalizedPhase) {
    const phasePatterns = PHASE_PLAYBOOK_KEYWORDS[normalizedPhase];
    if (phasePatterns) {
      for (const [pattern] of phasePatterns) {
        if (pattern.test(text)) {
          playbookScore = Math.max(playbookScore, 0.5);
        }
      }
    }
  }
  // Also check general playbook relevance
  if (/\b(?:playbook|guide|framework|system|plan|strategy|template)\b/i.test(text)) {
    playbookScore = Math.max(playbookScore, 0.4);
  }
  if (playbookScore > 0 && source !== 'playbook') {
    actions.push({
      type: 'playbook',
      label: 'Find Playbook',
      description: 'Open a relevant playbook for this topic',
      route: '/library',
      prefill: {
        ...(normalizedPhase && { phase: normalizedPhase }),
      },
      score: playbookScore,
      icon: 'BookOpen',
    });
  }

  // Community Post
  const communityScore = scoreSignals(text, COMMUNITY_SIGNALS);
  if (communityScore > 0.3) {
    actions.push({
      type: 'community_post',
      label: 'Share with Community',
      description: 'Post this insight or milestone',
      route: '/community',
      prefill: {},
      score: communityScore * 0.8, // slightly deprioritize
      icon: 'Users',
    });
  }

  // Journal
  const journalScore = scoreSignals(text, JOURNAL_SIGNALS);
  if (journalScore > 0 && source !== 'journal') {
    actions.push({
      type: 'journal',
      label: 'Add to Journal',
      description: 'Capture this as a reflection',
      route: '/journal',
      prefill: {
        ...(title && { reflection: title }),
      },
      score: journalScore * 0.7, // lower priority
      icon: 'PenLine',
    });
  }

  // Sort by score descending, cap at 4 suggestions
  return actions
    .filter(a => a.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function normalizePhase(phase?: string | null): string | null {
  if (!phase) return null;
  const p = phase.toLowerCase();
  if (p.includes('student') || p.includes('early')) return 'student';
  if (p.includes('builder')) return 'builder';
  if (p.includes('family') || p.includes('home')) return 'family';
  if (p.includes('explorer')) return 'explorer';
  if (p.includes('legacy') || p.includes('impact')) return 'legacy';
  return null;
}

/**
 * Build URL with prefill params
 */
export function buildActionUrl(action: SuggestedAction): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(action.prefill)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${action.route}?${qs}` : action.route;
}
