import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const phaseContext = profile?.life_phase 
      ? `The user is in the "${profile.life_phase.replace('_', ' ')}" life phase.` 
      : '';
    
    const focusAreas = profile?.focus_areas?.length 
      ? `Their focus areas are: ${profile.focus_areas.join(', ')}.` 
      : '';

    const systemPrompt = `You are a calm, direct, and pragmatic life mentor for the LifeStack app. 

Your role is to help users navigate life decisions, build better habits, achieve goals, and find clarity.

${phaseContext} ${focusAreas}

Guidelines:
- Be warm but direct. No fluff.
- Focus on actionable next steps
- Ask clarifying questions when needed
- Never give medical, legal, or financial advice - suggest professionals instead
- Draw from wisdom traditions, behavioral science, and practical experience
- Keep responses concise but meaningful
- If discussing difficult emotions, be supportive and suggest professional help when appropriate

Your tone: Like a wise friend who has seen a lot of life and genuinely wants to help.`;

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
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "I'm here to help. What's on your mind?";

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Mentor chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
