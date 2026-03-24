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

    // Check if recent moment exists (limit to weekly)
    const { data: recentMoments } = await supabase
      .from("mirror_moments")
      .select("id, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentMoments && recentMoments.length > 0) {
      const { data: existing } = await supabase
        .from("mirror_moments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return new Response(JSON.stringify({ moment: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather user data for context
    const [journals, habits, goals, streakData, xpData, signals] = await Promise.all([
      supabase.from("journal_entries").select("content, gratitude, reflection, mood, energy, date")
        .eq("user_id", userId).order("date", { ascending: false }).limit(10),
      supabase.from("habits").select("title, description")
        .eq("user_id", userId).limit(10),
      supabase.from("goals").select("title, status, category, created_at")
        .eq("user_id", userId).limit(10),
      supabase.from("momentum_streaks").select("current_streak, longest_streak")
        .eq("user_id", userId).maybeSingle(),
      supabase.from("user_xp").select("domain, total_xp, level")
        .eq("user_id", userId),
      supabase.from("daily_signals").select("content, signal_type")
        .eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);

    const categories = [
      "progress_recognition", "identity_shift", "behaviour_contradiction",
      "pattern_recognition", "resilience_recognition", "drift_warning",
      "hidden_strength", "alignment_insight", "past_self_comparison",
      "emerging_archetype"
    ];

    const context = {
      journals: journals.data || [],
      habits: habits.data || [],
      goals: goals.data || [],
      streak: streakData.data,
      xp: xpData.data || [],
      recentSignals: signals.data || [],
    };

    const dataDepth = (context.journals.length * 2) + context.habits.length + context.goals.length;
    if (dataDepth < 5) {
      return new Response(JSON.stringify({ moment: null, reason: "insufficient_data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are the LifeStack Mirror — an emotionally intelligent AI that generates deeply personal reflections.
Your tone: intelligent, observant, emotionally mature. Never manipulative or falsely confident.

CATEGORIES (pick the most fitting):
${categories.join(", ")}

Rules:
- Be specific, referencing actual patterns from data
- Sound like a trusted advisor, not a motivational poster
- Use confident language only when data clearly supports the insight
- Keep under 3 sentences
- Output JSON with: category, content, confidence_score (0.0-1.0), source_categories (array of data types used)`;

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
          { role: "user", content: `Generate a Mirror Moment based on this user data:\n${JSON.stringify(context)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_mirror_moment",
            description: "Create a mirror moment insight",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: categories },
                content: { type: "string" },
                confidence_score: { type: "number" },
                source_categories: { type: "array", items: { type: "string" } },
              },
              required: ["category", "content", "confidence_score", "source_categories"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_mirror_moment" } },
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
      return new Response(JSON.stringify({ error: "Failed to generate mirror moment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let momentData;

    if (toolCall) {
      try {
        momentData = JSON.parse(toolCall.function.arguments);
      } catch {
        momentData = null;
      }
    }

    if (!momentData) {
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        momentData = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        momentData = {
          category: "pattern_recognition",
          content: String(content).slice(0, 500),
          confidence_score: 0.5,
          source_categories: ["journals"],
        };
      }
    }

    // Validate parsed data
    if (!momentData.category || !categories.includes(momentData.category)) {
      momentData.category = "pattern_recognition";
    }
    if (!momentData.content || typeof momentData.content !== "string") {
      return new Response(JSON.stringify({ moment: null, reason: "generation_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    momentData.confidence_score = Math.min(1, Math.max(0, Number(momentData.confidence_score) || 0.5));
    if (!Array.isArray(momentData.source_categories)) {
      momentData.source_categories = ["journals"];
    }

    if (momentData.confidence_score < 0.4) {
      return new Response(JSON.stringify({ moment: null, reason: "low_confidence" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("mirror_moments")
      .insert({
        user_id: userId,
        category: momentData.category,
        content: String(momentData.content).slice(0, 1000),
        confidence_score: momentData.confidence_score,
        source_categories: momentData.source_categories,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to save moment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ moment: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Mirror moment error:", e instanceof Error ? e.message : "Unknown");
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
