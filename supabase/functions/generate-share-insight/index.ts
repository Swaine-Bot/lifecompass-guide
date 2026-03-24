import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, subtitle, contentType, style } = await req.json();

    // Input validation
    const safeTitle = String(title || "Untitled").slice(0, 200);
    const safeSubtitle = String(subtitle || "").slice(0, 500);
    const safeStyle = ["reflective", "bold", "minimal", "motivational", "professional"].includes(style) ? style : "reflective";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service unavailable");

    const styleGuides: Record<string, string> = {
      reflective: "Write a thoughtful, introspective observation. Tone: calm, wise, contemplative.",
      bold: "Write a confident, assertive statement about growth. Tone: strong, decisive, empowering.",
      minimal: "Write a very short, punchy line (under 10 words). Tone: clean, sharp, understated.",
      motivational: "Write an encouraging insight about progress. Tone: warm, uplifting, genuine (not cheesy).",
      professional: "Write a polished, LinkedIn-appropriate observation. Tone: measured, credible, sophisticated.",
    };

    const styleGuide = styleGuides[safeStyle];

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
          { role: "user", content: `Title: ${safeTitle}\nContext: ${safeSubtitle}` },
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
    return new Response(JSON.stringify({ error: "Failed to generate insight" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
