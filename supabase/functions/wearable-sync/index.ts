import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json();
    const { action, provider, metrics } = body;

    switch (action) {
      case 'sync_metrics': {
        // Batch upsert wearable metrics from client
        if (!metrics || !Array.isArray(metrics)) {
          return new Response(JSON.stringify({ error: 'metrics array required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const batchId = crypto.randomUUID();
        let upsertedCount = 0;

        for (const m of metrics) {
          const { error } = await supabase.from('wearable_metrics').upsert({
            user_id: user.id,
            provider: m.provider || provider,
            metric_type: m.metric_type,
            metric_value: m.metric_value,
            unit: m.unit,
            source_timestamp: m.source_timestamp || new Date().toISOString(),
            local_date: m.local_date,
            sync_batch_id: batchId,
            raw_provider_reference: m.raw_ref || null,
          }, { onConflict: 'user_id,provider,metric_type,local_date' });

          if (!error) upsertedCount++;
        }

        // Update connection sync status
        await supabase.from('wearable_connections').update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
        }).eq('user_id', user.id).eq('provider', provider);

        // Track analytics event
        await supabase.from('engagement_events').insert({
          user_id: user.id,
          event_type: 'wearable_sync_completed',
          source_engine: 'wearable',
          metadata: { provider, metrics_count: upsertedCount, batch_id: batchId },
        });

        return new Response(JSON.stringify({ 
          success: true, 
          synced: upsertedCount,
          batch_id: batchId,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_step_context': {
        // Returns step data formatted for Mentor context injection
        const today = new Date().toISOString().split('T')[0];
        
        const { data: todayMetrics } = await supabase
          .from('wearable_metrics')
          .select('metric_type, metric_value, provider')
          .eq('user_id', user.id)
          .eq('local_date', today);

        // Get 7-day step history
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }

        const { data: weekMetrics } = await supabase
          .from('wearable_metrics')
          .select('local_date, metric_value')
          .eq('user_id', user.id)
          .eq('metric_type', 'steps')
          .in('local_date', dates)
          .order('local_date', { ascending: true });

        const steps = todayMetrics?.find((m: any) => m.metric_type === 'steps');
        const weeklySteps = (weekMetrics || []).map((m: any) => ({
          date: m.local_date,
          steps: Number(m.metric_value),
        }));

        const weekAvg = weeklySteps.length > 0
          ? Math.round(weeklySteps.reduce((sum: number, d: any) => sum + d.steps, 0) / weeklySteps.length)
          : 0;

        return new Response(JSON.stringify({
          today_steps: steps ? Number(steps.metric_value) : 0,
          provider: steps?.provider || null,
          weekly_average: weekAvg,
          weekly_history: weeklySteps,
          active_days: weeklySteps.filter((d: any) => d.steps > 0).length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Wearable sync error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
