import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { report_type = "weekly" } = await req.json().catch(() => ({}));

    // Calculate period
    const now = new Date();
    let periodStart: Date;
    const periodEnd = now;

    switch (report_type) {
      case "monthly":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarterly":
        periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      default: // weekly
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startStr = periodStart.toISOString().split("T")[0];
    const endStr = periodEnd.toISOString().split("T")[0];

    // Check for existing report this period
    const { data: existing } = await supabase
      .from("cinematic_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_type", report_type)
      .eq("period_start", startStr)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ report: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather period data
    const [journals, habitLogs, goals, tasks, xpEvents, streakData] = await Promise.all([
      supabase.from("journal_entries").select("content, mood, energy, date, gratitude")
        .eq("user_id", user.id).gte("date", startStr).lte("date", endStr),
      supabase.from("habit_logs").select("habit_id, completed, date")
        .gte("date", startStr).lte("date", endStr),
      supabase.from("goals").select("title, status, category, created_at, updated_at")
        .eq("user_id", user.id),
      supabase.from("tasks").select("title, status, created_at")
        .eq("user_id", user.id).gte("created_at", periodStart.toISOString()),
      supabase.from("xp_events").select("domain, xp_amount, source_type, created_at")
        .eq("user_id", user.id).gte("created_at", periodStart.toISOString()),
      supabase.from("momentum_streaks").select("*")
        .eq("user_id", user.id).maybeSingle(),
    ]);

    const context = {
      report_type,
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

Generate a ${report_type} life chapter report. Output JSON with tool calling.

Chapter title examples: "The Month You Stopped Hesitating", "Builder Mode Activated", "Quiet Momentum", "Pressure, Then Progress"

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
          { role: "user", content: `Generate a cinematic ${report_type} report:\n${JSON.stringify(context)}` },
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
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let reportData;

    if (toolCall) {
      reportData = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        reportData = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        reportData = {
          title: `Your ${report_type.charAt(0).toUpperCase() + report_type.slice(1)} Chapter`,
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
        user_id: user.id,
        report_type,
        title: reportData.title,
        narrative: reportData.narrative,
        key_stats: reportData.key_stats,
        major_wins: reportData.major_wins,
        lessons: reportData.lessons,
        turning_points: reportData.turning_points || [],
        period_start: startStr,
        period_end: endStr,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ report: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Cinematic report error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
