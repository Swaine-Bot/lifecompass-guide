import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SYSTEM/CRON ENDPOINT: This function is designed to be invoked by a scheduled
// cron job or system trigger, not by end users. It uses SUPABASE_SERVICE_ROLE_KEY
// to query across users. No user auth is required — access is controlled by
// the service role key which is only available server-side.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Find journal entries with scheduled playback that are due and haven't been notified
    const now = new Date().toISOString();
    
    const { data: dueEntries, error: fetchError } = await supabaseAdmin
      .from('journal_entries')
      .select('id, user_id, content, tags, scheduled_playback_at')
      .lte('scheduled_playback_at', now)
      .eq('playback_reminder_sent', false)
      .not('scheduled_playback_at', 'is', null);

    if (fetchError) {
      console.error("Error fetching due entries:", fetchError);
      throw fetchError;
    }

    if (!dueEntries || dueEntries.length === 0) {
      console.log("No due journal reminders found");
      return new Response(
        JSON.stringify({ message: "No due reminders", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueEntries.length} due journal reminders`);

    let sent = 0;
    let failed = 0;

    for (const entry of dueEntries) {
      try {
        // Check if entry has media (voice/video)
        const tags = entry.tags as string[] | null;
        const hasMedia = tags && tags.length > 0;
        
        // Determine message type
        let mediaType = "message";
        if (hasMedia) {
          const mediaPath = tags[0].toLowerCase();
          if (mediaPath.includes('.webm') || mediaPath.includes('.mp3') || mediaPath.includes('.wav') || mediaPath.includes('audio')) {
            mediaType = "voice recording";
          } else if (mediaPath.includes('.mp4') || mediaPath.includes('.mov') || mediaPath.includes('video')) {
            mediaType = "video";
          }
        }

        // Get user's push subscriptions
        const { data: subscriptions } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', entry.user_id);

        // Check user's notification preferences
        const { data: privacySettings } = await supabaseAdmin
          .from('privacy_settings')
          .select('notifications_nudges')
          .eq('user_id', entry.user_id)
          .maybeSingle();

        const notificationsEnabled = privacySettings?.notifications_nudges !== false;

        if (subscriptions && subscriptions.length > 0 && notificationsEnabled) {
          // Send push notification via the send-push-notification function
          const pushPayload = {
            userId: entry.user_id,
            title: "📬 Message from your past self",
            body: hasMedia 
              ? `You recorded a ${mediaType} for yourself. Tap to play.`
              : `You left a note for yourself. Tap to read.`,
            type: "nudge",
            data: {
              url: `/journal/playback/${entry.id}`,
              entryId: entry.id,
              autoplay: true
            }
          };

          // Call send-push-notification function
          const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
          const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
          
          const pushResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-push-notification`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify(pushPayload),
            }
          );

          if (pushResponse.ok) {
            console.log(`Push notification sent for entry ${entry.id}`);
          } else {
            console.error(`Failed to send push for entry ${entry.id}:`, await pushResponse.text());
          }
        }

        // Mark as sent regardless of whether push worked (to avoid re-sending)
        const { error: updateError } = await supabaseAdmin
          .from('journal_entries')
          .update({ playback_reminder_sent: true })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`Failed to mark entry ${entry.id} as sent:`, updateError);
          failed++;
        } else {
          sent++;
        }
      } catch (entryError) {
        console.error(`Error processing entry ${entry.id}:`, entryError);
        failed++;
      }
    }

    console.log(`Processed ${sent} reminders, ${failed} failed`);

    return new Response(
      JSON.stringify({ message: "Journal reminders processed", sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check journal reminders error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check journal reminders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
