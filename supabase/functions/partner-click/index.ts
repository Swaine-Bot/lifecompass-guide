import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // GET /partner-click?t=TRACKING_TOKEN — redirect mode
  if (req.method === "GET") {
    const token = url.searchParams.get("t");
    if (!token) {
      return new Response("Missing tracking token", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up the share event by tracking token
    const { data: shareEvent } = await supabase
      .from("partner_share_events")
      .select("id, partner_id, partner_asset_id, campaign_name, platform, destination_url")
      .eq("tracking_token", token)
      .single();

    if (!shareEvent || !shareEvent.destination_url) {
      return new Response("Link not found", { status: 404, headers: corsHeaders });
    }

    // Log the click (fire and forget)
    const userAgent = req.headers.get("user-agent") || "";
    supabase
      .from("partner_click_events")
      .insert({
        share_event_id: shareEvent.id,
        partner_id: shareEvent.partner_id,
        partner_asset_id: shareEvent.partner_asset_id,
        campaign_name: shareEvent.campaign_name,
        platform: shareEvent.platform,
        user_agent: userAgent.slice(0, 500),
        destination_url: shareEvent.destination_url,
      })
      .then(() => {});

    // Redirect to the destination
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: shareEvent.destination_url,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
