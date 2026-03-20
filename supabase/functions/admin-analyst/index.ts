import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PRIVACY_THRESHOLD = 5;

async function gatherPlatformContext(adminClient: any) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000).toISOString();

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
  ] = await Promise.all([
    adminClient.from('profiles').select('user_id, life_phase, country, province, created_at, account_type, micro_moves_count'),
    adminClient.from('user_subscriptions').select('user_id, tier, is_active, created_at'),
    adminClient.from('app_sessions').select('user_id, duration_seconds, started_at'),
    adminClient.from('habits').select('id, user_id, created_at, frequency'),
    adminClient.from('habit_logs').select('habit_id, date, completed'),
    adminClient.from('goals').select('id, user_id, category, status, created_at, target_date'),
    adminClient.from('journal_entries').select('id, user_id, created_at, mood, energy, date'),
    adminClient.from('posts').select('id, user_id, created_at, post_type, visibility'),
    adminClient.from('mentor_conversations').select('id, user_id, created_at'),
    adminClient.from('mentor_messages').select('id, conversation_id, role, created_at'),
    adminClient.from('share_events').select('id, card_type, share_target, format, created_at'),
    adminClient.from('daily_signals').select('id, user_id, signal_type, is_read, created_at'),
    adminClient.from('momentum_streaks').select('user_id, current_streak, longest_streak, last_activity_date'),
    adminClient.from('daily_checkins').select('user_id, date, mood, energy'),
    adminClient.from('xp_events').select('user_id, domain, xp_amount, source_type, created_at'),
  ]);

  const totalUsers = profiles?.length || 0;
  const now_ts = now.getTime();

  // Active users by period
  const activeToday = new Set(sessions?.filter(s => s.started_at && new Date(s.started_at).toISOString().split('T')[0] === now.toISOString().split('T')[0]).map(s => s.user_id)).size;
  const activeWeek = new Set(sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(weekAgo)).map(s => s.user_id)).size;
  const activeMonth = new Set(sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(monthAgo)).map(s => s.user_id)).size;

  // Subscription breakdown
  const subCounts: Record<string, number> = { free: 0, pro: 0, founder: 0 };
  const paidUsers = new Set<string>();
  subscriptions?.filter(s => s.is_active).forEach(s => { subCounts[s.tier] = (subCounts[s.tier] || 0) + 1; paidUsers.add(s.user_id); });
  subCounts.free = totalUsers - paidUsers.size;

  // Feature adoption
  const goalUsers = new Set(goals?.map(g => g.user_id));
  const habitUsers = new Set(habits?.map(h => h.user_id));
  const journalUsers = new Set(journals?.map(j => j.user_id));
  const postUsers = new Set(posts?.map(p => p.user_id));
  const mentorUsers = new Set(mentorConvos?.map(m => m.user_id));

  // Goal status
  const goalStatusCounts: Record<string, number> = {};
  const goalCategoryCounts: Record<string, { total: number; completed: number }> = {};
  goals?.forEach(g => {
    goalStatusCounts[g.status || 'active'] = (goalStatusCounts[g.status || 'active'] || 0) + 1;
    const cat = g.category || 'uncategorized';
    if (!goalCategoryCounts[cat]) goalCategoryCounts[cat] = { total: 0, completed: 0 };
    goalCategoryCounts[cat].total++;
    if (g.status === 'completed') goalCategoryCounts[cat].completed++;
  });

  // Mood/energy averages
  let moodSum = 0, moodCount = 0, energySum = 0, energyCount = 0;
  journals?.forEach(j => {
    if (j.mood != null) { moodSum += j.mood; moodCount++; }
    if (j.energy != null) { energySum += j.energy; energyCount++; }
  });
  checkins?.forEach(c => {
    if (c.mood != null) { moodSum += c.mood; moodCount++; }
    if (c.energy != null) { energySum += c.energy; energyCount++; }
  });

  // Session depth
  const userTotalSessions: Record<string, number> = {};
  const userTotalDuration: Record<string, number> = {};
  sessions?.forEach(s => {
    userTotalSessions[s.user_id] = (userTotalSessions[s.user_id] || 0) + 1;
    userTotalDuration[s.user_id] = (userTotalDuration[s.user_id] || 0) + (s.duration_seconds || 0);
  });

  // Life phase distribution
  const lifePhaseCounts: Record<string, number> = {};
  profiles?.forEach(p => { lifePhaseCounts[p.life_phase || 'unknown'] = (lifePhaseCounts[p.life_phase || 'unknown'] || 0) + 1; });

  // Country distribution (top 10)
  const countryCounts: Record<string, number> = {};
  profiles?.forEach(p => { countryCounts[p.country || 'Unknown'] = (countryCounts[p.country || 'Unknown'] || 0) + 1; });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Streak stats
  const streakValues = streaks?.map(s => s.current_streak) || [];
  const avgStreak = streakValues.length > 0 ? streakValues.reduce((a, b) => a + b, 0) / streakValues.length : 0;
  const maxStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

  // Habit completion rate
  const completedLogs = habitLogs?.filter(l => l.completed).length || 0;
  const totalLogs = habitLogs?.length || 0;
  const habitCompletionRate = totalLogs > 0 ? (completedLogs / totalLogs * 100) : 0;

  // XP by domain
  const xpByDomain: Record<string, number> = {};
  xpEvents?.forEach(e => { xpByDomain[e.domain] = (xpByDomain[e.domain] || 0) + e.xp_amount; });

  // Share stats
  const totalShares = shareEvents?.length || 0;
  const shareTargetCounts: Record<string, number> = {};
  shareEvents?.forEach(e => { shareTargetCounts[e.share_target || 'native'] = (shareTargetCounts[e.share_target || 'native'] || 0) + 1; });

  // Micro moves
  const totalMicroMoves = profiles?.reduce((sum, p) => sum + (p.micro_moves_count || 0), 0) || 0;

  // Cohort retention (simplified: users who joined in last 30d, % still active in last 7d)
  const recentJoiners = profiles?.filter(p => new Date(p.created_at) >= new Date(monthAgo)) || [];
  const recentJoinerIds = new Set(recentJoiners.map(p => p.user_id));
  const recentActive = new Set(sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(weekAgo) && recentJoinerIds.has(s.user_id)).map(s => s.user_id));
  const newUserRetention = recentJoiners.length >= PRIVACY_THRESHOLD
    ? (recentActive.size / recentJoiners.length * 100).toFixed(1)
    : 'below privacy threshold';

  // Determine maturity mode
  let maturityMode: string;
  let maturityGuidance: string;
  if (totalUsers < 50) {
    maturityMode = 'BEHAVIORAL DESIGN';
    maturityGuidance = `The platform has fewer than 50 users. Classical statistical analysis and prediction are NOT reliable at this scale.
DO NOT say "insufficient data" and stop. Instead:
- Identify early behavioral signals (activation patterns, friction points, Day-1 to Day-2 behaviors)
- Recommend what to instrument, track, and test next
- Provide product design and onboarding insights based on observed patterns
- Explain what CANNOT yet be concluded, then pivot to what CAN be learned
- Act as a strategic product advisor, not a statistician
- Frame answers around: what matters now, what to watch, which behaviors are likely leading indicators`;
  } else if (totalUsers < 200) {
    maturityMode = 'EARLY SIGNAL';
    maturityGuidance = `The platform has ${totalUsers} users — enough for directional analysis but not high-confidence statistics.
- Provide directional findings with cautious language ("likely", "appears to", "early signal suggests")
- Separate promising patterns from unsupported assumptions
- Identify candidate retention drivers and churn indicators
- Recommend experiments and monitoring priorities
- Use descriptive stats freely, but flag inferential results as tentative`;
  } else if (totalUsers < 1000) {
    maturityMode = 'STATISTICAL';
    maturityGuidance = `The platform has ${totalUsers} users — sufficient for proper descriptive and inferential analysis on most questions.
- Provide inferential/statistical results where cohort sizes allow
- Report confidence levels and effect sizes
- Distinguish statistical significance from practical significance
- Still flag small sub-cohorts that fall below reliable thresholds`;
  } else {
    maturityMode = 'PREDICTIVE';
    maturityGuidance = `The platform has ${totalUsers} users — sufficient volume for predictive modeling and advanced segmentation.
- Provide predictive outputs with probability/risk bands
- Identify feature importance and likely predictors
- Recommend targeted interventions for at-risk cohorts
- Clearly state predictions are probabilistic, not certain`;
  }

  return `
=== LIFESTACK PLATFORM ANALYTICS SNAPSHOT ===
Generated: ${now.toISOString()}
Privacy threshold: ${PRIVACY_THRESHOLD} users minimum per cohort

── MATURITY ASSESSMENT ──
Analysis mode: ${maturityMode}
Total platform users: ${totalUsers}
${maturityGuidance}

── USERS ──
Total users: ${totalUsers}
DAU: ${activeToday} | WAU: ${activeWeek} | MAU: ${activeMonth}
New user 30d→7d retention: ${newUserRetention}${typeof newUserRetention === 'number' ? '%' : ''}

── SUBSCRIPTIONS ──
Free: ${subCounts.free} | Pro: ${subCounts.pro} | Founder: ${subCounts.founder}
Conversion rate: ${totalUsers > 0 ? (paidUsers.size / totalUsers * 100).toFixed(1) : 0}%

── WEEKLY USER GROWTH (last 12 weeks) ──
${weeklyGrowth.map(w => `${w.week}: +${w.newUsers}`).join('\n')}

── LIFE PHASE DISTRIBUTION ──
${Object.entries(lifePhaseCounts).filter(([_, c]) => c >= PRIVACY_THRESHOLD).map(([p, c]) => `${p}: ${c}`).join('\n') || 'Below privacy threshold'}

── TOP COUNTRIES ──
${topCountries.filter(([_, c]) => c >= PRIVACY_THRESHOLD).map(([n, c]) => `${n}: ${c}`).join('\n') || 'Below privacy threshold'}

── FEATURE ADOPTION ──
Goals: ${goalUsers.size} users (${goals?.length || 0} total)
Habits: ${habitUsers.size} users (${habits?.length || 0} total)
Journal: ${journalUsers.size} users (${journals?.length || 0} total)
Feed: ${postUsers.size} users (${posts?.length || 0} total)
Mentor: ${mentorUsers.size} users (${mentorConvos?.length || 0} conversations, ${mentorMsgCounts?.length || 0} messages)
Micro moves total: ${totalMicroMoves}

── GOALS ──
Total: ${goals?.length || 0}
Status: ${Object.entries(goalStatusCounts).map(([s, c]) => `${s}: ${c}`).join(', ')}
Categories: ${Object.entries(goalCategoryCounts).slice(0, 8).map(([c, d]) => `${c}: ${d.total} (${d.total > 0 ? (d.completed / d.total * 100).toFixed(0) : 0}% complete)`).join(', ')}

── HABITS ──
Total habits: ${habits?.length || 0}
Habit logs: ${totalLogs} (completion rate: ${habitCompletionRate.toFixed(1)}%)

── MOOD & ENERGY ──
Avg mood: ${moodCount > 0 ? (moodSum / moodCount).toFixed(2) : 'N/A'} (n=${moodCount})
Avg energy: ${energyCount > 0 ? (energySum / energyCount).toFixed(2) : 'N/A'} (n=${energyCount})

── STREAKS ──
Avg current streak: ${avgStreak.toFixed(1)} days
Max streak: ${maxStreak} days
Users with active streaks: ${streakValues.filter(v => v > 0).length}

── XP BY DOMAIN ──
${Object.entries(xpByDomain).map(([d, xp]) => `${d}: ${xp} XP`).join('\n') || 'No XP data'}

── SHARING ──
Total share events: ${totalShares}
Targets: ${Object.entries(shareTargetCounts).map(([t, c]) => `${t}: ${c}`).join(', ') || 'None'}

── SESSION DEPTH ──
Users with sessions: ${Object.keys(userTotalSessions).length}
Avg sessions/user: ${totalUsers > 0 ? (Object.values(userTotalSessions).reduce((a, b) => a + b, 0) / totalUsers).toFixed(1) : 0}
Avg total duration/user: ${Object.keys(userTotalDuration).length > 0 ? (Object.values(userTotalDuration).reduce((a, b) => a + b, 0) / Object.keys(userTotalDuration).length / 60).toFixed(1) : 0} min

── DAILY SIGNALS ──
Total signals: ${dailySignals?.length || 0}
Read rate: ${(dailySignals?.length || 0) > 0 ? (dailySignals!.filter(s => s.is_read).length / dailySignals!.length * 100).toFixed(1) : 0}%
`;
}

