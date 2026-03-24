import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Goal {
  title: string;
  category: string | null;
  status: string | null;
}

interface AnalysisResult {
  approved: boolean;
  mentorComment: string;
  opportunities: OpportunitySuggestion[];
  nudge?: string;
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

    const { content, mediaUrls, mood, energy, gratitude, reflection, goals } = await req.json();
    
    if (!content && (!mediaUrls || mediaUrls.length === 0) && !gratitude && !reflection) {
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

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, life_phase, focus_areas')
      .eq('user_id', userId)
      .single();

    // Build goal context
    const goalsContext = goals && goals.length > 0
      ? `User's active goals: ${goals.map((g: Goal) => `"${g.title}" (${g.category || 'general'})`).join(', ')}.`
      : 'User has no active goals set.';

    // Build mood context
    const moodLabels: Record<number, string> = { 1: 'struggling', 3: 'low', 5: 'okay', 7: 'good', 9: 'great' };
    const energyLabels: Record<number, string> = { 1: 'drained', 3: 'low', 5: 'steady', 7: 'energized', 9: 'electric' };
    const moodContext = mood ? `Current mood: ${moodLabels[mood] || 'unknown'}.` : '';
    const energyContext = energy ? `Energy level: ${energyLabels[energy] || 'unknown'}.` : '';

    const systemPrompt = `You are a supportive, warm AI life coach for a journaling app called LifeStack.

Your tasks:
1. CONTENT MODERATION: Check if the content is appropriate. Flag and reject:
   - Graphic violence or gore
   - Pornographic content
   - Hate speech or harassment
   - Dangerous self-harm content
   
2. POSITIVE REINFORCEMENT: If approved, provide an encouraging, empathetic comment (2-3 sentences) that:
   - Acknowledges what the user shared
   - Offers warmth and validation
   - Is genuine and personal, not generic

3. GOAL-BASED NUDGE: Based on the user's goals, provide a brief actionable nudge (1-2 sentences) that:
   - Connects their journal entry to their goals
   - Suggests a small, achievable next step
   - Is encouraging, not pushy

4. OPPORTUNITY DETECTION: If relevant, identify opportunities mentioned in the content:
   - Health/fitness activities → gym, coaches, nutrition
   - Career mentions → courses, networking, services
   - Hobbies → related equipment, classes, communities
   - Relationships → date ideas, gift suggestions

Context:
- User name: ${profile?.name || 'Friend'}
- Life phase: ${profile?.life_phase || 'unknown'}
- ${goalsContext}
- ${moodContext}
- ${energyContext}

IMPORTANT: Be warm and supportive. Focus on emotional validation first, then practical suggestions.

Respond in JSON format:
{
  "approved": true/false,
  "mentorComment": "Your empathetic, personalized comment here",
  "nudge": "Brief goal-related encouragement or suggestion",
  "opportunities": [
    {
      "category": "Category name",
      "title": "Short title",
      "description": "Brief description of why helpful",
      "searchQuery": "Google search query for local services"
    }
  ],
  "flagReason": "Only if approved is false"
}

Keep opportunities to max 2 most relevant. If content is purely personal reflection with no clear opportunities, return empty array.`;

    // Build user message
    const userMessage: { role: string; content: (string | { type: string; image_url?: { url: string }; text?: string })[] } = {
      role: "user",
      content: []
    };

    const textParts = [];
    if (content) textParts.push(`Journal entry: "${content}"`);
    if (gratitude) textParts.push(`Gratitude: "${gratitude}"`);
    if (reflection) textParts.push(`Reflection: "${reflection}"`);
    
    if (textParts.length > 0) {
      userMessage.content.push({ type: "text", text: textParts.join('\n\n') });
    }

    // Add images for analysis
    if (mediaUrls && mediaUrls.length > 0) {
      for (const url of mediaUrls) {
        if (!url.match(/\.(mp4|mov|webm|avi|webm|mp3|wav|ogg)(\?|$)/i)) {
          userMessage.content.push({
            type: "image_url",
            image_url: { url }
          });
        }
      }
    }

    if (userMessage.content.length === 0) {
      userMessage.content.push({ type: "text", text: "No analyzable content provided." });
    }

    console.log("Sending journal content for AI analysis...");

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
    
    // Response parsed (not logging content for privacy)

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(rawContent);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      analysis = {
        approved: true,
        mentorComment: "Thank you for taking time to reflect today. Keep up the great work!",
        opportunities: []
      };
    }

    // Ensure required fields
    if (typeof analysis.approved !== 'boolean') analysis.approved = true;
    if (!analysis.mentorComment) analysis.mentorComment = "Thanks for sharing your thoughts!";
    if (!Array.isArray(analysis.opportunities)) analysis.opportunities = [];

    console.log("Analysis complete:", { approved: analysis.approved, hasNudge: !!analysis.nudge });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Analyze journal entry error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Journal analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
