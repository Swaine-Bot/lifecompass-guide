import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const today = new Date().toISOString().split("T")[0];

    // Check if signal already exists today (natural rate limit)
    const { data: existing } = await supabaseClient
      .from("daily_signals")
      .select("id, content, signal_type, suggested_action, is_read")
      .eq("user_id", userId)
      .eq("signal_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ signal: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather user context
    const [goalsRes, habitsRes, journalRes, tasksRes, streakRes] = await Promise.all([
      supabaseClient.from("goals").select("title, status, category").limit(10),
      supabaseClient.from("habits").select("title").limit(10),
      supabaseClient.from("journal_entries").select("mood, energy, date").order("date", { ascending: false }).limit(5),
      supabaseClient.from("tasks").select("title, status").eq("status", "today").limit(10),
      supabaseClient.from("momentum_streaks").select("current_streak").eq("user_id", userId).maybeSingle(),
    ]);

    const context = {
      goals: (goalsRes.data || []).map((g: any) => g.title),
      habits: (habitsRes.data || []).map((h: any) => h.title),
      recentMoods: (journalRes.data || []).map((j: any) => ({ mood: j.mood, energy: j.energy })),
      todayTasks: (tasksRes.data || []).map((t: any) => t.title),
      streak: streakRes.data?.current_streak || 0,
    };

    const signalTypes = ["strategic_insight", "reflection", "encouragement", "pattern_observation", "growth_suggestion"];
    const chosenType = signalTypes[Math.floor(Math.random() * signalTypes.length)];

    const systemPrompt = `You are the LifeStack Daily Signal engine. Generate a single powerful daily insight for the user.

Signal type for today: ${chosenType}

User context:
- Active goals: ${JSON.stringify(context.goals)}
- Habits tracked: ${JSON.stringify(context.habits)}
- Recent moods: ${JSON.stringify(context.recentMoods)}
- Today's tasks: ${JSON.stringify(context.todayTasks)}
- Current streak: ${context.streak} days

Make the insight feel personal based on their data. Be direct and wise, not generic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my daily signal." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_signal",
            description: "Create a daily signal insight",
            parameters: {
              type: "object",
              properties: {
                content: { type: "string", description: "The main insight (2-4 sentences)" },
                suggested_action: { type: "string", description: "One specific action for today" },
              },
              required: ["content", "suggested_action"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_signal" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await response.text(); // consume
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to generate signal" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    let content = "Keep building momentum. Every small action compounds.";
    let suggestedAction = "Complete one task that moves your most important goal forward.";

    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        if (parsed.content && typeof parsed.content === "string") content = String(parsed.content).slice(0, 1000);
        if (parsed.suggested_action && typeof parsed.suggested_action === "string") suggestedAction = String(parsed.suggested_action).slice(0, 500);
      }
    } catch {
      // Use defaults
    }

    const { data: signal, error: insertError } = await supabaseClient
      .from("daily_signals")
      .insert({
        user_id: userId,
        signal_type: chosenType,
        content,
        suggested_action: suggestedAction,
        signal_date: today,
      })
      .select("id, content, signal_type, suggested_action, is_read")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to save signal" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Daily signal error:", error instanceof Error ? error.message : "Unknown");
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
