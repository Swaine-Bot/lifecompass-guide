import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, subtitle, contentType, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const styleGuides: Record<string, string> = {
      reflective: "Write a thoughtful, introspective observation. Tone: calm, wise, contemplative.",
      bold: "Write a confident, assertive statement about growth. Tone: strong, decisive, empowering.",
      minimal: "Write a very short, punchy line (under 10 words). Tone: clean, sharp, understated.",
      motivational: "Write an encouraging insight about progress. Tone: warm, uplifting, genuine (not cheesy).",
      professional: "Write a polished, LinkedIn-appropriate observation. Tone: measured, credible, sophisticated.",
    };

    const styleGuide = styleGuides[style] || styleGuides.reflective;

    const systemPrompt = `You are LifeStack's AI insight generator for share cards. Generate ONE concise, emotionally intelligent insight for a share card.

Rules:
- Maximum 25 words
- No emojis, no exclamation marks
- No generic motivational clichés
- Must feel personal and specific to the content
- Must be appropriate for public sharing
- Do not reveal private details not already in the title/subtitle
- Do not start with "This" or "You"

${styleGuide}

Content type: ${contentType || 'general'}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Title: ${title || 'Untitled'}\nContext: ${subtitle?.slice(0, 200) || 'No additional context'}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || null;

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-share-insight error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