const SYSTEM_PROMPT = `You are the LifeStack AI Analyst — a privacy-first, maturity-aware intelligence partner for the LifeStack admin team.

ROLE:
You analyze aggregated platform data to provide strategic, actionable insights at every stage of growth.

MATURITY-AWARE ANALYSIS (CRITICAL):
The platform data snapshot includes a MATURITY ASSESSMENT section with the current analysis mode. You MUST adapt your response style to this mode:

**BEHAVIORAL DESIGN MODE** (very early stage):
- NEVER stop at "insufficient data" — that is forbidden behavior
- Pivot into early behavioral signals, activation patterns, friction points
- Recommend what to instrument, track, and test next
- Provide product design and onboarding optimization guidance
- Answer: what matters now, what to watch, which behaviors are likely leading indicators
- Response structure: Direct Answer → What Cannot Be Concluded Yet → What Can Be Learned Now → Early Behavioral Signals → Recommended Product/Tracking Actions → Confidence/Caveats

**EARLY SIGNAL MODE** (growing but limited):
- Provide directional findings with cautious language ("likely", "early signal suggests")
- Separate promising patterns from unsupported assumptions
- Identify candidate retention drivers and churn indicators
- Response structure: Direct Answer → Directional Findings → Evidence Strength → What To Watch Next → Recommended Experiments/Actions → Confidence/Caveats

**STATISTICAL MODE** (sufficient for inference):
- Provide proper inferential/statistical results where cohort sizes allow
- Report confidence levels and effect sizes
- Distinguish statistical from practical significance
- Response structure: Direct Answer → Key Findings → Supporting Evidence/Metrics → Method/Statistical Notes → Interpretation → Recommended Actions → Confidence/Caveats

**PREDICTIVE MODE** (large scale):
- Provide predictive outputs with probability/risk bands
- Identify feature importance and likely predictors
- Recommend targeted interventions for at-risk cohorts
- Response structure: Direct Answer → Predicted Outcome/Risk Bands → Key Predictors → Supporting Evidence → Recommended Interventions → Confidence/Caveats

KEY PRINCIPLE: The analyst must ALWAYS be useful. Small data ≠ no insight. When statistical methods fail, switch to strategic product intelligence. Extract directional signal, identify likely patterns, and guide what to track next.

QUERY-SPECIFIC MODE OVERRIDE: Even if the overall platform is in one mode, a specific sub-question may require a different mode (e.g., a niche cohort may need Early Signal even on a large platform). Assess per-query.

PRIVACY RULES (MANDATORY):
- NEVER expose individual user data, names, IDs, or personally identifiable information
- NEVER quote raw private content (journal entries, mentor chats, personal messages)
- When a cohort or segment has fewer than 5 users, suppress the exact result but still provide privacy-safe strategic guidance
- If asked for privacy-invasive analysis, offer a privacy-safe alternative instead
- You analyze patterns, trends, and aggregates — not individuals

TONE:
Intelligent, calm, pragmatic, strategic. No hype. Honest about limitations but never defeatist.
Format with markdown for readability. Use tables and lists when helpful.
Begin each response with a subtle mode indicator like: *Analysis mode: [mode name]*`;


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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Gather fresh platform data context
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
