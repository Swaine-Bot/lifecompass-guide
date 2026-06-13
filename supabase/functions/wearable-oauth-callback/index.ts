/**
 * Generic Wearable OAuth callback — exchanges authorization code for tokens
 * and stores them in wearable_connections (encrypted column stub — real KMS
 * encryption to be wired in Phase 5).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Cfg = { tokenUrl: string; clientIdEnv: string; clientSecretEnv: string; basicAuth?: boolean };

const PROVIDERS: Record<string, Cfg> = {
  fitbit: { tokenUrl: "https://api.fitbit.com/oauth2/token", clientIdEnv: "FITBIT_CLIENT_ID", clientSecretEnv: "FITBIT_CLIENT_SECRET", basicAuth: true },
  oura:   { tokenUrl: "https://api.ouraring.com/oauth/token", clientIdEnv: "OURA_CLIENT_ID",   clientSecretEnv: "OURA_CLIENT_SECRET" },
  whoop:  { tokenUrl: "https://api.prod.whoop.com/oauth/oauth2/token", clientIdEnv: "WHOOP_CLIENT_ID", clientSecretEnv: "WHOOP_CLIENT_SECRET" },
  strava: { tokenUrl: "https://www.strava.com/api/v3/oauth/token", clientIdEnv: "STRAVA_CLIENT_ID", clientSecretEnv: "STRAVA_CLIENT_SECRET" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Missing authorization" }, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anon || !serviceKey) return json({ error: "Service configuration error" }, 503);

    const sb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: claims, error: ce } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
    if (ce || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const provider = String(body?.provider || "").toLowerCase();
    const code = String(body?.code || "");
    const state = String(body?.state || "");
    const redirectUri = String(body?.redirect_uri || "");

    if (!provider || !code || !redirectUri) return json({ error: "provider, code, redirect_uri required" }, 400);

    const cfg = PROVIDERS[provider];
    if (!cfg) return json({ error: `Unsupported provider: ${provider}` }, 400);

    // Verify state belongs to this user (anti-CSRF).
    try {
      const parsed = JSON.parse(atob(state));
      if (parsed?.u !== userId || parsed?.p !== provider) {
        return json({ error: "State mismatch" }, 400);
      }
      if (Date.now() - (parsed?.t ?? 0) > 10 * 60 * 1000) {
        return json({ error: "OAuth state expired" }, 400);
      }
    } catch {
      return json({ error: "Invalid state" }, 400);
    }

    const clientId = Deno.env.get(cfg.clientIdEnv);
    const clientSecret = Deno.env.get(cfg.clientSecretEnv);
    if (!clientId || !clientSecret) {
      return json({ error: `${provider} not configured. Add ${cfg.clientIdEnv} and ${cfg.clientSecretEnv}.` }, 503);
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
    if (cfg.basicAuth) {
      headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } else {
      params.set("client_id", clientId);
      params.set("client_secret", clientSecret);
    }

    const resp = await fetch(cfg.tokenUrl, { method: "POST", headers, body: params.toString() });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return json({ error: `Token exchange failed: ${t.slice(0, 200)}` }, 502);
    }
    const token = await resp.json();
    const accessToken = token.access_token as string | undefined;
    const refreshToken = token.refresh_token as string | undefined;
    const expiresIn = Number(token.expires_in ?? 0);
    const externalId = String(token.user_id ?? token.athlete?.id ?? token.user?.id ?? "");

    if (!accessToken) return json({ error: "No access_token in provider response" }, 502);

    // Service-role upsert (tokens are sensitive; KMS encryption is a Phase 5 wire-in).
    const sbAdmin = createClient(url, serviceKey);
    const { error: upsertErr } = await sbAdmin.from("wearable_connections").upsert({
      user_id: userId,
      provider,
      connection_status: "connected",
      external_account_id: externalId || null,
      access_token_encrypted: accessToken,
      refresh_token_encrypted: refreshToken ?? null,
      token_expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      last_sync_status: "never",
      permissions_granted: ["activity"],
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });

    if (upsertErr) return json({ error: upsertErr.message }, 500);

    // Audit event
    await sbAdmin.from("audit_log").insert({
      user_id: userId, actor_id: userId,
      event_type: "wearable_oauth_connected",
      resource_type: "wearable_connection", resource_id: provider,
      details: { provider, has_refresh: !!refreshToken },
    });

    return json({ connected: true, provider, external_account_id: externalId || null });
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
