import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { source_type, goal, mentor_message, profile } = await req.json();

    let prompt = "";

    if (source_type === "goal" && goal) {
      prompt = `You are a life strategy assistant. Generate a practical, actionable playbook of 4-7 micro moves (tasks) to help achieve this goal.

Goal: ${goal.title}
${goal.category ? `Category: ${goal.category}` : ""}
${goal.success_metric ? `Success Metric: ${goal.success_metric}` : ""}
${goal.why ? `Why it matters: ${goal.why}` : ""}
${goal.constraints ? `Constraints: ${goal.constraints}` : ""}
${goal.target_date ? `Target Date: ${goal.target_date}` : ""}
${profile?.life_phase ? `User Life Phase: ${profile.life_phase}` : ""}

Rules:
- Each task must be specific and actionable (not vague advice)
- Tasks should be sequenced logically
- Include a mix of quick wins and meaningful progress steps
- Each task should be completable in 5-30 minutes
- Never suggest anything harmful, illegal, or medically irresponsible
- Keep titles under 80 characters
- Include a brief description (1-2 sentences) for each task`;
    } else if (source_type === "mentor" && mentor_message) {
      prompt = `You are a life strategy assistant. Convert this mentor advice into a practical playbook of 3-6 actionable micro moves (tasks).

Mentor's advice:
${mentor_message}

${profile?.life_phase ? `User Life Phase: ${profile.life_phase}` : ""}

Rules:
- Extract actionable steps from the advice
- Each task must be specific and completable
- Tasks should be sequenced logically  
- Each task should be completable in 5-30 minutes
- Never suggest anything harmful, illegal, or medically irresponsible
- Keep titles under 80 characters
- Include a brief description (1-2 sentences) for each task`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid source_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
                  playbook_title: { type: "string", description: "A short descriptive title for this playbook" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Task title, max 80 chars" },
                        description: { type: "string", description: "Brief description, 1-2 sentences" },
                        effort_minutes: { type: "number", description: "Estimated minutes to complete (5-30)" },
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const playbook = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(playbook), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-playbook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
