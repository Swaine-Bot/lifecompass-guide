/**
 * Native Push Notification Service
 * 
 * On native: uses @capacitor/push-notifications for FCM/APNs.
 * On web: defers to existing service worker push flow.
 * 
 * Phase 2: syncs native device token to backend push_subscriptions table.
 */

import { isNative } from '@/lib/platform';
import { getPlatform } from '@/lib/platform';
import { supportsNativePush } from '@/lib/nativeCapabilities';
import { supabase } from '@/integrations/supabase/client';
import { handleDeepLink } from './nativeDeepLinkRouter';

export interface NativePushState {
  isNativeRuntime: boolean;
  registered: boolean;
  token: string | null;
}

let nativeState: NativePushState = {
  isNativeRuntime: false,
  registered: false,
  token: null,
};

export function getNativePushState(): NativePushState {
  return { ...nativeState };
}

/**
 * Sync native push token to backend.
 * Uses the existing push_subscriptions table, storing platform info
 * in p256dh (reused as platform identifier) and auth (reused as token type).
 */
async function syncTokenToBackend(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[NativePush] No authenticated user, deferring token sync');
      return;
    }

    const platform = getPlatform(); // 'ios' | 'android'
    // Use a stable endpoint identifier for native tokens to avoid duplicates
    const endpoint = `native://${platform}/${user.id}`;

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint,
      p256dh: `native_${platform}`,   // Platform identifier
      auth: token,                      // The actual FCM/APNs token
    }, {
      onConflict: 'user_id,endpoint',
    });

    if (error) {
      console.error('[NativePush] Token sync failed:', error);
    } else {
      console.log('[NativePush] Token synced to backend');
    }
  } catch (e) {
    console.error('[NativePush] Token sync error:', e);
  }
}

/**
 * Remove native push token from backend.
 */
export async function removeNativeToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const platform = getPlatform();
    const endpoint = `native://${platform}/${user.id}`;

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    nativeState.registered = false;
    nativeState.token = null;
    console.log('[NativePush] Token removed from backend');
  } catch (e) {
    console.error('[NativePush] Token removal error:', e);
  }
}

/**
 * Initialize native push notifications.
 * Call once at app startup. No-ops on web.
 */
/**
 * Check whether Android push registration should proceed.
 * Returns false when Firebase is not configured (no google-services.json wired)
 * so that PushNotifications.register() is never called prematurely.
 */
function isAndroidPushEnabled(): boolean {
  // Explicit build-time opt-in flag. Default: disabled on Android to prevent
  // "Default FirebaseApp is not initialized" fatal crash.
  const flag = (import.meta as any).env?.VITE_ENABLE_NATIVE_PUSH_ANDROID;
  return flag === 'true' || flag === true;
}

/**
 * Initialize native push notifications.
 * Call once at app startup. No-ops on web.
 * On Android, skips registration entirely unless Firebase is confirmed configured.
 */
export async function initializeNativePush(): Promise<void> {
  if (!supportsNativePush()) return;
  nativeState.isNativeRuntime = true;

  const platform = getPlatform();

  // Guard: on Android, skip push entirely unless Firebase is wired
  if (platform === 'android' && !isAndroidPushEnabled()) {
    console.log('[NativePush] Skipping Android registration: Firebase not configured (set VITE_ENABLE_NATIVE_PUSH_ANDROID=true to enable)');
    return;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Request permission
    let permResult: { receive: string };
    try {
      permResult = await PushNotifications.requestPermissions();
    } catch (permErr) {
      console.warn(`[NativePush] requestPermissions failed (non-fatal): ${permErr instanceof Error ? permErr.message : JSON.stringify(permErr)}`);
      return;
    }

    if (permResult.receive !== 'granted') {
      console.log('[NativePush] Permission not granted');
      return;
    }

    // Register for push — the step that requires Firebase on Android
    try {
      await PushNotifications.register();
    } catch (regErr) {
      console.warn(`[NativePush] register() failed (non-fatal): ${regErr instanceof Error ? regErr.message : JSON.stringify(regErr)}`);
      return;
    }

    // Listen for registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('[NativePush] Token received');
      nativeState.token = token.value;
      nativeState.registered = true;
      await syncTokenToBackend(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[NativePush] Registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[NativePush] Notification received:', notification.title);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[NativePush] Action performed:', action.actionId);
      const url = action.notification?.data?.url;
      if (url && typeof url === 'string') {
        handleDeepLink(url);
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : JSON.stringify(e, null, 2);
    console.warn(`[NativePush] Init failed (non-fatal):\n${msg}`);
  }
}

/**
 * Check if we should skip web push registration.
 * Returns true when running natively (web push should not be used).
 */
export function shouldSkipWebPush(): boolean {
  return isNative();
}
