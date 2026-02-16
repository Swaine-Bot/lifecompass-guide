import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { messages, profile } = await req.json();
    
    // Validate input
    const MAX_MESSAGE_LENGTH = 5000;
    const MAX_MESSAGES = 50;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || typeof lastMessage.content !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid message content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Sanitize messages - ensure only valid roles and content
    const sanitizedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, MAX_MESSAGE_LENGTH)
    }));
    
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

RESPONSE FORMATTING - YOU MUST FOLLOW THESE RULES STRICTLY:
- NEVER write a wall of text or one massive paragraph. This is your #1 rule.
- ALWAYS break your response into multiple short paragraphs separated by blank lines. Each paragraph should be 1-3 sentences MAX.
- Use **bold** for key terms, important points, and section headers.
- Use bullet points (- ) or numbered lists (1. 2. 3.) whenever you have multiple tips, steps, options, or ideas. Lists are PREFERRED over prose.
- Structure longer responses with clear section headers in bold, e.g.:

  **Why this matters**

  Brief explanation here.

  **What to do next**

  - First action
  - Second action
  - Third action

- When asking the user a question, put it on its own line with a blank line before it.
- Keep each sentence concise and punchy. Avoid run-on sentences.
- If your response has more than 3 ideas or points, USE A LIST. Do not combine them into a paragraph.

CRITICAL DISCLAIMER - You must follow these rules strictly:
- Your guidance is for informational purposes only and does NOT constitute professional advice
- You are NOT a licensed medical professional, therapist, financial advisor, or legal expert
- For ANY medical symptoms, mental health concerns, or physical health issues: strongly recommend they consult a doctor or healthcare provider
- For ANY mental health struggles, depression, anxiety, trauma, or emotional crises: recommend they speak with a licensed therapist or counselor
- For ANY financial decisions, investments, taxes, or legal matters: recommend they consult a certified financial advisor or attorney
- For ANY thoughts of self-harm or suicide: immediately provide crisis resources and urge them to contact emergency services or a crisis hotline
- Always end advice on serious topics with a reminder to seek professional help

Guidelines:
- Be warm but direct. No fluff.
- Focus on actionable next steps for general life guidance
- Ask clarifying questions when needed
- Draw from wisdom traditions, behavioral science, and practical experience
- Keep responses concise but meaningful
- If discussing difficult emotions, be supportive and ALWAYS suggest professional help
- When users discuss serious issues, remind them that a human professional can provide personalized support

Your tone: Like a wise friend who has seen a lot of life and genuinely wants to help - but one who knows their limits and always defers to professionals for serious matters.`;

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
          ...sanitizedMessages,
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
