// Fact-check / soundness verifier for mentor responses.
// Runs a second LLM pass that critiques the assistant message for unsupported
// factual claims, logical leaps, and risky advice. Returns a compact verdict.
//
// Cost note: this is opt-in (called only when the user taps "Verify"), so it
// does NOT double the cost of every mentor turn.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are a fact-check and soundness reviewer for life-coaching AI replies.
You receive ONE assistant message and (optionally) the user's preceding question.

Return STRICT JSON only (no prose, no markdown fences):
{
  "verdict": "verified" | "caveats" | "unsupported",
  "confidence": 0.0-1.0,
  "summary": "one short sentence (<=140 chars) for the user",
  "issues": ["short bullet", "short bullet"]   // 0-3 items, omit if none
}

Rules:
- "verified": claims are widely supported or the reply is purely reflective/coaching (no factual claims to check).
- "caveats": mostly sound but contains an overgeneralization, missing nuance, or advice that needs a professional caveat (medical/legal/financial).
- "unsupported": contains a specific factual claim that is wrong, fabricated, or unverifiable.
- Be calibrated. Coaching language ("try X", "consider Y") is not a factual claim.
- Never invent issues. If nothing is wrong, return an empty issues array.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !lovableKey) {
      return json({ error: "Service configuration error" }, 503);
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    // Rate limit: max 30 verifications per hour per user.
    const { count: hourly } = await supabaseClient
      .from("engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "api_call_mentor_verify")
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());
    if ((hourly || 0) >= 30) {
      return json({ error: "Verification limit reached. Try again later." }, 429);
    }

    const body = await req.json().catch(() => ({}));
    const assistant = typeof body?.assistant === "string" ? body.assistant.slice(0, 6000) : "";
    const userQuestion = typeof body?.user === "string" ? body.user.slice(0, 2000) : "";
    if (!assistant.trim()) return json({ error: "assistant text required" }, 400);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `USER QUESTION:\n${userQuestion || "(not provided)"}\n\nASSISTANT REPLY:\n${assistant}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) return json({ error: "AI is busy. Try again shortly." }, 429);
    if (resp.status === 402) return json({ error: "Workspace AI credits exhausted." }, 402);
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return json({ error: `Upstream error: ${t.slice(0, 200)}` }, 502);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { verdict: "caveats", confidence: 0.5, summary: "Could not fully verify.", issues: [] };
    }

    // Log usage (rate-limit counter).
    await supabaseClient.from("engagement_events").insert({
      user_id: userId,
      event_type: "api_call_mentor_verify",
      payload: { verdict: parsed?.verdict ?? "unknown" },
    });

    return json({
      verdict: ["verified", "caveats", "unsupported"].includes(parsed?.verdict) ? parsed.verdict : "caveats",
      confidence: typeof parsed?.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      summary: typeof parsed?.summary === "string" ? parsed.summary.slice(0, 200) : "",
      issues: Array.isArray(parsed?.issues) ? parsed.issues.slice(0, 3).map((s: any) => String(s).slice(0, 200)) : [],
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
