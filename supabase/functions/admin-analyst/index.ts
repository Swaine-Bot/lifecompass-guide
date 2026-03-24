import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PRIVACY_THRESHOLD = 5;

// ── Utility helpers ──
function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 86400000);
}
function dateStr(d: Date): string { return d.toISOString().split('T')[0]; }
function safeDiv(num: number, den: number, digits = 1): string {
  return den > 0 ? (num / den).toFixed(digits) : '0';
}
function suppressSmall(count: number): string {
  return count >= PRIVACY_THRESHOLD ? String(count) : '<5 (suppressed)';
}

async function gatherPlatformContext(adminClient: any) {
  const now = new Date();
  const todayStr = dateStr(now);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000);

  const [
    { data: profiles },
    { data: subscriptions },
    { data: sessions },
    { data: habits },
    { data: habitLogs },
    { data: goals },
    { data: journals },
    { data: posts },
    { data: mentorConvos },
    { data: mentorMsgCounts },
    { data: shareEvents },
    { data: dailySignals },
    { data: streaks },
    { data: checkins },
    { data: xpEvents },
    { data: engagementEvents },
  ] = await Promise.all([
    adminClient.from('profiles').select('user_id, life_phase, country, province, created_at, account_type, micro_moves_count, mentor_style, primary_intent, focus_areas'),
    adminClient.from('user_subscriptions').select('user_id, tier, is_active, created_at, started_at'),
    adminClient.from('app_sessions').select('user_id, duration_seconds, started_at'),
    adminClient.from('habits').select('id, user_id, created_at, frequency'),
    adminClient.from('habit_logs').select('habit_id, date, completed'),
    adminClient.from('goals').select('id, user_id, category, status, created_at, target_date, updated_at'),
    adminClient.from('journal_entries').select('id, user_id, created_at, mood, energy, date'),
    adminClient.from('posts').select('id, user_id, created_at, post_type, visibility'),
    adminClient.from('mentor_conversations').select('id, user_id, created_at'),
    adminClient.from('mentor_messages').select('id, conversation_id, role, created_at'),
    adminClient.from('share_events').select('id, card_type, share_target, format, created_at, user_id'),
    adminClient.from('daily_signals').select('id, user_id, signal_type, is_read, created_at'),
    adminClient.from('momentum_streaks').select('user_id, current_streak, longest_streak, last_activity_date'),
    adminClient.from('daily_checkins').select('user_id, date, mood, energy'),
    adminClient.from('xp_events').select('user_id, domain, xp_amount, source_type, created_at'),
    adminClient.from('engagement_events').select('user_id, event_type, source_engine, created_at'),
  ]);

  const totalUsers = profiles?.length || 0;
  const allProfiles = profiles || [];
  const allSessions = sessions || [];
  const allGoals = goals || [];
  const allHabits = habits || [];
  const allHabitLogs = habitLogs || [];
  const allJournals = journals || [];
  const allPosts = posts || [];
  const allMentorConvos = mentorConvos || [];
  const allMentorMsgs = mentorMsgCounts || [];
  const allShareEvents = shareEvents || [];
  const allStreaks = streaks || [];
  const allCheckins = checkins || [];
  const allXpEvents = xpEvents || [];
  const allEngagement = engagementEvents || [];

  // ═══════════════════════════════════════════════════
  // 1. ACTIVE USERS (DAU / WAU / MAU)
  // ═══════════════════════════════════════════════════
  const sessionsByUser: Record<string, any[]> = {};
  allSessions.forEach(s => {
    if (!sessionsByUser[s.user_id]) sessionsByUser[s.user_id] = [];
    sessionsByUser[s.user_id].push(s);
  });
  const activeToday = new Set(allSessions.filter(s => s.started_at && dateStr(new Date(s.started_at)) === todayStr).map(s => s.user_id)).size;
  const activeWeek = new Set(allSessions.filter(s => s.started_at && new Date(s.started_at) >= weekAgo).map(s => s.user_id)).size;
  const activeMonth = new Set(allSessions.filter(s => s.started_at && new Date(s.started_at) >= monthAgo).map(s => s.user_id)).size;
  const stickiness = activeMonth > 0 ? (activeToday / activeMonth * 100) : 0;

  // Avg sessions per user per week (last 7d)
  const weekSessions = allSessions.filter(s => s.started_at && new Date(s.started_at) >= weekAgo);
  const weekSessionUsers = new Set(weekSessions.map(s => s.user_id));
  const avgSessionsPerUserPerWeek = weekSessionUsers.size > 0 ? weekSessions.length / weekSessionUsers.size : 0;

  // ═══════════════════════════════════════════════════
  // 2. RETENTION ANALYSIS
  // ═══════════════════════════════════════════════════
  const retentionWindows = [1, 3, 7, 14, 30];
  const retentionResults: Record<number, { eligible: number; retained: number; rate: string }> = {};

  // Build user → set of active dates from sessions
  const userActiveDates: Record<string, Set<string>> = {};
  allSessions.forEach(s => {
    if (!s.started_at) return;
    if (!userActiveDates[s.user_id]) userActiveDates[s.user_id] = new Set();
    userActiveDates[s.user_id].add(dateStr(new Date(s.started_at)));
  });

  for (const dayN of retentionWindows) {
    // Users who signed up at least dayN days ago
    const cutoff = new Date(now.getTime() - dayN * 86400000);
    const eligible = allProfiles.filter(p => new Date(p.created_at) <= cutoff);
    let retained = 0;
    eligible.forEach(p => {
      const signupDate = new Date(p.created_at);
      const targetDate = dateStr(new Date(signupDate.getTime() + dayN * 86400000));
      // Rolling: returned on or after target date
      const dates = userActiveDates[p.user_id];
      if (dates) {
        for (const d of dates) {
          if (d >= targetDate) { retained++; break; }
        }
      }
    });
    retentionResults[dayN] = {
      eligible: eligible.length,
      retained,
      rate: eligible.length >= PRIVACY_THRESHOLD ? safeDiv(retained * 100, eligible.length) + '%' : 'below threshold',
    };
  }

  // Activation rate: % completing key action within 72h
  const activationActions: Record<string, Set<string>> = {
    goal_created: new Set(allGoals.map(g => g.user_id)),
    mentor_interaction: new Set(allMentorConvos.map(m => m.user_id)),
    journal_entry: new Set(allJournals.map(j => j.user_id)),
    micro_move: new Set(allProfiles.filter(p => p.micro_moves_count > 0).map(p => p.user_id)),
  };
  const activationWindow = 72 * 3600000; // 72h
  let activatedCount = 0;
  const eligibleForActivation = allProfiles.filter(p => new Date(p.created_at) <= new Date(now.getTime() - activationWindow));
  eligibleForActivation.forEach(p => {
    const signupTs = new Date(p.created_at).getTime();
    const deadline = signupTs + activationWindow;
    // Check if any key action happened within window
    const goalInWindow = allGoals.some(g => g.user_id === p.user_id && new Date(g.created_at).getTime() <= deadline);
    const mentorInWindow = allMentorConvos.some(m => m.user_id === p.user_id && new Date(m.created_at).getTime() <= deadline);
    const journalInWindow = allJournals.some(j => j.user_id === p.user_id && new Date(j.created_at).getTime() <= deadline);
    if (goalInWindow || mentorInWindow || journalInWindow) activatedCount++;
  });
  const activationRate = eligibleForActivation.length >= PRIVACY_THRESHOLD
    ? safeDiv(activatedCount * 100, eligibleForActivation.length) + '%'
    : 'below threshold';

  // ═══════════════════════════════════════════════════
  // 3. CHURN RISK
  // ═══════════════════════════════════════════════════
  const churnWindows = { mild: 7, moderate: 14, severe: 30 };
  const lastActiveMap: Record<string, Date> = {};
  allSessions.forEach(s => {
    if (!s.started_at) return;
    const d = new Date(s.started_at);
    if (!lastActiveMap[s.user_id] || d > lastActiveMap[s.user_id]) lastActiveMap[s.user_id] = d;
  });

  const churnRiskBands = { low: 0, medium: 0, high: 0, churned: 0 };
  const churnDetails: { band: string; count: number; avgInactiveDays: number }[] = [];
  let totalInactiveDaysHigh = 0, highCount = 0;
  let totalInactiveDaysMed = 0, medCount = 0;

  allProfiles.forEach(p => {
    const lastActive = lastActiveMap[p.user_id];
    if (!lastActive) {
      churnRiskBands.churned++;
      return;
    }
    const inactiveDays = daysBetween(lastActive, now);
    if (inactiveDays <= 3) churnRiskBands.low++;
    else if (inactiveDays <= 7) { churnRiskBands.medium++; totalInactiveDaysMed += inactiveDays; medCount++; }
    else { churnRiskBands.high++; totalInactiveDaysHigh += inactiveDays; highCount++; }
  });

  // Behavior decay: users with declining session freq (last 2 weeks vs prior 2 weeks)
  let decayCount = 0;
  Object.entries(sessionsByUser).forEach(([uid, userSessions]) => {
    const recent = userSessions.filter(s => s.started_at && new Date(s.started_at) >= weekAgo).length;
    const prior = userSessions.filter(s => s.started_at && new Date(s.started_at) >= twoWeeksAgo && new Date(s.started_at) < weekAgo).length;
    if (prior > 0 && recent < prior * 0.5) decayCount++;
  });

  // Re-engagement: users who were inactive 7+d then came back in last 7d
  let reEngagedCount = 0;
  allProfiles.forEach(p => {
    const userSess = sessionsByUser[p.user_id] || [];
    const recentSess = userSess.filter(s => s.started_at && new Date(s.started_at) >= weekAgo);
    if (recentSess.length === 0) return;
    const priorSess = userSess.filter(s => s.started_at && new Date(s.started_at) < weekAgo);
    if (priorSess.length === 0) return;
    const lastPrior = priorSess.reduce((max, s) => {
      const d = new Date(s.started_at);
      return d > max ? d : max;
    }, new Date(0));
    if (daysBetween(lastPrior, weekAgo) >= 7) reEngagedCount++;
  });

  // ═══════════════════════════════════════════════════
  // 4. GOAL INTELLIGENCE
  // ═══════════════════════════════════════════════════
  const goalCreationRate = totalUsers > 0 ? allGoals.length / totalUsers : 0;
  const completedGoals = allGoals.filter(g => g.status === 'completed');
  const goalCompletionRate = allGoals.length > 0 ? completedGoals.length / allGoals.length * 100 : 0;

  // Goal progress velocity (avg days from creation to completion)
  const completionTimes = completedGoals
    .filter(g => g.created_at && g.updated_at)
    .map(g => daysBetween(new Date(g.created_at), new Date(g.updated_at)));
  const avgCompletionDays = completionTimes.length > 0
    ? (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(1)
    : 'N/A';

  // Goal abandonment (no update in 14+ days, not completed)
  const abandonedGoals = allGoals.filter(g => {
    if (g.status === 'completed' || g.status === 'archived') return false;
    const lastUpdate = new Date(g.updated_at || g.created_at);
    return daysBetween(lastUpdate, now) >= 14;
  });

  // Category distribution
  const goalCategoryCounts: Record<string, { total: number; completed: number }> = {};
  allGoals.forEach(g => {
    const cat = g.category || 'uncategorized';
    if (!goalCategoryCounts[cat]) goalCategoryCounts[cat] = { total: 0, completed: 0 };
    goalCategoryCounts[cat].total++;
    if (g.status === 'completed') goalCategoryCounts[cat].completed++;
  });

  // Success metric clarity: has target_date
  const goalsWithTargetDate = allGoals.filter(g => g.target_date).length;
  const clarityScore = allGoals.length > 0 ? (goalsWithTargetDate / allGoals.length * 100) : 0;

  // ═══════════════════════════════════════════════════
  // 5. MENTOR ENGAGEMENT
  // ═══════════════════════════════════════════════════
  const mentorUserIds = new Set(allMentorConvos.map(m => m.user_id));
  const messagesPerUser = mentorUserIds.size > 0 ? allMentorMsgs.length / mentorUserIds.size : 0;

  // Conversation depth: messages per conversation
  const msgsByConvo: Record<string, number> = {};
  allMentorMsgs.forEach(m => { msgsByConvo[m.conversation_id] = (msgsByConvo[m.conversation_id] || 0) + 1; });
  const convoDepths = Object.values(msgsByConvo);
  const avgConvoDepth = convoDepths.length > 0 ? convoDepths.reduce((a, b) => a + b, 0) / convoDepths.length : 0;

  // Mentor dependency: % of sessions involving mentor (approx via users)
  const mentorDependency = totalUsers > 0 ? (mentorUserIds.size / totalUsers * 100) : 0;

  // Early signal: users with ≥2 mentor interactions in first 48h
  const earlyMentorUsers = allProfiles.filter(p => {
    const signupTs = new Date(p.created_at).getTime();
    const convosIn48h = allMentorConvos.filter(m => m.user_id === p.user_id && new Date(m.created_at).getTime() - signupTs <= 48 * 3600000);
    return convosIn48h.length >= 2;
  }).length;

  // ═══════════════════════════════════════════════════
  // 6. FEATURE ADOPTION
  // ═══════════════════════════════════════════════════
  const features: Record<string, { users: Set<string>; total: number; firstUseDeltas: number[] }> = {
    goals: { users: new Set(), total: 0, firstUseDeltas: [] },
    journal: { users: new Set(), total: 0, firstUseDeltas: [] },
    mentor: { users: new Set(), total: 0, firstUseDeltas: [] },
    habits: { users: new Set(), total: 0, firstUseDeltas: [] },
    feed: { users: new Set(), total: 0, firstUseDeltas: [] },
    sharing: { users: new Set(), total: 0, firstUseDeltas: [] },
    micro_moves: { users: new Set(), total: 0, firstUseDeltas: [] },
  };

  const userSignup: Record<string, number> = {};
  allProfiles.forEach(p => { userSignup[p.user_id] = new Date(p.created_at).getTime(); });

  allGoals.forEach(g => { features.goals.users.add(g.user_id); features.goals.total++; });
  allJournals.forEach(j => { features.journal.users.add(j.user_id); features.journal.total++; });
  allMentorConvos.forEach(m => { features.mentor.users.add(m.user_id); features.mentor.total++; });
  allHabits.forEach(h => { features.habits.users.add(h.user_id); features.habits.total++; });
  allPosts.forEach(p => { features.feed.users.add(p.user_id); features.feed.total++; });
  allShareEvents.forEach(s => { features.sharing.users.add(s.user_id); features.sharing.total++; });
  allProfiles.filter(p => p.micro_moves_count > 0).forEach(p => { features.micro_moves.users.add(p.user_id); features.micro_moves.total += p.micro_moves_count; });

  // Time to first use (for goals, journal, mentor)
  const firstUseCalc = (items: any[], uidField = 'user_id', dateField = 'created_at') => {
    const firstByUser: Record<string, number> = {};
    items.forEach(i => {
      const ts = new Date(i[dateField]).getTime();
      if (!firstByUser[i[uidField]] || ts < firstByUser[i[uidField]]) firstByUser[i[uidField]] = ts;
    });
    return Object.entries(firstByUser).map(([uid, ts]) => {
      const signup = userSignup[uid];
      return signup ? (ts - signup) / 3600000 : null; // hours
    }).filter(v => v !== null) as number[];
  };

  const ttfu: Record<string, string> = {};
  ['goals', 'journal', 'mentor'].forEach(f => {
    const src = f === 'goals' ? allGoals : f === 'journal' ? allJournals : allMentorConvos;
    const deltas = firstUseCalc(src);
    ttfu[f] = deltas.length > 0 ? (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1) + 'h' : 'N/A';
  });

  // Cross-feature usage
  const userFeatureCount: Record<string, number> = {};
  allProfiles.forEach(p => { userFeatureCount[p.user_id] = 0; });
  Object.values(features).forEach(f => {
    f.users.forEach(uid => { userFeatureCount[uid] = (userFeatureCount[uid] || 0) + 1; });
  });
  const featureCountDist: Record<number, number> = {};
  Object.values(userFeatureCount).forEach(c => { featureCountDist[c] = (featureCountDist[c] || 0) + 1; });

  // ═══════════════════════════════════════════════════
  // 7. ANOMALY DETECTION
  // ═══════════════════════════════════════════════════
  // Compare last 7d vs prior 7d for key metrics
  const last7dSessions = allSessions.filter(s => s.started_at && new Date(s.started_at) >= weekAgo).length;
  const prior7dSessions = allSessions.filter(s => s.started_at && new Date(s.started_at) >= twoWeeksAgo && new Date(s.started_at) < weekAgo).length;
  const sessionChange = prior7dSessions > 0 ? ((last7dSessions - prior7dSessions) / prior7dSessions * 100) : 0;

  const last7dGoals = allGoals.filter(g => new Date(g.created_at) >= weekAgo).length;
  const prior7dGoals = allGoals.filter(g => new Date(g.created_at) >= twoWeeksAgo && new Date(g.created_at) < weekAgo).length;
  const goalChange = prior7dGoals > 0 ? ((last7dGoals - prior7dGoals) / prior7dGoals * 100) : 0;

  const last7dMentor = allMentorMsgs.filter(m => new Date(m.created_at) >= weekAgo).length;
  const prior7dMentor = allMentorMsgs.filter(m => new Date(m.created_at) >= twoWeeksAgo && new Date(m.created_at) < weekAgo).length;
  const mentorChange = prior7dMentor > 0 ? ((last7dMentor - prior7dMentor) / prior7dMentor * 100) : 0;

  const anomalies: { metric: string; change: string; severity: string }[] = [];
  const checkAnomaly = (name: string, changePct: number) => {
    const abs = Math.abs(changePct);
    if (abs > 100) anomalies.push({ metric: name, change: changePct.toFixed(0) + '%', severity: 'critical' });
    else if (abs > 50) anomalies.push({ metric: name, change: changePct.toFixed(0) + '%', severity: 'warning' });
  };
  checkAnomaly('Sessions (7d)', sessionChange);
  checkAnomaly('Goals created (7d)', goalChange);
  checkAnomaly('Mentor messages (7d)', mentorChange);

  // ═══════════════════════════════════════════════════
  // SUPPORTING METRICS
  // ═══════════════════════════════════════════════════
  // Subscriptions
  const subCounts: Record<string, number> = { free: 0, pro: 0, founder: 0 };
  const paidUsers = new Set<string>();
  (subscriptions || []).filter((s: any) => s.is_active).forEach((s: any) => { subCounts[s.tier] = (subCounts[s.tier] || 0) + 1; paidUsers.add(s.user_id); });
  subCounts.free = totalUsers - paidUsers.size;

  // Life phase
  const lifePhaseCounts: Record<string, number> = {};
  allProfiles.forEach(p => { lifePhaseCounts[p.life_phase || 'unknown'] = (lifePhaseCounts[p.life_phase || 'unknown'] || 0) + 1; });

  // Country
  const countryCounts: Record<string, number> = {};
  allProfiles.forEach(p => { countryCounts[p.country || 'Unknown'] = (countryCounts[p.country || 'Unknown'] || 0) + 1; });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Mood / energy
  let moodSum = 0, moodCount = 0, energySum = 0, energyCount = 0;
  allJournals.forEach(j => {
    if (j.mood != null) { moodSum += j.mood; moodCount++; }
    if (j.energy != null) { energySum += j.energy; energyCount++; }
  });
  allCheckins.forEach(c => {
    if (c.mood != null) { moodSum += c.mood; moodCount++; }
    if (c.energy != null) { energySum += c.energy; energyCount++; }
  });

  // Streaks
  const streakValues = allStreaks.map(s => s.current_streak);
  const avgStreak = streakValues.length > 0 ? streakValues.reduce((a, b) => a + b, 0) / streakValues.length : 0;
  const maxStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

  // Habits
  const completedLogs = allHabitLogs.filter(l => l.completed).length;
  const habitCompletionRate = allHabitLogs.length > 0 ? (completedLogs / allHabitLogs.length * 100) : 0;

  // XP by domain
  const xpByDomain: Record<string, number> = {};
  allXpEvents.forEach(e => { xpByDomain[e.domain] = (xpByDomain[e.domain] || 0) + e.xp_amount; });

  // Shares
  const shareTargetCounts: Record<string, number> = {};
  allShareEvents.forEach(e => { shareTargetCounts[e.share_target || 'native'] = (shareTargetCounts[e.share_target || 'native'] || 0) + 1; });

  // Micro moves total
  const totalMicroMoves = allProfiles.reduce((sum, p) => sum + (p.micro_moves_count || 0), 0);

  // Weekly growth (last 12 weeks)
  const weeklyGrowth: { week: string; newUsers: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const count = allProfiles.filter(p => {
      const d = new Date(p.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    weeklyGrowth.push({ week: dateStr(weekStart), newUsers: count });
  }

  // Session depth
  const userTotalDuration: Record<string, number> = {};
  allSessions.forEach(s => { userTotalDuration[s.user_id] = (userTotalDuration[s.user_id] || 0) + (s.duration_seconds || 0); });
  const avgDurationPerUser = Object.keys(userTotalDuration).length > 0
    ? (Object.values(userTotalDuration).reduce((a, b) => a + b, 0) / Object.keys(userTotalDuration).length / 60).toFixed(1)
    : '0';

  // Signal read rate
  const allSignals = dailySignals || [];
  const signalReadRate = allSignals.length > 0 ? (allSignals.filter(s => s.is_read).length / allSignals.length * 100).toFixed(1) : '0';

  // ═══════════════════════════════════════════════════
  // MATURITY MODE DETERMINATION
  // ═══════════════════════════════════════════════════
  let maturityMode: string;
  let maturityGuidance: string;
  if (totalUsers < 50) {
    maturityMode = 'BEHAVIORAL DESIGN';
    maturityGuidance = `The platform has ${totalUsers} users (<50). Classical statistical analysis and prediction are NOT reliable.
DO NOT say "insufficient data" and stop. Instead:
- Identify early behavioral signals, activation patterns, friction points
- Recommend what to instrument, track, and test next
- Provide product design and onboarding insights based on observed patterns
- Explain what CANNOT yet be concluded, then pivot to what CAN be learned
- Act as a strategic product advisor, not a statistician`;
  } else if (totalUsers < 200) {
    maturityMode = 'EARLY SIGNAL';
    maturityGuidance = `The platform has ${totalUsers} users — enough for directional analysis but not high-confidence statistics.
- Provide directional findings with cautious language
- Separate promising patterns from unsupported assumptions
- Recommend experiments and monitoring priorities`;
  } else if (totalUsers < 1000) {
    maturityMode = 'STATISTICAL';
    maturityGuidance = `The platform has ${totalUsers} users — sufficient for proper descriptive and inferential analysis.
- Report confidence levels and effect sizes
- Distinguish statistical significance from practical significance
- Flag small sub-cohorts below reliable thresholds`;
  } else {
    maturityMode = 'PREDICTIVE';
    maturityGuidance = `The platform has ${totalUsers} users — sufficient for predictive modeling.
- Provide predictive outputs with probability/risk bands
- Identify feature importance and likely predictors
- Recommend targeted interventions for at-risk cohorts`;
  }

  return `
=== LIFESTACK PLATFORM ANALYTICS SNAPSHOT ===
Generated: ${now.toISOString()}
Privacy threshold: ${PRIVACY_THRESHOLD} users minimum per cohort

── MATURITY ASSESSMENT ──
Analysis mode: ${maturityMode}
Total platform users: ${totalUsers}
${maturityGuidance}

══════════════════════════════════════════
1. RETENTION ANALYSIS
══════════════════════════════════════════
DAU: ${activeToday} | WAU: ${activeWeek} | MAU: ${activeMonth}
Stickiness (DAU/MAU): ${stickiness.toFixed(1)}%
Avg sessions/user/week: ${avgSessionsPerUserPerWeek.toFixed(1)}

Day-N Retention (rolling):
${retentionWindows.map(d => `  Day ${d}: ${retentionResults[d].rate} (${retentionResults[d].retained}/${retentionResults[d].eligible} eligible)`).join('\n')}

Activation Rate (72h window): ${activationRate}
  Eligible users: ${eligibleForActivation.length}
  Activated: ${activatedCount}
  Key actions tracked: goal_created, mentor_interaction, journal_entry

══════════════════════════════════════════
2. CHURN RISK
══════════════════════════════════════════
Risk bands:
  Low (≤3d inactive): ${churnRiskBands.low}
  Medium (4-7d inactive): ${churnRiskBands.medium}${medCount > 0 ? ` (avg ${safeDiv(totalInactiveDaysMed, medCount)}d inactive)` : ''}
  High (8+d inactive): ${churnRiskBands.high}${highCount > 0 ? ` (avg ${safeDiv(totalInactiveDaysHigh, highCount)}d inactive)` : ''}
  Never returned: ${churnRiskBands.churned}

Behavior decay (session freq dropped >50% week-over-week): ${decayCount} users
Re-engagement (returned after 7+d gap): ${reEngagedCount} users

══════════════════════════════════════════
3. GOAL INTELLIGENCE
══════════════════════════════════════════
Total goals: ${allGoals.length}
Goals per user: ${goalCreationRate.toFixed(1)}
Completion rate: ${goalCompletionRate.toFixed(1)}%
Avg completion time: ${avgCompletionDays} days
Abandoned goals (14+d no update): ${abandonedGoals.length}
Goal clarity score (has target date): ${clarityScore.toFixed(1)}%

Category breakdown:
${Object.entries(goalCategoryCounts).sort((a, b) => b[1].total - a[1].total).slice(0, 8).map(([cat, d]) => `  ${cat}: ${d.total} goals (${d.total > 0 ? (d.completed / d.total * 100).toFixed(0) : 0}% complete)`).join('\n') || '  No goals yet'}

Goal status: ${Object.entries(goalCategoryCounts).length > 0 ? allGoals.reduce((acc: Record<string, number>, g) => { acc[g.status || 'active'] = (acc[g.status || 'active'] || 0) + 1; return acc; }, {} as Record<string, number>) ? JSON.stringify(allGoals.reduce((acc: Record<string, number>, g) => { acc[g.status || 'active'] = (acc[g.status || 'active'] || 0) + 1; return acc; }, {})) : 'N/A' : 'N/A'}

══════════════════════════════════════════
4. MENTOR ENGAGEMENT
══════════════════════════════════════════
Users who used mentor: ${mentorUserIds.size} (${totalUsers > 0 ? (mentorUserIds.size / totalUsers * 100).toFixed(1) : 0}% adoption)
Total conversations: ${allMentorConvos.length}
Total messages: ${allMentorMsgs.length}
Messages per mentor user: ${messagesPerUser.toFixed(1)}
Avg conversation depth: ${avgConvoDepth.toFixed(1)} messages
Mentor dependency (% users): ${mentorDependency.toFixed(1)}%
Early mentor engagement (≥2 convos in first 48h): ${earlyMentorUsers} users

══════════════════════════════════════════
5. FEATURE ADOPTION
══════════════════════════════════════════
${Object.entries(features).map(([name, f]) => `${name}: ${f.users.size} users (${totalUsers > 0 ? (f.users.size / totalUsers * 100).toFixed(1) : 0}% adoption, ${f.total} total)`).join('\n')}

Time to first use:
${Object.entries(ttfu).map(([f, t]) => `  ${f}: ${t}`).join('\n')}

Cross-feature distribution:
${Object.entries(featureCountDist).sort((a, b) => Number(a[0]) - Number(b[0])).map(([count, users]) => `  ${count} features: ${users} users`).join('\n')}

══════════════════════════════════════════
6. ANOMALY DETECTION (7d vs prior 7d)
══════════════════════════════════════════
Sessions: ${last7dSessions} vs ${prior7dSessions} (${sessionChange >= 0 ? '+' : ''}${sessionChange.toFixed(0)}%)
Goals created: ${last7dGoals} vs ${prior7dGoals} (${goalChange >= 0 ? '+' : ''}${goalChange.toFixed(0)}%)
Mentor messages: ${last7dMentor} vs ${prior7dMentor} (${mentorChange >= 0 ? '+' : ''}${mentorChange.toFixed(0)}%)

${anomalies.length > 0 ? `⚠ Anomalies detected:\n${anomalies.map(a => `  [${a.severity.toUpperCase()}] ${a.metric}: ${a.change}`).join('\n')}` : '✓ No anomalies detected'}

══════════════════════════════════════════
SUPPORTING METRICS
══════════════════════════════════════════

── SUBSCRIPTIONS ──
Free: ${subCounts.free} | Pro: ${subCounts.pro} | Founder: ${subCounts.founder}
Conversion: ${totalUsers > 0 ? (paidUsers.size / totalUsers * 100).toFixed(1) : 0}%

── WEEKLY GROWTH (12w) ──
${weeklyGrowth.map(w => `${w.week}: +${w.newUsers}`).join('\n')}

── DEMOGRAPHICS ──
Life phases: ${Object.entries(lifePhaseCounts).filter(([_, c]) => c >= PRIVACY_THRESHOLD).map(([p, c]) => `${p}: ${c}`).join(', ') || 'Below threshold'}
Top countries: ${topCountries.filter(([_, c]) => c >= PRIVACY_THRESHOLD).map(([n, c]) => `${n}: ${c}`).join(', ') || 'Below threshold'}

── MOOD & ENERGY ──
Avg mood: ${moodCount > 0 ? (moodSum / moodCount).toFixed(2) : 'N/A'} (n=${moodCount})
Avg energy: ${energyCount > 0 ? (energySum / energyCount).toFixed(2) : 'N/A'} (n=${energyCount})

── STREAKS ──
Avg streak: ${avgStreak.toFixed(1)}d | Max: ${maxStreak}d | Active: ${streakValues.filter(v => v > 0).length}

── HABITS ──
Total: ${allHabits.length} | Logs: ${allHabitLogs.length} | Completion: ${habitCompletionRate.toFixed(1)}%

── XP ──
${Object.entries(xpByDomain).map(([d, xp]) => `${d}: ${xp}`).join(', ') || 'No XP data'}

── SHARES ──
Total: ${allShareEvents.length} | Targets: ${Object.entries(shareTargetCounts).map(([t, c]) => `${t}: ${c}`).join(', ') || 'None'}

── MICRO MOVES ──
Total: ${totalMicroMoves}

── SESSIONS ──
Avg duration/user: ${avgDurationPerUser} min

── DAILY SIGNALS ──
Total: ${allSignals.length} | Read rate: ${signalReadRate}%
`;
}

const SYSTEM_PROMPT = `You are the LifeStack AI Analyst — a privacy-first, maturity-aware intelligence partner for the LifeStack admin team.

ROLE:
You analyze aggregated platform data to provide strategic, actionable insights at every stage of growth.

AVAILABLE METRICS FRAMEWORK:
The platform data snapshot includes standardized metrics across 6 categories. Reference these when answering queries:

**1. Retention Analysis** — Day-N retention (rolling), stickiness (DAU/MAU), session frequency, activation rate (72h window)
**2. Churn Risk** — Inactivity duration bands (low/med/high/churned), behavior decay score (session drop >50%), re-engagement rate
**3. Goal Intelligence** — Creation rate, completion rate, velocity (days), abandonment (14d), category distribution, clarity score
**4. Mentor Engagement** — Messages per user, conversation depth, dependency %, early engagement signal (2+ convos in 48h)
**5. Feature Adoption** — Adoption rate per feature, time-to-first-use, cross-feature distribution, drop-off analysis
**6. Anomaly Detection** — 7d-vs-prior-7d comparison for sessions/goals/mentor, severity-scored anomalies

MATURITY-AWARE ANALYSIS (CRITICAL):
The snapshot includes a MATURITY ASSESSMENT section. ALWAYS adapt your response to the current mode:

**BEHAVIORAL DESIGN MODE** (< 50 users):
- NEVER stop at "insufficient data" — FORBIDDEN
- Pivot to: activation patterns, friction points, instrumentation recommendations
- Answer: what matters now, what to watch, likely leading indicators
- Structure: Direct Answer → What Cannot Be Concluded → What Can Be Learned → Early Signals → Product/Tracking Actions → Caveats

**EARLY SIGNAL MODE** (50-199 users):
- Cautious language ("likely", "early signal suggests")
- Structure: Direct Answer → Directional Findings → Evidence Strength → Experiments → Caveats

**STATISTICAL MODE** (200-999 users):
- Proper inferential results, confidence levels, effect sizes
- Structure: Direct Answer → Key Findings → Evidence/Metrics → Statistical Notes → Actions → Caveats

**PREDICTIVE MODE** (1000+ users):
- Predictive outputs with probability/risk bands, feature importance
- Structure: Direct Answer → Predicted Outcome → Predictors → Evidence → Interventions → Caveats

QUERY-SPECIFIC MODE OVERRIDE: A niche sub-cohort may need a different mode than the overall platform.

PRIVACY RULES (MANDATORY):
- NEVER expose individual user data, names, IDs, or PII
- NEVER quote raw private content (journal entries, mentor chats)
- Cohorts < 5 users: suppress exact numbers, provide privacy-safe strategic guidance
- If asked for invasive analysis, offer a privacy-safe alternative

RESPONSE GUIDELINES:
- Reference specific metrics from the snapshot (cite numbers)
- Use markdown formatting with tables and lists
- Begin each response with: *Analysis mode: [mode]*
- Be honest about uncertainty but never defeatist
- When predictive data is insufficient, pivot to strongest current signals`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const adminClient = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roleData } = await adminClient
      .from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const platformContext = await gatherPlatformContext(adminClient);

    // Log query (privacy-safe)
    try {
      await adminClient.from('engagement_events').insert({
        user_id: userData.user.id,
        event_type: 'admin_analyst_query',
        source_engine: 'admin_analyst',
        metadata: { message_count: messages.length, timestamp: new Date().toISOString() },
      });
    } catch { /* non-critical */ }

    const aiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Here is the current platform data snapshot for your analysis:\n\n${platformContext}` },
      ...messages,
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: unknown) {
    console.error('admin-analyst error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
