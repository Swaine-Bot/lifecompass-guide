import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user identity using service role client
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = userData.user.id;

    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Admin verified, fetching analytics...');

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Parallel data fetch
    const [
      { data: profiles },
      { data: subscriptions },
      { data: sessions },
      { data: habits },
      { data: goals },
      { data: journals },
      { data: posts },
      { data: mentorConvos },
      { data: mentorMessages },
    ] = await Promise.all([
      adminClient.from('profiles').select('id, user_id, country, province, life_phase, gender, created_at'),
      adminClient.from('user_subscriptions').select('*'),
      adminClient.from('app_sessions').select('user_id, duration_seconds, started_at'),
      adminClient.from('habits').select('id, user_id, created_at'),
      adminClient.from('goals').select('id, user_id, created_at, category, status'),
      adminClient.from('journal_entries').select('id, user_id, created_at, mood, energy'),
      adminClient.from('posts').select('id, user_id, created_at'),
      adminClient.from('mentor_conversations').select('id, user_id, created_at, title'),
      adminClient.from('mentor_messages').select('id, conversation_id, created_at, role, content'),
    ]);

    const totalUsers = profiles?.length || 0;

    // Active users
    const usersWithRecentSessions = new Set(
      sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(today)).map(s => s.user_id)
    );
    const activeToday = usersWithRecentSessions.size;

    const activeWeekUsers = new Set(
      sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(weekAgo)).map(s => s.user_id)
    );
    const activeWeek = activeWeekUsers.size;

    const activeMonthUsers = new Set(
      sessions?.filter(s => s.started_at && new Date(s.started_at) >= new Date(monthAgo)).map(s => s.user_id)
    );
    const activeMonth = activeMonthUsers.size;

    // Avg sessions per user
    const sessionsByUser: Record<string, number> = {};
    sessions?.forEach(s => { sessionsByUser[s.user_id] = (sessionsByUser[s.user_id] || 0) + 1; });
    const avgSessions = totalUsers > 0 ? Object.values(sessionsByUser).reduce((a, b) => a + b, 0) / totalUsers : 0;

    // Subscriptions
    const activeSubscriptions = subscriptions?.filter(s => s.is_active) || [];
    const subBreakdown: Record<string, number> = { free: 0, pro: 0, founder: 0 };
    const subscribedSet = new Set<string>();
    activeSubscriptions.forEach(s => { subBreakdown[s.tier] = (subBreakdown[s.tier] || 0) + 1; subscribedSet.add(s.user_id); });
    subBreakdown['free'] = totalUsers - subscribedSet.size;
    const proCount = subBreakdown['pro'] || 0;
    const founderCount = subBreakdown['founder'] || 0;
    const monthlyRevenue = (proCount * 9.99) + (founderCount * 6.58);
    const conversionRate = totalUsers > 0 ? (subscribedSet.size / totalUsers) * 100 : 0;

    // Feature usage
    const featureUsage = [
      { feature: 'Goals', users: new Set(goals?.map(g => g.user_id)).size, total: goals?.length || 0 },
      { feature: 'Habits', users: new Set(habits?.map(h => h.user_id)).size, total: habits?.length || 0 },
      { feature: 'Journal', users: new Set(journals?.map(j => j.user_id)).size, total: journals?.length || 0 },
      { feature: 'Feed', users: new Set(posts?.map(p => p.user_id)).size, total: posts?.length || 0 },
      { feature: 'Mentor', users: new Set(mentorConvos?.map(m => m.user_id)).size, total: mentorConvos?.length || 0 },
    ];

    // Feature adoption percentages
    const featureAdoption: Record<string, number> = {};
    featureUsage.forEach(f => { featureAdoption[f.feature.toLowerCase()] = totalUsers > 0 ? (f.users / totalUsers) * 100 : 0; });

    // Active vs passive
    const usersWithActivity = new Set([
      ...(goals?.map(g => g.user_id) || []),
      ...(habits?.map(h => h.user_id) || []),
      ...(journals?.map(j => j.user_id) || []),
      ...(posts?.map(p => p.user_id) || []),
      ...(mentorConvos?.map(m => m.user_id) || []),
    ]);
    const activeUsers = usersWithActivity.size;

    // Session depth buckets
    const userSessionDurations: Record<string, number> = {};
    sessions?.forEach(s => {
      userSessionDurations[s.user_id] = (userSessionDurations[s.user_id] || 0) + (s.duration_seconds || 0);
    });
    const sessionBuckets = { '<1m': 0, '1-5m': 0, '5-15m': 0, '15-30m': 0, '30m+': 0 };
    Object.values(userSessionDurations).forEach(secs => {
      if (secs < 60) sessionBuckets['<1m']++;
      else if (secs < 300) sessionBuckets['1-5m']++;
      else if (secs < 900) sessionBuckets['5-15m']++;
      else if (secs < 1800) sessionBuckets['15-30m']++;
      else sessionBuckets['30m+']++;
    });

    // Sentiment
    const moodCounts: Record<number, number> = {};
    let moodSum = 0, moodTotal = 0, energySum = 0, energyTotal = 0;
    journals?.forEach(j => {
      if (j.mood != null) { moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1; moodSum += j.mood; moodTotal++; }
      if (j.energy != null) { energySum += j.energy; energyTotal++; }
    });
    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({ mood: parseInt(mood), count })).sort((a, b) => a.mood - b.mood);

    // Goals
    const goalCategories: Record<string, { count: number; completed: number }> = {};
    goals?.forEach(g => {
      const cat = g.category || 'Uncategorized';
      if (!goalCategories[cat]) goalCategories[cat] = { count: 0, completed: 0 };
      goalCategories[cat].count++;
      if (g.status === 'completed') goalCategories[cat].completed++;
    });
    const goalCategoryData = Object.entries(goalCategories).map(([name, d]) => ({
      name, count: d.count, completionRate: d.count > 0 ? (d.completed / d.count) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    const goalStatusDist: Record<string, number> = {};
    goals?.forEach(g => { const s = g.status || 'active'; goalStatusDist[s] = (goalStatusDist[s] || 0) + 1; });

    // User growth
    const userGrowth: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const count = profiles?.filter(p => new Date(p.created_at).toISOString().split('T')[0] <= dateStr).length || 0;
      userGrowth.push({ date: dateStr, count });
    }

    // Retention data
    const countryBreakdown: Record<string, number> = {};
    const lifePhaseBreakdown: Record<string, number> = {};
    profiles?.forEach(p => {
      const c = p.country || 'Unknown';
      const lp = p.life_phase || 'Unknown';
      countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
      lifePhaseBreakdown[lp] = (lifePhaseBreakdown[lp] || 0) + 1;
    });

    // User details for moderation
    const userDetails = profiles?.map(p => ({
      id: p.user_id,
      country: p.country || 'Unknown',
      province: p.province || 'Unknown',
      lifePhase: p.life_phase || 'Unknown',
      subscriptionTier: subscriptions?.find(s => s.user_id === p.user_id && s.is_active)?.tier || 'free',
      joinedAt: p.created_at,
      totalScreenTimeSeconds: sessions?.filter(s => s.user_id === p.user_id).reduce((a, s) => a + (s.duration_seconds || 0), 0) || 0,
      habitsCount: habits?.filter(h => h.user_id === p.user_id).length || 0,
      goalsCount: goals?.filter(g => g.user_id === p.user_id).length || 0,
      journalCount: journals?.filter(j => j.user_id === p.user_id).length || 0,
      postsCount: posts?.filter(po => po.user_id === p.user_id).length || 0,
    }));

    // Mentor topic analysis
    let mentorTopics = null;
    try {
      const userMsgs = mentorMessages?.filter(m => m.role === 'user') || [];
      if (userMsgs.length >= 5) {
        const sample = userMsgs
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 200)
          .map(m => m.content?.slice(0, 200) || '');

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `You are a privacy-first analytics assistant. Analyze anonymized mentor chat messages and extract ONLY aggregate topic-level insights. Never include any user-identifiable information. Return ONLY valid JSON:
{
  "topTopics": [{"topic": "string", "percentage": number, "description": "string"}],
  "sentimentBreakdown": {"positive": number, "neutral": number, "negative": number},
  "keyThemes": ["string"]
}
- topTopics: top 8 discussion topic categories with estimated percentage
- sentimentBreakdown: percentage breakdown summing to 100
- keyThemes: 5-8 recurring theme keywords`
                },
                { role: "user", content: `Analyze these ${sample.length} anonymized messages from a life coaching app:\n\n${sample.join('\n---\n')}` }
              ],
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0]);
                mentorTopics = {
                  ...parsed,
                  totalConversations: mentorConvos?.length || 0,
                  totalMessages: mentorMessages?.length || 0,
                };
              } catch { /* ignore */ }
            }
          }
        }
      }
    } catch (e) {
      console.error('Topic analysis error:', e);
    }

    if (!mentorTopics && (mentorConvos?.length || 0) > 0) {
      mentorTopics = {
        topTopics: [],
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        keyThemes: [],
        totalConversations: mentorConvos?.length || 0,
        totalMessages: mentorMessages?.length || 0,
      };
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsersToday: activeToday,
        activeUsersWeek: activeWeek,
        activeUsersMonth: activeMonth,
        avgSessionsPerUser: avgSessions,
        avgGoalsPerUser: totalUsers > 0 ? (goals?.length || 0) / totalUsers : 0,
        avgHabitsPerUser: totalUsers > 0 ? (habits?.length || 0) / totalUsers : 0,
        totalMentorChats: mentorConvos?.length || 0,
        totalFeedPosts: posts?.length || 0,
        conversionRate,
        monthlyRevenue,
      },
      userGrowth,
      behavioral: {
        featureUsage,
        sessionDepth: Object.entries(sessionBuckets).map(([bucket, count]) => ({ bucket, count })),
        activeVsPassive: { active: activeUsers, passive: totalUsers - activeUsers },
        featureAdoption,
      },
      sentiment: {
        moodDistribution,
        avgMood: moodTotal > 0 ? moodSum / moodTotal : 0,
        energyAvg: energyTotal > 0 ? energySum / energyTotal : 0,
        sampleSize: moodTotal,
      },
      goals: {
        categories: goalCategoryData,
        statusDistribution: Object.entries(goalStatusDist).map(([status, count]) => ({ status, count })),
        totalGoals: goals?.length || 0,
      },
      mentorTopics,
      retention: {
        lifePhaseDistribution: Object.entries(lifePhaseBreakdown).map(([name, count]) => ({ name, count })),
        subscriptionBreakdown: Object.entries(subBreakdown).map(([tier, count]) => ({ tier, count })),
        countryDistribution: Object.entries(countryBreakdown).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      },
      users: { details: userDetails },
    };

    console.log('Analytics compiled successfully');
    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in admin-analytics:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
