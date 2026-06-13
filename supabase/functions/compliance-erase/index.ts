// POPIA/GDPR right-to-erasure executor.
// Designed to be invoked by cron after the 30-day grace window expires.
// Verifies auth, scopes deletion to the requesting user, writes audit log,
// and finally deletes the auth.users row (cascades to all user_id FKs).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !serviceKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimData, error: claimErr } = await userClient.auth.getClaims(token);
    if (claimErr || !claimData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimData.claims.sub as string;

    const admin = createClient(supabaseUrl, serviceKey);

    // Find this user's pending erasure request that is past scheduled_for
    const { data: req_, error: lookupErr } = await admin
      .from('data_erasure_requests')
      .select('id, scheduled_for, status')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupErr) throw lookupErr;
    if (!req_) {
      return new Response(JSON.stringify({ error: 'no_pending_request' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(req_.scheduled_for) > new Date()) {
      return new Response(JSON.stringify({ error: 'grace_period_active', scheduled_for: req_.scheduled_for }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from('data_erasure_requests').update({ status: 'processing' }).eq('id', req_.id);

    // Audit before destruction
    await admin.from('audit_log').insert({
      user_id: userId,
      actor_id: userId,
      event_type: 'compliance.erasure.execute',
      resource_type: 'data_erasure_requests',
      resource_id: req_.id,
      details: { scheduled_for: req_.scheduled_for },
    });

    // Delete the auth user — cascades via FKs on user_id
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      await admin.from('data_erasure_requests').update({ status: 'failed' }).eq('id', req_.id);
      throw delErr;
    }

    await admin.from('data_erasure_requests').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', req_.id);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
