import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "https://esm.sh/@pushforge/builder@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: require service-role or admin caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if caller is using service role key (internal call) or is an admin user
    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === supabaseServiceKey;

    if (!isServiceRole) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Verify admin role
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: roleData } = await adminClient
        .from("user_roles").select("role").eq("user_id", claimsData.claims.sub).eq("role", "admin").maybeSingle();
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, userIds, title, body, type, data } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target user IDs
    const targetUserIds = userId ? [userId] : userIds;
    
    if (!targetUserIds || targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No target users specified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check notification preferences for each user
    const notificationType = type || 'general';

    // Get users who have notifications enabled
    const { data: privacySettings } = await supabaseAdmin
      .from('privacy_settings')
      .select('user_id, notifications_goals, notifications_social, notifications_nudges')
      .in('user_id', targetUserIds);

    const enabledUserIds = targetUserIds.filter((uid: string) => {
      const settings = privacySettings?.find(s => s.user_id === uid);
      if (!settings) return true; // Default to enabled if no settings
      
      if (notificationType === 'goal' || notificationType === 'task') {
        return settings.notifications_goals !== false;
      } else if (notificationType === 'social' || notificationType === 'reaction' || notificationType === 'comment') {
        return settings.notifications_social !== false;
      }
      return settings.notifications_nudges !== false;
    });

    if (enabledUserIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with notifications enabled", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for enabled users
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', enabledUserIds);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No push subscriptions found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get VAPID keys from environment
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    
    if (!vapidPrivateKey || !vapidPublicKey) {
      console.error("VAPID keys not configured");
      // Fall back to logging only if keys not configured
      console.log(`Would send ${subscriptions.length} push notifications:`, { title, body });
      return new Response(
        JSON.stringify({ message: "VAPID keys not configured - notifications logged only", sent: 0, logged: subscriptions.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: PushPayload = {
      title,
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: `lifestack-${notificationType}`,
      data: {
        ...data,
        type: notificationType,
        url: data?.url || "/home"
      }
    };

    // Send to all subscriptions using Web Push
    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Build the push subscription object for pushforge
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          }
        };

        // Build the HTTP request using pushforge
        const { endpoint, headers, body: requestBody } = await buildPushHTTPRequest({
          privateJWK: vapidPrivateKey,
          subscription,
          message: {
            payload: JSON.parse(JSON.stringify(payload)),
            adminContact: "mailto:support@lifestack.app"
          }
        });

        // Send the push notification
        const pushResponse = await fetch(endpoint, {
          method: "POST",
          headers,
          body: requestBody,
        });

        if (pushResponse.ok || pushResponse.status === 201) {
          console.log(`Push sent successfully`);
          sent++;
        } else {
          const errorText = await pushResponse.text();
          console.error(`Push failed for user ${sub.user_id}:`, pushResponse.status, errorText);
          
          // If subscription is invalid (410 Gone or 404), remove it
          if (pushResponse.status === 410 || pushResponse.status === 404) {
            failedEndpoints.push(sub.endpoint);
          }
          failed++;
        }
      } catch (error) {
        console.error(`Failed to send push to user ${sub.user_id}:`, error);
        failed++;
      }
    }

    // Clean up invalid subscriptions
    if (failedEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
      console.log(`Cleaned up ${failedEndpoints.length} invalid subscriptions`);
    }

    console.log(`Push notifications: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ message: "Push notifications processed", sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send push error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send push notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
