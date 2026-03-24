import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CALLS_PER_HOUR = 30;

interface AnalysisResult {
  approved: boolean;
  mentorComment: string;
  opportunities: OpportunitySuggestion[];
  flagReason?: string;
}

interface OpportunitySuggestion {
  category: string;
  title: string;
  description: string;
  searchQuery: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Rate limit check
    const { count } = await supabaseClient
      .from("engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "api_call_analyze_post")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());

    if ((count || 0) >= MAX_CALLS_PER_HOUR) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content, mediaUrls, userLocation } = await req.json();

    if (!content && (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0)) {
      return new Response(
        JSON.stringify({ error: "No content to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log rate limit event
    await supabaseClient.from("engagement_events").insert({
      user_id: userId,
      event_type: "api_call_analyze_post",
      source_engine: "rate_limiter",
      metadata: {},
    });

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("name, life_phase, focus_areas, last_latitude, last_longitude")
      .eq("user_id", userId)
      .single();

    const locationContext =
      profile?.last_latitude && profile?.last_longitude
        ? `User is located near coordinates (${profile.last_latitude.toFixed(2)}, ${profile.last_longitude.toFixed(2)}). Use this to suggest local services.`
        : userLocation
        ? `User is in ${String(userLocation).slice(0, 100)}.`
        : "Location unknown - provide general suggestions.";

    const safeContent = String(content || "").slice(0, 5000);

    const systemPrompt = `You are a content moderation and opportunity detection AI for a life coaching app called LifeStack.

Your tasks:
1. CONTENT MODERATION: Check if the content is appropriate for a community feed. Flag and reject:
   - Graphic violence or gore
   - Pornographic or sexually explicit content
   - Hate speech, discrimination, or harassment
   - Dangerous activities or self-harm content
   - Spam or scam content
   
2. POSITIVE FEEDBACK: If approved, provide a brief, warm, encouraging comment (1-2 sentences) about what the user shared. Be genuine, not generic.

3. OPPORTUNITY DETECTION: Analyze images and text for objects, activities, or themes that could connect to useful services or products.

${locationContext}

IMPORTANT: Only suggest relevant, helpful opportunities. Don't force suggestions if nothing is relevant.

Respond in JSON format:
{
  "approved": true/false,
  "mentorComment": "Your encouraging comment here",
  "opportunities": [
    {
      "category": "Category name",
      "title": "Short title for the suggestion",
      "description": "Brief description of why this might be helpful",
      "searchQuery": "Google search query to find this service locally"
    }
  ],
  "flagReason": "Only include if approved is false"
}

Keep opportunities to max 3 most relevant suggestions.`;

    const userMessage: {
      role: string;
      content: (string | { type: string; image_url?: { url: string }; text?: string })[];
    } = { role: "user", content: [] };

    if (safeContent) {
      userMessage.content.push({ type: "text", text: `Post text: "${safeContent}"` });
    }

    if (mediaUrls && Array.isArray(mediaUrls)) {
      for (const url of mediaUrls.slice(0, 5)) {
        if (typeof url === "string" && !url.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) {
          userMessage.content.push({ type: "image_url", image_url: { url } });
        }
      }
    }

    if (userMessage.content.length === 0) {
      userMessage.content.push({ type: "text", text: "No analyzable content provided." });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, userMessage],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exceeded." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await response.text(); // consume body
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Content analysis unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      analysis = { approved: true, mentorComment: "Thanks for sharing with the community!", opportunities: [] };
    }

    if (typeof analysis.approved !== "boolean") analysis.approved = true;
    if (!analysis.mentorComment) analysis.mentorComment = "Thanks for sharing!";
    if (!Array.isArray(analysis.opportunities)) analysis.opportunities = [];
    analysis.opportunities = analysis.opportunities.slice(0, 3);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Analyze post content error:", error instanceof Error ? error.message : "Unknown");
    return new Response(JSON.stringify({ error: "Content analysis failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
