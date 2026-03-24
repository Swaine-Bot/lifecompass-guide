import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Allowlists
const ALLOWED_PROVIDERS = ["apple_health", "google_fit", "fitbit", "garmin", "samsung_health", "whoop", "oura", "manual"];
const ALLOWED_METRIC_TYPES = ["steps", "heart_rate", "calories", "distance", "sleep_minutes", "active_minutes", "floors_climbed", "weight", "blood_pressure_systolic", "blood_pressure_diastolic", "blood_oxygen", "body_temperature"];
const ALLOWED_UNITS = ["count", "bpm", "kcal", "km", "mi", "min", "floors", "kg", "lbs", "mmHg", "%", "°C", "°F"];
const METRIC_BOUNDS: Record<string, { min: number; max: number }> = {
  steps: { min: 0, max: 200000 },
  heart_rate: { min: 20, max: 300 },
  calories: { min: 0, max: 50000 },
  distance: { min: 0, max: 500 },
  sleep_minutes: { min: 0, max: 1440 },
  active_minutes: { min: 0, max: 1440 },
  floors_climbed: { min: 0, max: 1000 },
  weight: { min: 10, max: 700 },
  blood_pressure_systolic: { min: 50, max: 300 },
  blood_pressure_diastolic: { min: 20, max: 200 },
  blood_oxygen: { min: 50, max: 100 },
  body_temperature: { min: 30, max: 45 },
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SYNCS_PER_HOUR = 20;

function isValidISODate(str: string): boolean {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.getTime() > new Date("2020-01-01").getTime() && d.getTime() < Date.now() + 86400000;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { action, provider, metrics } = body;

    // Validate action
    const validActions = ["sync_metrics", "get_step_context"];
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate provider
    const safeProvider = String(provider || "").slice(0, 50);
    if (action === "sync_metrics" && !ALLOWED_PROVIDERS.includes(safeProvider)) {
      return new Response(JSON.stringify({ error: `Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(", ")}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "sync_metrics": {
        if (!metrics || !Array.isArray(metrics) || metrics.length === 0 || metrics.length > 100) {
          return new Response(JSON.stringify({ error: "Invalid metrics array (1-100 items required)" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Rate limit: max syncs per hour
        const { count: recentSyncs } = await supabase
          .from("engagement_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("event_type", "wearable_sync_completed")
          .gte("created_at", new Date(Date.now() - 3600000).toISOString());

        if ((recentSyncs || 0) >= MAX_SYNCS_PER_HOUR) {
          return new Response(JSON.stringify({ error: "Too many sync requests. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const batchId = crypto.randomUUID();
        let upsertedCount = 0;
        const validationErrors: string[] = [];

        for (let i = 0; i < metrics.length; i++) {
          const m = metrics[i];

          // Validate metric_type
          const metricType = String(m.metric_type || "").slice(0, 50);
          if (!ALLOWED_METRIC_TYPES.includes(metricType)) {
            validationErrors.push(`Item ${i}: invalid metric_type "${metricType}"`);
            continue;
          }

          // Validate unit
          const unit = String(m.unit || "").slice(0, 20);
          if (!ALLOWED_UNITS.includes(unit)) {
            validationErrors.push(`Item ${i}: invalid unit "${unit}"`);
            continue;
          }

          // Validate numeric value
          const metricValue = Number(m.metric_value);
          if (isNaN(metricValue)) {
            validationErrors.push(`Item ${i}: metric_value must be a number`);
            continue;
          }

          const bounds = METRIC_BOUNDS[metricType];
          if (bounds && (metricValue < bounds.min || metricValue > bounds.max)) {
            validationErrors.push(`Item ${i}: ${metricType} value ${metricValue} out of range [${bounds.min}, ${bounds.max}]`);
            continue;
          }

          // Validate local_date
          const localDate = String(m.local_date || "");
          if (!DATE_REGEX.test(localDate)) {
            validationErrors.push(`Item ${i}: invalid local_date format (expected YYYY-MM-DD)`);
            continue;
          }

          // Validate timestamp
          const sourceTimestamp = m.source_timestamp || new Date().toISOString();
          if (!isValidISODate(sourceTimestamp)) {
            validationErrors.push(`Item ${i}: invalid source_timestamp`);
            continue;
          }

          // Validate provider per metric
          const itemProvider = String(m.provider || safeProvider).slice(0, 50);
          if (!ALLOWED_PROVIDERS.includes(itemProvider)) {
            validationErrors.push(`Item ${i}: invalid provider`);
            continue;
          }

          const { error } = await supabase.from("wearable_metrics").upsert(
            {
              user_id: userId,
              provider: itemProvider,
              metric_type: metricType,
              metric_value: metricValue,
              unit,
              source_timestamp: sourceTimestamp,
              local_date: localDate,
              sync_batch_id: batchId,
              raw_provider_reference: m.raw_ref || null,
            },
            { onConflict: "user_id,provider,metric_type,local_date" }
          );

          if (!error) upsertedCount++;
        }

        await supabase
          .from("wearable_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: "success",
          })
          .eq("user_id", userId)
          .eq("provider", safeProvider);

        await supabase.from("engagement_events").insert({
          user_id: userId,
          event_type: "wearable_sync_completed",
          source_engine: "wearable",
          metadata: { provider: safeProvider, metrics_count: upsertedCount, batch_id: batchId },
        });

        return new Response(
          JSON.stringify({
            success: true,
            synced: upsertedCount,
            batch_id: batchId,
            validation_errors: validationErrors.length > 0 ? validationErrors : undefined,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_step_context": {
        const today = new Date().toISOString().split("T")[0];

        const { data: todayMetrics } = await supabase
          .from("wearable_metrics")
          .select("metric_type, metric_value, provider")
          .eq("user_id", userId)
          .eq("local_date", today);

        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split("T")[0]);
        }

        const { data: weekMetrics } = await supabase
          .from("wearable_metrics")
          .select("local_date, metric_value")
          .eq("user_id", userId)
          .eq("metric_type", "steps")
          .in("local_date", dates)
          .order("local_date", { ascending: true });

        const steps = todayMetrics?.find((m: any) => m.metric_type === "steps");
        const weeklySteps = (weekMetrics || []).map((m: any) => ({
          date: m.local_date,
          steps: Number(m.metric_value),
        }));

        const weekAvg =
          weeklySteps.length > 0
            ? Math.round(weeklySteps.reduce((sum: number, d: any) => sum + d.steps, 0) / weeklySteps.length)
            : 0;

        return new Response(
          JSON.stringify({
            today_steps: steps ? Number(steps.metric_value) : 0,
            provider: steps?.provider || null,
            weekly_average: weekAvg,
            weekly_history: weeklySteps,
            active_days: weeklySteps.filter((d: any) => d.steps > 0).length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Wearable sync error:", error instanceof Error ? error.message : "Unknown");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
