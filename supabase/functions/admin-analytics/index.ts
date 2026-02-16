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
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Admin verified, fetching analytics...');

    // Fetch all analytics data using service role
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // User count and details
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, user_id, country, province, life_phase, gender, created_at');

    if (profilesError) {
      console.error('Profiles error:', profilesError);
    }

    // Subscriptions
    const { data: subscriptions, error: subscriptionsError } = await adminClient
      .from('user_subscriptions')
      .select('*');

    if (subscriptionsError) {
      console.error('Subscriptions error:', subscriptionsError);
    }

    // App sessions for screen time
    const { data: sessions, error: sessionsError } = await adminClient
      .from('app_sessions')
      .select('user_id, duration_seconds, started_at');

    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
    }

    // Feature usage - habits
    const { data: habits, error: habitsError } = await adminClient
      .from('habits')
      .select('id, user_id, created_at');

    // Feature usage - goals
    const { data: goals, error: goalsError } = await adminClient
      .from('goals')
      .select('id, user_id, created_at, category');

    // Feature usage - journal entries with mood
    const { data: journals, error: journalsError } = await adminClient
      .from('journal_entries')
      .select('id, user_id, created_at, mood, energy, tags');

    // Feature usage - posts (feed)
    const { data: posts, error: postsError } = await adminClient
      .from('posts')
      .select('id, user_id, created_at, content');

    // Feature usage - mentor conversations
    const { data: mentorConvos, error: mentorError } = await adminClient
      .from('mentor_conversations')
      .select('id, user_id, created_at, title');

    // Mentor messages count and content for topic analysis
    const { data: mentorMessages, error: mentorMessagesError } = await adminClient
      .from('mentor_messages')
      .select('id, conversation_id, created_at, role, content');

    // Process data
    const totalUsers = profiles?.length || 0;

    // Country breakdown
    const countryBreakdown: Record<string, number> = {};
    profiles?.forEach(p => {
      const country = p.country || 'Unknown';
      countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
    });

    // Province breakdown
    const provinceBreakdown: Record<string, number> = {};
    profiles?.forEach(p => {
      if (p.province) {
        provinceBreakdown[p.province] = (provinceBreakdown[p.province] || 0) + 1;
      }
    });

    // Life phase breakdown
    const lifePhaseBreakdown: Record<string, number> = {};
    profiles?.forEach(p => {
      const phase = p.life_phase || 'Unknown';
      lifePhaseBreakdown[phase] = (lifePhaseBreakdown[phase] || 0) + 1;
    });

    // Subscription breakdown
    const subscriptionBreakdown: Record<string, number> = { free: 0, pro: 0, founder: 0 };
    const activeSubscriptions = subscriptions?.filter(s => s.is_active) || [];
    activeSubscriptions.forEach(s => {
      subscriptionBreakdown[s.tier] = (subscriptionBreakdown[s.tier] || 0) + 1;
    });

    // Users without active subscription are "free"
    const usersWithSubscription = new Set(activeSubscriptions.map(s => s.user_id));
    const freeUsers = (profiles?.filter(p => !usersWithSubscription.has(p.user_id)).length || 0);
    subscriptionBreakdown['free'] = freeUsers;

    // Monthly revenue calculation (assuming Pro = $9.99/mo, Founder = $79/yr = $6.58/mo)
    const proCount = subscriptionBreakdown['pro'] || 0;
    const founderCount = subscriptionBreakdown['founder'] || 0;
    const monthlyRevenue = (proCount * 9.99) + (founderCount * 6.58);

    // Feature usage trends
    const featureUsage = {
      habits: habits?.length || 0,
      goals: goals?.length || 0,
      journal: journals?.length || 0,
      posts: posts?.length || 0,
      mentor: mentorConvos?.length || 0,
    };

    // Most used features (sorted)
    const sortedFeatures = Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .map(([feature, count]) => ({ feature, count }));

    // User growth over last 30 days
    const userGrowth: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = profiles?.filter(p => {
        const createdDate = new Date(p.created_at).toISOString().split('T')[0];
        return createdDate <= dateStr;
      }).length || 0;
      userGrowth.push({ date: dateStr, count });
    }

    // Screen time analytics
    const totalScreenTime = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
    const avgScreenTimePerUser = totalUsers > 0 ? totalScreenTime / totalUsers : 0;

    // Journal mood trends
    const moodTrends: { mood: number; count: number }[] = [];
    const moodCounts: Record<number, number> = {};
    journals?.forEach(j => {
      if (j.mood !== null && j.mood !== undefined) {
        moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
      }
    });
    Object.entries(moodCounts).forEach(([mood, count]) => {
      moodTrends.push({ mood: parseInt(mood), count });
    });
    moodTrends.sort((a, b) => a.mood - b.mood);

    // Mood by country
    const moodByCountry: Record<string, { totalMood: number; count: number }> = {};
    journals?.forEach(j => {
      if (j.mood !== null && j.mood !== undefined) {
        const userProfile = profiles?.find(p => p.user_id === j.user_id);
        const country = userProfile?.country || 'Unknown';
        if (!moodByCountry[country]) {
          moodByCountry[country] = { totalMood: 0, count: 0 };
        }
        moodByCountry[country].totalMood += j.mood;
        moodByCountry[country].count += 1;
      }
    });
    const moodByCountryAvg: Record<string, { avgMood: number; count: number }> = {};
    Object.entries(moodByCountry).forEach(([country, data]) => {
      moodByCountryAvg[country] = {
        avgMood: data.count > 0 ? data.totalMood / data.count : 0,
        count: data.count
      };
    });

    // Goal category trends
    const goalCategories: Record<string, number> = {};
    goals?.forEach(g => {
      const cat = g.category || 'Uncategorized';
      goalCategories[cat] = (goalCategories[cat] || 0) + 1;
    });

    // User details (excluding personal info like email)
    const userDetails = profiles?.map(p => ({
      id: p.user_id,
      country: p.country || 'Unknown',
      province: p.province || 'Unknown',
      lifePhase: p.life_phase || 'Unknown',
      isSubscribed: usersWithSubscription.has(p.user_id),
      subscriptionTier: subscriptions?.find(s => s.user_id === p.user_id && s.is_active)?.tier || 'free',
      joinedAt: p.created_at,
      totalScreenTimeSeconds: sessions?.filter(s => s.user_id === p.user_id)
        .reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0,
      habitsCount: habits?.filter(h => h.user_id === p.user_id).length || 0,
      goalsCount: goals?.filter(g => g.user_id === p.user_id).length || 0,
      journalCount: journals?.filter(j => j.user_id === p.user_id).length || 0,
      postsCount: posts?.filter(po => po.user_id === p.user_id).length || 0,
    }));

    // Gender breakdown
    const genderBreakdown: Record<string, number> = {};
    profiles?.forEach(p => {
      const gender = (p as any).gender || 'Not specified';
      genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;
    });

    // Mentor statistics
    const mentorStats = {
      totalConversations: mentorConvos?.length || 0,
      totalMessages: mentorMessages?.length || 0,
      recentConversations: mentorConvos?.slice(0, 20).map(c => ({
        id: c.id,
        title: c.title || 'Untitled',
        messageCount: mentorMessages?.filter(m => m.conversation_id === c.id).length || 0,
        createdAt: c.created_at
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [],
      topicInsights: null as any,
    };

    // Analyze mentor chat topics using AI (only user messages, anonymized)
    try {
      const userMessages = mentorMessages?.filter(m => (m as any).role === 'user') || [];
      if (userMessages.length > 0) {
        // Sample up to 200 recent user messages for analysis (anonymized - no user IDs)
        const sampleMessages = userMessages
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 200)
          .map(m => (m as any).content?.slice(0, 200) || '');

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY && sampleMessages.length >= 5) {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `You are an analytics assistant. Analyze these anonymized mentor chat messages and extract insights for advertisers while preserving user privacy. Return ONLY valid JSON with this exact structure:
{
  "topTopics": [{"topic": "string", "percentage": number, "description": "string"}],
  "sentimentBreakdown": {"positive": number, "neutral": number, "negative": number},
  "advertiserInsights": ["string"],
  "keyThemes": ["string"]
}
- topTopics: top 8 discussion topics with estimated percentage and brief description
- sentimentBreakdown: percentage breakdown (must sum to 100)
- advertiserInsights: 5 actionable insights for advertisers (privacy-preserving, aggregate-level)
- keyThemes: 5-8 recurring themes/keywords`
                },
                {
                  role: "user",
                  content: `Analyze these ${sampleMessages.length} anonymized user messages from a life coaching mentor chat app:\n\n${sampleMessages.join('\n---\n')}`
                }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                mentorStats.topicInsights = JSON.parse(jsonMatch[0]);
              } catch { /* ignore parse error */ }
            }
          }
        }
      }
    } catch (e) {
      console.error('Topic analysis error:', e);
    }

    // Moderation logs
    const moderation = {
      flaggedPosts: [],
      flaggedJournals: []
    };

    const analytics = {
      users: {
        total: totalUsers,
        byCountry: countryBreakdown,
        byProvince: provinceBreakdown,
        byLifePhase: lifePhaseBreakdown,
        byGender: genderBreakdown,
        growth: userGrowth,
        details: userDetails,
      },
      subscriptions: {
        breakdown: subscriptionBreakdown,
        totalActive: activeSubscriptions.length,
      },
      revenue: {
        monthly: monthlyRevenue,
        proRevenue: proCount * 9.99,
        founderRevenue: founderCount * 6.58,
      },
      features: {
        usage: featureUsage,
        mostUsed: sortedFeatures,
        goalCategories,
      },
      engagement: {
        totalScreenTimeSeconds: totalScreenTime,
        avgScreenTimePerUserSeconds: avgScreenTimePerUser,
        moodTrends,
        moodByCountry: moodByCountryAvg,
      },
      moderation,
      mentorStats,
    };

    console.log('Analytics compiled successfully');

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in admin-analytics:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
