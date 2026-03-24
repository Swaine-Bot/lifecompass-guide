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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Service configuration error' }), { 
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminUserId = claimsData.claims.sub;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get target user ID from request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent admin from deleting themselves
    if (userId === adminUserId) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${adminUserId} deleting user ${userId}`);

    // Delete user data from all tables (order matters for foreign keys)
    const tablesToClean = [
      { table: 'reactions', column: 'user_id' },
      { table: 'comments', column: 'user_id' },
      { table: 'posts', column: 'user_id' },
      { table: 'mentor_messages', column: 'conversation_id', subquery: true },
      { table: 'mentor_conversations', column: 'user_id' },
      { table: 'habit_logs', column: 'habit_id', subquery: true },
      { table: 'habits', column: 'user_id' },
      { table: 'milestones', column: 'goal_id', subquery: true },
      { table: 'tasks', column: 'user_id' },
      { table: 'goals', column: 'user_id' },
      { table: 'journal_entries', column: 'user_id' },
      { table: 'daily_checkins', column: 'user_id' },
      { table: 'life_events', column: 'user_id' },
      { table: 'follows', column: 'follower_id' },
      { table: 'friendships', column: 'requester_id' },
      { table: 'page_dismissals', column: 'user_id' },
      { table: 'playbook_installs', column: 'user_id' },
      { table: 'push_subscriptions', column: 'user_id' },
      { table: 'privacy_settings', column: 'user_id' },
      { table: 'app_sessions', column: 'user_id' },
      { table: 'user_subscriptions', column: 'user_id' },
      { table: 'user_roles', column: 'user_id' },
      { table: 'profiles', column: 'user_id' },
    ];

    // Clean up related records where user is addressee/following
    await adminClient.from('follows').delete().eq('following_id', userId);
    await adminClient.from('friendships').delete().eq('addressee_id', userId);

    // Handle subquery-based deletions
    // Delete mentor messages for user's conversations
    const { data: userConvos } = await adminClient
      .from('mentor_conversations')
      .select('id')
      .eq('user_id', userId);
    if (userConvos?.length) {
      const convoIds = userConvos.map(c => c.id);
      await adminClient.from('mentor_messages').delete().in('conversation_id', convoIds);
    }

    // Delete habit logs for user's habits
    const { data: userHabits } = await adminClient
      .from('habits')
      .select('id')
      .eq('user_id', userId);
    if (userHabits?.length) {
      const habitIds = userHabits.map(h => h.id);
      await adminClient.from('habit_logs').delete().in('habit_id', habitIds);
    }

    // Delete milestones for user's goals
    const { data: userGoals } = await adminClient
      .from('goals')
      .select('id')
      .eq('user_id', userId);
    if (userGoals?.length) {
      const goalIds = userGoals.map(g => g.id);
      await adminClient.from('milestones').delete().in('goal_id', goalIds);
    }

    // Delete from direct user_id tables
    for (const { table, column, subquery } of tablesToClean) {
      if (subquery) continue; // Already handled above
      const { error } = await adminClient.from(table).delete().eq(column, userId);
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
      }
    }

    // Finally, delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User ${userId} deleted successfully`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in admin-delete-user:', error instanceof Error ? error.message : 'Unknown');
    return new Response(JSON.stringify({ error: 'User deletion failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
