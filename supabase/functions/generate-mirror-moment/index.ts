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

    // Check if recent moment exists (limit to weekly)
    const { data: recentMoments } = await supabase
      .from("mirror_moments")
      .select("id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentMoments && recentMoments.length > 0) {
      // Return existing recent moment
      const { data: existing } = await supabase
        .from("mirror_moments")
        .select("*")
        .eq("user_id", user.id)
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
        .eq("user_id", user.id).order("date", { ascending: false }).limit(10),
      supabase.from("habits").select("title, description")
        .eq("user_id", user.id).limit(10),
      supabase.from("goals").select("title, status, category, created_at")
        .eq("user_id", user.id).limit(10),
      supabase.from("momentum_streaks").select("current_streak, longest_streak")
        .eq("user_id", user.id).maybeSingle(),
      supabase.from("user_xp").select("domain, total_xp, level")
        .eq("user_id", user.id),
      supabase.from("daily_signals").select("content, signal_type")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
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
    const hasEnoughData = dataDepth >= 5;

    if (!hasEnoughData) {
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
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let momentData;
    
    if (toolCall) {
      momentData = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: parse from content
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        momentData = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        momentData = {
          category: "pattern_recognition",
          content: content.slice(0, 500),
          confidence_score: 0.5,
          source_categories: ["journals"],
        };
      }
    }

    // Only store high-confidence moments
    if (momentData.confidence_score < 0.4) {
      return new Response(JSON.stringify({ moment: null, reason: "low_confidence" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("mirror_moments")
      .insert({
        user_id: user.id,
        category: momentData.category,
        content: momentData.content,
        confidence_score: momentData.confidence_score,
        source_categories: momentData.source_categories,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ moment: inserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Mirror moment error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
