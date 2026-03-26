/**
 * Native App Lifecycle Service
 * 
 * Handles app state changes, resume/pause, and deep link entry points.
 * No-ops on web.
 */

import { isNative } from '@/lib/platform';

type DeepLinkHandler = (url: string) => void;
type AppStateHandler = (isActive: boolean) => void;

let deepLinkHandler: DeepLinkHandler | null = null;
let appStateHandler: AppStateHandler | null = null;

export function setDeepLinkHandler(handler: DeepLinkHandler): void {
  deepLinkHandler = handler;
}

export function setAppStateHandler(handler: AppStateHandler): void {
  appStateHandler = handler;
}

export async function initializeNativeApp(): Promise<void> {
  if (!isNative()) return;

  try {
    const { App } = await import('@capacitor/app');

    // Deep links / URL opens
    App.addListener('appUrlOpen', (event) => {
      console.log('[NativeApp] URL open:', event.url);
      if (deepLinkHandler) {
        deepLinkHandler(event.url);
      }
    });

    // App state (foreground/background)
    App.addListener('appStateChange', (state) => {
      console.log('[NativeApp] State change:', state.isActive ? 'active' : 'background');
      if (appStateHandler) {
        appStateHandler(state.isActive);
      }
    });

    // Back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      }
    });
  } catch (e) {
    console.warn('[NativeApp] Init failed:', e);
  }
}
