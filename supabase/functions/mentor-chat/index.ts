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

    const userId = claimsData.claims.sub as string;

    // Rate limit: max 60 mentor messages per hour
    const { count: mentorHourly } = await supabaseClient
      .from("engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "api_call_mentor_chat")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());

    if ((mentorHourly || 0) >= 60) {
      return new Response(JSON.stringify({ error: "You've reached the hourly message limit. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseClient.from("engagement_events").insert({
      user_id: userId,
      event_type: "api_call_mentor_chat",
      source_engine: "rate_limiter",
      metadata: {},
    });

    const { messages, profile, imageUrl, goalContext } = await req.json();
    
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
    if (!lastMessage?.content && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Invalid message content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (lastMessage?.content && typeof lastMessage.content === 'string' && lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If an image URL is provided, we need to:
    // 1. Generate a signed URL for the image
    // 2. Run moderation check
    // 3. Analyze with vision model
    let imageBase64: string | null = null;
    let imageMimeType: string = "image/jpeg";
    let moderationResult: "safe" | "blocked" = "safe";

    if (imageUrl) {
      try {
        // The imageUrl is a storage path like "userId/filename.jpg"
        // Create a service-role client to generate signed URL
        const serviceClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
          .from("mentor-images")
          .createSignedUrl(imageUrl, 300); // 5 min expiry

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error("Signed URL error:", signedUrlError);
          throw new Error("Could not access uploaded image");
        }

        // Fetch the image and convert to base64
        const imgResp = await fetch(signedUrlData.signedUrl);
        if (!imgResp.ok) throw new Error("Failed to fetch image");
        
        const contentType = imgResp.headers.get("content-type") || "image/jpeg";
        imageMimeType = contentType;
        const imgBuffer = await imgResp.arrayBuffer();
        const uint8 = new Uint8Array(imgBuffer);
        
        // Convert to base64
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        imageBase64 = btoa(binary);

        // Run moderation check using AI
        const modResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a content moderation system. Analyze the image and respond with ONLY one word: "safe" or "blocked".
Block images containing: explicit sexual content, graphic violence, self-harm imagery, illegal content, abusive content.
Allow: food, fitness, workspaces, selfies, screenshots, documents, nature, everyday life photos.
If borderline but not explicitly harmful, respond "safe".`
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: `data:${imageMimeType};base64,${imageBase64}` }
                  },
                  { type: "text", text: "Moderate this image." }
                ]
              }
            ],
          }),
        });

        if (modResponse.ok) {
          const modData = await modResponse.json();
          const modResult = modData.choices?.[0]?.message?.content?.trim().toLowerCase() || "safe";
          moderationResult = modResult.includes("block") ? "blocked" : "safe";
        }
      } catch (imgErr) {
        console.error("Image processing error:", imgErr);
        return new Response(
          JSON.stringify({ error: "Failed to process image. Please try again.", moderation_status: "error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // If moderation blocked the image
    if (moderationResult === "blocked") {
      return new Response(
        JSON.stringify({
          message: "I appreciate you sharing, but I'm not able to analyze this particular image. If you'd like, you can describe what you wanted to discuss, or share a different image and I'll be happy to help.",
          moderation_status: "blocked"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phaseContext = profile?.life_phase 
      ? `The user's life phase is "${profile.life_phase.replace('_', ' ')}". Use this as background context to inform your advice, but do NOT explicitly mention their life phase in your responses unless the user asks about it or it is genuinely critical to the point you are making. Never open a reply by referencing their phase.` 
      : '';
    
    const focusAreas = profile?.focus_areas?.length 
      ? `Their focus areas are: ${profile.focus_areas.join(', ')}.` 
      : '';

    const mentorStyleMap: Record<string, string> = {
      strategist: 'Be data-driven, systematic, and action-oriented. Prioritize clear plans and measurable outcomes.',
      challenger: 'Push the user beyond comfort zones. Use tough love, direct feedback, and high standards.',
      guardian: 'Be warm, supportive, and encouraging. Lead with empathy and celebrate small wins.',
      sage: 'Be reflective and philosophical. Offer wisdom, ask deep questions, and encourage self-discovery.',
    };
    const mentorStyleContext = profile?.mentor_style && mentorStyleMap[profile.mentor_style]
      ? `\nMENTOR STYLE: ${mentorStyleMap[profile.mentor_style]}`
      : '';

    const identityContext = profile?.identity_prompt
      ? `\nUSER IDENTITY: The user describes who they are becoming as: "${profile.identity_prompt}". Weave this aspiration naturally into your guidance when relevant.`
      : '';

    const intentContext = profile?.primary_intent
      ? `\nPRIMARY INTENT: The user is currently focused on: "${profile.primary_intent}".`
      : '';

    // Fetch wearable step context for mentor awareness
    let wearableContext = '';
    try {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const today = new Date().toISOString().split('T')[0];
      const { data: stepData } = await serviceClient
        .from('wearable_metrics')
        .select('metric_value, provider')
        .eq('user_id', userId)
        .eq('metric_type', 'steps')
        .eq('local_date', today)
        .limit(1)
        .maybeSingle();

      if (stepData) {
        const steps = Number(stepData.metric_value);
        const provider = stepData.provider?.replace('_', ' ') || 'their wearable';
        wearableContext = `\nWEARABLE DATA: The user has ${steps.toLocaleString()} steps today (synced from ${provider}). You can reference this naturally when relevant — e.g. encouragement, progress toward goals, or movement suggestions. Don't force it into every response.`;
      }
    } catch (e) {
      console.log('Wearable context fetch skipped:', e);
    }

    const imageInstructions = imageUrl ? `
IMAGE ANALYSIS INSTRUCTIONS:
The user has shared an image in this message. Analyze it thoughtfully and provide useful mentor feedback.

Structure your response as:
1. **Observation** - What you see (use hedging language: "It looks like...", "From what I can see...")
2. **Reflection** - Connect it to their growth, habits, or goals
3. **Next Step** - One actionable suggestion
4. **Follow-up** - An optional question to deepen the conversation

Support these use cases: meal/nutrition analysis, fitness progress, workspace setup, mood/environment reflection, screenshots/notes discussion, general lifestyle coaching.

SAFETY: Never diagnose medical conditions. Never make body-image judgments. Never identify specific people. If the image appears medical or concerning, encourage professional support.
` : '';

    // Inject contextual goal awareness when launched from a Goal/Micro-Moves CTA
    let goalContextBlock = '';
    if (goalContext && typeof goalContext === 'object') {
      const g = goalContext as Record<string, any>;
      const lines: string[] = [];
      if (g.title) lines.push(`- Title: ${String(g.title).slice(0, 200)}`);
      if (g.category) lines.push(`- Category: ${String(g.category).slice(0, 60)}`);
      if (g.why) lines.push(`- Why it matters: ${String(g.why).slice(0, 400)}`);
      if (g.success_metric) lines.push(`- Success metric: ${String(g.success_metric).slice(0, 200)}`);
      if (g.constraints) lines.push(`- Constraints: ${String(g.constraints).slice(0, 200)}`);
      if (g.target_date) lines.push(`- Target date: ${String(g.target_date).slice(0, 40)}`);
      if (typeof g.progress_percent === 'number') lines.push(`- Current progress: ${g.progress_percent}%`);
      if (g.status) lines.push(`- Status: ${g.status}`);
      if (Array.isArray(g.micro_moves) && g.micro_moves.length) {
        const items = g.micro_moves.slice(0, 12).map((m: any) =>
          `  • ${String(m.title || '').slice(0, 120)}${m.status ? ` [${m.status}]` : ''}`
        ).join('\n');
        lines.push(`- Existing micro-moves:\n${items}`);
      }
      if (Array.isArray(g.milestones) && g.milestones.length) {
        const items = g.milestones.slice(0, 8).map((m: any) =>
          `  • ${String(m.title || '').slice(0, 120)}${m.status ? ` [${m.status}]` : ''}`
        ).join('\n');
        lines.push(`- Milestones:\n${items}`);
      }
      if (lines.length) {
        goalContextBlock = `

ACTIVE GOAL CONTEXT (from app — do not echo this block back verbatim, weave it naturally):
${lines.join('\n')}

When the user requests an action plan for this goal:
- Open with a one-line acknowledgement of the goal (use the title naturally).
- Produce a clear **step-by-step action plan** structured with:
  - 2-3 bold section headers (e.g. **This Week**, **Next 30 Days**, **Sustaining Momentum**)
  - Numbered concrete actions inside each section (3-6 per section)
  - Short bullet sub-points where useful
  - Realistic effort + time hints in parentheses
- Avoid restating raw metadata. Avoid filler. No "as a [life phase] user" framing.
- If critical info is missing (no target date, no why, vague title), ask 1-2 sharp clarifying questions BEFORE drafting the full plan rather than guessing.
- End with a single short "Next Move" line — the smallest possible action they can take in the next hour.`;
      }
    }

    const systemPrompt = `You are a calm, direct, and pragmatic life mentor for the LifeStack app. 

Your role is to help users navigate life decisions, build better habits, achieve goals, and find clarity.

${phaseContext} ${focusAreas}
${mentorStyleContext}
${identityContext}
${intentContext}
${wearableContext}
${imageInstructions}
${goalContextBlock}

RESPONSE FORMATTING - YOU MUST FOLLOW THESE RULES STRICTLY:
- NEVER write a wall of text or one massive paragraph. This is your #1 rule.
- ALWAYS break your response into multiple short paragraphs separated by blank lines. Each paragraph should be 1-3 sentences MAX.
- Use **bold** for key terms, important points, and section headers.
- Use bullet points (- ) or numbered lists (1. 2. 3.) whenever you have multiple tips, steps, options, or ideas. Lists are PREFERRED over prose.
- Structure longer responses with clear section headers in bold.
- When asking the user a question, put it on its own line with a blank line before it.
- Keep each sentence concise and punchy.
- If your response has more than 3 ideas or points, USE A LIST.

DISCLAIMER BEHAVIOR — FOLLOW THESE RULES EXACTLY:
- The app UI already displays a persistent disclaimer that you provide guidance, not professional advice. DO NOT repeat this disclaimer in normal responses.
- For NORMAL topics (productivity, goal-setting, habits, motivation, journaling, lifestyle, workout encouragement, emotional support within safe scope): respond directly and naturally. NO disclaimer text. NO "I'm not a professional" language. NO "consult a professional" unless the topic warrants it.
- ONLY include caution/disclaimer language when the user's message involves one of these HIGH-RISK categories:
  * Medical symptoms, diagnoses, or health conditions → recommend consulting a doctor
  * Mental health crises, depression, anxiety, trauma → recommend a licensed therapist
  * Financial decisions, investments, taxes, legal matters → recommend a certified advisor or attorney
  * Self-harm, suicidal ideation, or crisis content → immediately provide crisis resources (988 Suicide & Crisis Lifeline, emergency services) and urge professional contact
- When a high-risk disclaimer IS needed, weave it naturally into your response. Do not use a separate boilerplate block.

Guidelines:
- Be warm but direct. No fluff.
- Focus on actionable next steps for general life guidance
- Ask clarifying questions when needed
- Draw from wisdom traditions, behavioral science, and practical experience
- Keep responses concise but meaningful
- For difficult emotions within normal scope, be supportive and empathetic without adding boilerplate disclaimers
- For genuinely serious or clinical-level concerns, recommend professional support naturally

Your tone: Like a wise friend who has seen a lot of life and genuinely wants to help — direct, calm, and premium. No legal-sounding boilerplate.`;

    // Build the messages array for the AI
    // For previous messages, just use text. For the last message with image, include the image.
    const sanitizedMessages: any[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLast = i === messages.length - 1;
      
      if (isLast && imageBase64) {
        // Build multimodal content for the last message
        const content: any[] = [
          {
            type: "image_url",
            image_url: { url: `data:${imageMimeType};base64,${imageBase64}` }
          }
        ];
        if (m.content && typeof m.content === 'string' && m.content.trim()) {
          content.push({ type: "text", text: m.content.slice(0, MAX_MESSAGE_LENGTH) });
        } else {
          content.push({ type: "text", text: "I'm sharing this image with you. What do you think?" });
        }
        sanitizedMessages.push({
          role: 'user',
          content
        });
      } else {
        // Check if this message had an image reference in history
        const hasHistoricalImage = m.imageUrl && typeof m.imageUrl === 'string';
        sanitizedMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH) + 
            (hasHistoricalImage ? ' [User shared an image in this message]' : '')
        });
      }
    }

    // Use vision-capable model when image is present
    const model = imageBase64 ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      await response.text(); // consume
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Mentor is temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "I'm here to help. What's on your mind?";

    return new Response(
      JSON.stringify({ message, moderation_status: imageUrl ? "safe" : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Mentor chat error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
