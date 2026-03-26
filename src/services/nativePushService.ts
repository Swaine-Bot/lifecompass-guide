/**
 * Native Push Notification Service
 * 
 * On native: uses @capacitor/push-notifications for FCM/APNs.
 * On web: defers to existing service worker push flow.
 */

import { isNative } from '@/lib/platform';
import { supportsNativePush } from '@/lib/nativeCapabilities';

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
 * Initialize native push notifications.
 * Call once at app startup. No-ops on web.
 */
export async function initializeNativePush(): Promise<void> {
  if (!supportsNativePush()) return;
  nativeState.isNativeRuntime = true;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('[NativePush] Permission not granted');
      return;
    }

    // Register for push
    await PushNotifications.register();

    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('[NativePush] Token received:', token.value.substring(0, 20) + '...');
      nativeState.token = token.value;
      nativeState.registered = true;
      // TODO Phase 2: sync token to backend
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[NativePush] Registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[NativePush] Notification received:', notification.title);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[NativePush] Action performed:', action.actionId);
      // TODO Phase 2: route to appropriate screen
    });
  } catch (e) {
    console.warn('[NativePush] Init failed:', e);
  }
}

/**
 * Check if we should skip web push registration.
 * Returns true when running natively (web push should not be used).
 */
export function shouldSkipWebPush(): boolean {
  return isNative();
}
