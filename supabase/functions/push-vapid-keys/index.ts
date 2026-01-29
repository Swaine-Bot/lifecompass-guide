import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  // Convert to base64url
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return { publicKey, privateKey };
}

// Store keys in a simple config table or environment
let cachedPublicKey: string | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // For this demo, we'll generate deterministic keys based on a secret
    // In production, you'd store these securely
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    
    if (VAPID_PUBLIC_KEY) {
      // Use configured keys
      return new Response(
        JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new keys if not configured
    // Note: In production, these should be persisted
    if (!cachedPublicKey) {
      const keys = await generateVAPIDKeys();
      cachedPublicKey = keys.publicKey;
      console.log("Generated VAPID public key:", cachedPublicKey);
    }

    return new Response(
      JSON.stringify({ publicKey: cachedPublicKey }),
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
