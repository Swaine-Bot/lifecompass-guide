import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log("Analyzing content for user:", userId);

    const { content, mediaUrls, userLocation } = await req.json();
    
    // Validate input
    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return new Response(
        JSON.stringify({ error: "No content to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, life_phase, focus_areas, last_latitude, last_longitude')
      .eq('user_id', userId)
      .single();

    const locationContext = profile?.last_latitude && profile?.last_longitude
      ? `User is located near coordinates (${profile.last_latitude.toFixed(2)}, ${profile.last_longitude.toFixed(2)}). Use this to suggest local services.`
      : userLocation 
        ? `User is in ${userLocation}.` 
        : 'Location unknown - provide general suggestions.';

    // Build the analysis prompt
    const systemPrompt = `You are a content moderation and opportunity detection AI for a life coaching app called LifeStack.

Your tasks:
1. CONTENT MODERATION: Check if the content is appropriate for a community feed. Flag and reject:
   - Graphic violence or gore
   - Pornographic or sexually explicit content
   - Hate speech, discrimination, or harassment
   - Dangerous activities or self-harm content
   - Spam or scam content
   
2. POSITIVE FEEDBACK: If approved, provide a brief, warm, encouraging comment (1-2 sentences) about what the user shared. Be genuine, not generic.

3. OPPORTUNITY DETECTION: Analyze images and text for objects, activities, or themes that could connect to useful services or products. Examples:
   - Car in photo → insurance, mechanics, car dealers, detailing services
   - Gym/workout → fitness coaches, nutrition plans, sports equipment
   - Home/garden → home improvement, landscaping, real estate
   - Food/cooking → cooking classes, kitchen equipment, restaurants
   - Books/studying → courses, tutoring, bookstores
   - Travel/outdoors → travel agencies, camping gear, adventure tours
   - Pets → veterinarians, pet supplies, grooming
   - Baby/kids → parenting resources, childcare, educational toys
   - Business/work → business services, networking events, courses

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
  "flagReason": "Only include if approved is false - explain why content was rejected"
}

Keep opportunities to max 3 most relevant suggestions. If content is purely social (selfie, friends, family) with no clear opportunities, return empty opportunities array.`;

    // Build the user message with content and media
    const userMessage: { role: string; content: (string | { type: string; image_url?: { url: string }; text?: string })[] } = {
      role: "user",
      content: []
    };

    if (content) {
      userMessage.content.push({
        type: "text",
        text: `Post text: "${content}"`
      });
    }

    // Add images for analysis
    if (mediaUrls && mediaUrls.length > 0) {
      for (const url of mediaUrls) {
        // Check if it's an image (not video)
        if (!url.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) {
          userMessage.content.push({
            type: "image_url",
            image_url: { url }
          });
        }
      }
    }

    if (userMessage.content.length === 0) {
      userMessage.content.push({
        type: "text",
        text: "No analyzable content provided."
      });
    }

    console.log("Sending content for AI analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          userMessage,
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    
    console.log("Raw AI response:", rawContent);

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(rawContent);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Default to approved with generic message
      analysis = {
        approved: true,
        mentorComment: "Thanks for sharing with the community!",
        opportunities: []
      };
    }

    // Ensure required fields exist
    if (typeof analysis.approved !== 'boolean') {
      analysis.approved = true;
    }
    if (!analysis.mentorComment) {
      analysis.mentorComment = "Thanks for sharing!";
    }
    if (!Array.isArray(analysis.opportunities)) {
      analysis.opportunities = [];
    }

    console.log("Analysis complete:", { approved: analysis.approved, opportunitiesCount: analysis.opportunities.length });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Analyze post content error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
