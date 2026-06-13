// POPIA/GDPR data export edge function.
// Bundles user-owned rows from all tables into a JSON file, uploads to storage,
// and returns a 7-day signed URL. Rate-limited to 1 successful export per 24h.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const TABLES = [
  'profiles', 'goals', 'habits', 'habit_logs', 'tasks', 'journal_entries',
  'mentor_conversations', 'mentor_messages', 'saved_insights', 'share_cards',
  'posts', 'comments', 'reactions', 'follows', 'friendships',
  'momentum_streaks', 'user_pillar_xp', 'xp_events',
  'insurer_connections', 'insurer_sharing_prefs', 'consent_records',
  'privacy_settings', 'notification_preferences',
];

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

    const body = await req.json().catch(() => ({}));
    const requestId = body?.request_id as string | undefined;

    const admin = createClient(supabaseUrl, serviceKey);

    // Rate limit: 1 completed export per 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('data_export_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'complete')
      .gte('completed_at', since);
    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: 'Only one export per 24 hours.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (requestId) {
      await admin.from('data_export_requests').update({ status: 'processing' }).eq('id', requestId).eq('user_id', userId);
    }

    const bundle: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: userId,
    };

    for (const table of TABLES) {
      try {
        // Most user-owned tables have a user_id column
        const { data } = await admin.from(table).select('*').eq('user_id', userId);
        bundle[table] = data ?? [];
      } catch {
        bundle[table] = [];
      }
    }

    const json = JSON.stringify(bundle, null, 2);
    const path = `${userId}/export-${Date.now()}.json`;

    // Use user-media bucket (private)
    const { error: uploadErr } = await admin.storage
      .from('user-media')
      .upload(path, new Blob([json], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });

    if (uploadErr) throw uploadErr;

    const { data: signed } = await admin.storage.from('user-media').createSignedUrl(path, 60 * 60 * 24 * 7);
    const url = signed?.signedUrl ?? null;
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (requestId) {
      await admin
        .from('data_export_requests')
        .update({ status: 'complete', download_url: url, expires_at: expires, completed_at: new Date().toISOString() })
        .eq('id', requestId);
    }

    return new Response(JSON.stringify({ ok: true, download_url: url, expires_at: expires }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message ?? err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
