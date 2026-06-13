/**
 * Generic Wearable OAuth start endpoint.
 *
 * Builds the provider authorization URL and returns it to the client to open.
 * Each provider's client_id/secret must be set as edge-function secrets
 * (e.g. FITBIT_CLIENT_ID / FITBIT_CLIENT_SECRET). Missing secrets surface a
 * clear "credentials not configured" error instead of a 500.
 *
 * Companion: wearable-oauth-callback exchanges the code for tokens.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ProviderConfig = {
  authUrl: string;
  scopes: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  responseType?: string;
  extraParams?: Record<string, string>;
};

const PROVIDERS: Record<string, ProviderConfig> = {
  fitbit: {
    authUrl: "https://www.fitbit.com/oauth2/authorize",
    scopes: "activity heartrate sleep weight profile",
    clientIdEnv: "FITBIT_CLIENT_ID",
    clientSecretEnv: "FITBIT_CLIENT_SECRET",
  },
  oura: {
    authUrl: "https://cloud.ouraring.com/oauth/authorize",
    scopes: "daily personal heartrate",
    clientIdEnv: "OURA_CLIENT_ID",
    clientSecretEnv: "OURA_CLIENT_SECRET",
  },
  whoop: {
    authUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
    scopes: "read:recovery read:sleep read:workout read:profile offline",
    clientIdEnv: "WHOOP_CLIENT_ID",
    clientSecretEnv: "WHOOP_CLIENT_SECRET",
  },
  strava: {
    authUrl: "https://www.strava.com/oauth/authorize",
    scopes: "read,activity:read_all",
    clientIdEnv: "STRAVA_CLIENT_ID",
    clientSecretEnv: "STRAVA_CLIENT_SECRET",
    extraParams: { approval_prompt: "auto" },
  },
  garmin: {
    // Garmin uses OAuth 1.0a — full request-token dance not implemented here;
    // surface a clear message so the integrator wires the Connect IQ flow.
    authUrl: "https://connect.garmin.com/oauthConfirm",
    scopes: "",
    clientIdEnv: "GARMIN_CONSUMER_KEY",
    clientSecretEnv: "GARMIN_CONSUMER_SECRET",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Missing authorization" }, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anon) return json({ error: "Service configuration error" }, 503);

    const sb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: claims, error: ce } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
    if (ce || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const provider = String(body?.provider || "").toLowerCase();
    const redirectUri = String(body?.redirect_uri || "");
    if (!provider || !redirectUri) return json({ error: "provider and redirect_uri required" }, 400);

    const cfg = PROVIDERS[provider];
    if (!cfg) return json({ error: `Unsupported provider: ${provider}` }, 400);

    if (provider === "garmin") {
      return json({
        error:
          "Garmin uses OAuth 1.0a (request-token dance). Set GARMIN_CONSUMER_KEY/SECRET and contact support to enable the full flow.",
        not_implemented: true,
      }, 501);
    }

    const clientId = Deno.env.get(cfg.clientIdEnv);
    if (!clientId) {
      return json({
        error: `${provider} not configured. Add the ${cfg.clientIdEnv} and ${cfg.clientSecretEnv} secrets.`,
        missing_secret: cfg.clientIdEnv,
      }, 503);
    }

    // Opaque state: userId + provider + nonce
    const nonce = crypto.randomUUID();
    const state = btoa(JSON.stringify({ u: userId, p: provider, n: nonce, t: Date.now() }));

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: cfg.responseType ?? "code",
      scope: cfg.scopes,
      redirect_uri: redirectUri,
      state,
      ...(cfg.extraParams ?? {}),
    });

    return json({ url: `${cfg.authUrl}?${params.toString()}`, state });
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
