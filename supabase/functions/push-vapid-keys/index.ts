import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory cache for generated keys (within a single instance)
let cachedKeys: { publicKey: string; privateKey: string } | null = null;

// Generate VAPID keys using Web Crypto API
async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Convert to base64url for public key
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  // Convert private key to JWK format for pushforge compatibility
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const privateKey = JSON.stringify(privateKeyJwk);

  return { publicKey, privateKey };
}

// PUBLIC-BY-DESIGN: This endpoint is intentionally unauthenticated.
// VAPID public keys must be accessible to any client before push subscription
// can be established. The public key is not sensitive — it is shared with browsers
// as part of the Web Push protocol. No user data is exposed.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check for configured keys first
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    
    if (VAPID_PUBLIC_KEY) {
      // Use configured keys
      return new Response(
        JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate temporary keys if not configured
    // Note: These are ephemeral and will change on function restart
    if (!cachedKeys) {
      cachedKeys = await generateVAPIDKeys();
      console.log("Generated temporary VAPID keys (not persisted)");
      console.log("For reliable push notifications, set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets");
    }

    return new Response(
      JSON.stringify({ 
        publicKey: cachedKeys.publicKey,
        warning: "Using temporary keys - notifications may not work reliably"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("VAPID keys error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get VAPID keys" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
