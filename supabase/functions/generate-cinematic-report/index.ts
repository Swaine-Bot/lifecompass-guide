import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
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

    const { report_type = "weekly" } = await req.json().catch(() => ({}));

    const validTypes = ["weekly", "monthly", "quarterly"];
    const safeType = validTypes.includes(report_type) ? report_type : "weekly";

    const now = new Date();
    let periodStart: Date;
    const periodEnd = now;

    switch (safeType) {
      case "monthly":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarterly":
        periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      default:
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startStr = periodStart.toISOString().split("T")[0];
    const endStr = periodEnd.toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("cinematic_reports")
      .select("*")
      .eq("user_id", userId)
      .eq("report_type", safeType)
      .eq("period_start", startStr)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ report: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [journals, habitLogs, goals, tasks, xpEvents, streakData] = await Promise.all([
      supabase.from("journal_entries").select("content, mood, energy, date, gratitude")
        .eq("user_id", userId).gte("date", startStr).lte("date", endStr),
      supabase.from("habit_logs").select("habit_id, completed, date")
        .gte("date", startStr).lte("date", endStr),
      supabase.from("goals").select("title, status, category, created_at, updated_at")
        .eq("user_id", userId),
      supabase.from("tasks").select("title, status, created_at")
        .eq("user_id", userId).gte("created_at", periodStart.toISOString()),
      supabase.from("xp_events").select("domain, xp_amount, source_type, created_at")
        .eq("user_id", userId).gte("created_at", periodStart.toISOString()),
      supabase.from("momentum_streaks").select("*")
        .eq("user_id", userId).maybeSingle(),
    ]);

    const context = {
      report_type: safeType,
      period: `${startStr} to ${endStr}`,
      journals: journals.data || [],
      habitLogs: habitLogs.data || [],
      goals: goals.data || [],
      tasksCompleted: (tasks.data || []).filter((t: any) => t.status === "done").length,
      tasksTotal: (tasks.data || []).length,
      xpEvents: xpEvents.data || [],
      streak: streakData.data,
    };

    const systemPrompt = `You are the LifeStack Narrator — a cinematic storyteller that transforms life data into compelling chapters.
Your tone: cinematic, aspirational, emotionally intelligent, elegant, slightly mythic but grounded. Never corny.

Generate a ${safeType} life chapter report. Output JSON with tool calling.

Rules:
- Title should be evocative and specific to the period
- Narrative should be 2-4 sentences, cinematic in tone
- Key stats should be real numbers from the data
- Wins should reference actual accomplishments
- Lessons should be inferred from patterns
- Turning points are significant shifts in behaviour`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a cinematic ${safeType} report:\n${JSON.stringify(context)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_cinematic_report",
            description: "Create a cinematic life chapter report",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                narrative: { type: "string" },
                key_stats: {
                  type: "object",
                  properties: {
                    tasks_completed: { type: "number" },
                    habits_logged: { type: "number" },
                    journal_entries: { type: "number" },
                    xp_earned: { type: "number" },
                    streak_days: { type: "number" },
                  },
                },
                major_wins: { type: "array", items: { type: "string" } },
                lessons: { type: "array", items: { type: "string" } },
                turning_points: { type: "array", items: { type: "string" } },
              },
              required: ["title", "narrative", "key_stats", "major_wins", "lessons"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_cinematic_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await response.text(); // consume
      console.error("AI error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to generate report" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let reportData;

    if (toolCall) {
      try {
        reportData = JSON.parse(toolCall.function.arguments);
      } catch {
        reportData = null;
      }
    }

    if (!reportData) {
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        reportData = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        reportData = {
          title: `Your ${safeType.charAt(0).toUpperCase() + safeType.slice(1)} Chapter`,
          narrative: "Keep building. The data shows momentum.",
          key_stats: { tasks_completed: context.tasksCompleted },
          major_wins: [],
          lessons: [],
        };
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from("cinematic_reports")
      .insert({
        user_id: userId,
        report_type: safeType,
        title: String(reportData.title || "").slice(0, 200),
        narrative: String(reportData.narrative || "").slice(0, 2000),
        key_stats: reportData.key_stats || {},
        major_wins: Array.isArray(reportData.major_wins) ? reportData.major_wins.slice(0, 10) : [],
        lessons: Array.isArray(reportData.lessons) ? reportData.lessons.slice(0, 10) : [],
        turning_points: Array.isArray(reportData.turning_points) ? reportData.turning_points.slice(0, 10) : [],
        period_start: startStr,
        period_end: endStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to save report" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ report: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Cinematic report error:", e instanceof Error ? e.message : "Unknown");
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
