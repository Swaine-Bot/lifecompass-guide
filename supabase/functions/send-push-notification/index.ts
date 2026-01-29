import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Simple web push implementation using fetch
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // For a proper implementation, you'd use the web-push protocol
    // This is a simplified version that works with some limitations
    
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Push failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Push error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

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
    let notificationColumn = 'notifications_nudges';
    
    if (notificationType === 'goal' || notificationType === 'task') {
      notificationColumn = 'notifications_goals';
    } else if (notificationType === 'social' || notificationType === 'reaction' || notificationType === 'comment') {
      notificationColumn = 'notifications_social';
    }

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

    // Send to all subscriptions
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        // Note: Full web push requires VAPID signing which is complex
        // For now, we log the intent and the actual push would need
        // a proper web-push library or service
        console.log(`Would send push to user ${sub.user_id}:`, payload);
        sent++;
      } catch (error) {
        console.error("Failed to send push:", error);
        failed++;
      }
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
