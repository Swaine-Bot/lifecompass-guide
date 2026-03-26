import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { shouldSkipWebPush, getNativePushState } from '@/services/nativePushService';

export interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  loading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    return isSupported;
  }, []);

  // Get VAPID public key from edge function
  const getVapidPublicKey = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('push-vapid-keys');
      if (error) throw error;
      return data?.publicKey || null;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      return null;
    }
  };

  // Convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // On native, report native push state instead
    if (shouldSkipWebPush()) {
      const nState = getNativePushState();
      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: nState.registered,
        permission: nState.registered ? 'granted' : 'default',
        loading: false,
      }));
      return;
    }

    if (!checkSupport()) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: !!subscription,
        permission: Notification.permission,
        loading: false,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, checkSupport]);

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to enable notifications');
      return false;
    }

    // On native, push is handled by nativePushService
    if (shouldSkipWebPush()) {
      toast.info('Push notifications are managed by your device settings.');
      return false;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setState(prev => ({ ...prev, loading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        toast.error('Failed to register service worker');
        setState(prev => ({ ...prev, loading: false }));
        return false;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidPublicKey = await getVapidPublicKey();
      if (!vapidPublicKey) {
        toast.error('Failed to get notification keys');
        setState(prev => ({ ...prev, loading: false }));
        return false;
      }

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Extract keys from subscription
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        throw new Error('Failed to get subscription keys');
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      // Save subscription to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) throw error;

      setState(prev => ({ ...prev, isSubscribed: true, loading: false }));
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to enable push notifications');
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!user) return false;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setState(prev => ({ ...prev, isSubscribed: false, loading: false }));
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to disable push notifications');
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  // Toggle subscription
  const toggle = async (): Promise<boolean> => {
    if (state.isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  };

  // Check subscription on mount
  useEffect(() => {
    const isSupported = checkSupport();
    if (isSupported) {
      // Register service worker on load
      registerServiceWorker().then(() => {
        checkSubscription();
      });
    } else {
      setState(prev => ({ ...prev, isSupported: false, loading: false }));
    }
  }, [user, checkSupport, checkSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    toggle,
    checkSubscription,
  };
}
