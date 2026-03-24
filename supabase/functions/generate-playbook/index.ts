import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CALLS_PER_HOUR = 10;
const MAX_CALLS_PER_DAY = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    const userId = claimsData.claims.sub as string;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: hourly
    const { count: hourlyCount } = await supabaseClient
      .from("engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "api_call_generate_playbook")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());

    if ((hourlyCount || 0) >= MAX_CALLS_PER_HOUR) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: daily
    const { count: dailyCount } = await supabaseClient
      .from("engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "api_call_generate_playbook")
      .gte("created_at", new Date(Date.now() - 86400000).toISOString());

    if ((dailyCount || 0) >= MAX_CALLS_PER_DAY) {
      return new Response(JSON.stringify({ error: "Daily limit reached. Please try again tomorrow." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log rate limit event
    await supabaseClient.from("engagement_events").insert({
      user_id: userId,
      event_type: "api_call_generate_playbook",
      source_engine: "rate_limiter",
      metadata: {},
    });

    const body = await req.json();
    const { source_type, goal, mentor_message, profile } = body;

    // Validate source_type
    if (!["goal", "mentor"].includes(source_type)) {
      return new Response(JSON.stringify({ error: "Invalid source_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let prompt = "";

    if (source_type === "goal" && goal) {
      const safeTitle = String(goal.title || "").slice(0, 200);
      const safeCategory = String(goal.category || "").slice(0, 100);
      const safeMetric = String(goal.success_metric || "").slice(0, 500);
      const safeWhy = String(goal.why || "").slice(0, 500);
      const safeConstraints = String(goal.constraints || "").slice(0, 500);

      if (!safeTitle) {
        return new Response(JSON.stringify({ error: "Goal title is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      prompt = `You are a life strategy assistant. Generate a practical, actionable playbook of 4-7 micro moves (tasks) to help achieve this goal.

Goal: ${safeTitle}
${safeCategory ? `Category: ${safeCategory}` : ""}
${safeMetric ? `Success Metric: ${safeMetric}` : ""}
${safeWhy ? `Why it matters: ${safeWhy}` : ""}
${safeConstraints ? `Constraints: ${safeConstraints}` : ""}
${goal.target_date ? `Target Date: ${String(goal.target_date).slice(0, 10)}` : ""}
${profile?.life_phase ? `User Life Phase: ${String(profile.life_phase).slice(0, 50)}` : ""}

Rules:
- Each task must be specific and actionable (not vague advice)
- Tasks should be sequenced logically
- Include a mix of quick wins and meaningful progress steps
- Each task should be completable in 5-30 minutes
- Never suggest anything harmful, illegal, or medically irresponsible
- Keep titles under 80 characters
- Include a brief description (1-2 sentences) for each task`;
    } else if (source_type === "mentor" && mentor_message) {
      const safeMessage = String(mentor_message).slice(0, 3000);
      if (!safeMessage.trim()) {
        return new Response(JSON.stringify({ error: "Mentor message is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      prompt = `You are a life strategy assistant. Convert this mentor advice into a practical playbook of 3-6 actionable micro moves (tasks).

Mentor's advice:
${safeMessage}

${profile?.life_phase ? `User Life Phase: ${String(profile.life_phase).slice(0, 50)}` : ""}

Rules:
- Extract actionable steps from the advice
- Each task must be specific and completable
- Tasks should be sequenced logically  
- Each task should be completable in 5-30 minutes
- Never suggest anything harmful, illegal, or medically irresponsible
- Keep titles under 80 characters
- Include a brief description (1-2 sentences) for each task`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid source_type or missing data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a practical life strategy assistant. Return structured task suggestions." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_playbook",
              description: "Create a structured playbook with micro moves",
              parameters: {
                type: "object",
                properties: {
                  playbook_title: { type: "string" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        effort_minutes: { type: "number" },
                      },
                      required: ["title", "description", "effort_minutes"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["playbook_title", "tasks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_playbook" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
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
      return new Response(JSON.stringify({ error: "Failed to generate playbook" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Failed to generate playbook structure" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let playbook;
    try {
      playbook = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to parse generated playbook" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!playbook.playbook_title || !Array.isArray(playbook.tasks) || playbook.tasks.length === 0) {
      return new Response(JSON.stringify({ error: "Generated playbook was incomplete" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    playbook.playbook_title = String(playbook.playbook_title).slice(0, 200);
    playbook.tasks = playbook.tasks.slice(0, 10).map((t: any) => ({
      title: String(t.title || "").slice(0, 80),
      description: String(t.description || "").slice(0, 500),
      effort_minutes: Math.min(Math.max(Number(t.effort_minutes) || 15, 1), 120),
    }));

    return new Response(JSON.stringify(playbook), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-playbook error:", e instanceof Error ? e.message : "Unknown");
    return new Response(JSON.stringify({ error: "Failed to generate playbook" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
