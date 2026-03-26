/**
 * Native App Lifecycle Service
 * 
 * Handles app state changes, resume/pause, and deep link entry points.
 * No-ops on web.
 */

import { isNative } from '@/lib/platform';
import { handleDeepLink } from './nativeDeepLinkRouter';

type AppStateHandler = (isActive: boolean) => void;

let appStateHandler: AppStateHandler | null = null;

export function setAppStateHandler(handler: AppStateHandler): void {
  appStateHandler = handler;
}

export async function initializeNativeApp(): Promise<void> {
  if (!isNative()) return;

  try {
    const { App } = await import('@capacitor/app');

    // Deep links / URL opens → route through deep link router
    App.addListener('appUrlOpen', (event) => {
      handleDeepLink(event.url);
    });

    // App state (foreground/background)
    App.addListener('appStateChange', (state) => {
      console.log('[NativeApp] State change:', state.isActive ? 'active' : 'background');
      if (appStateHandler) {
        appStateHandler(state.isActive);
      }
    });

    // Back button (Android) — respect router history
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // At root, minimize app instead of exiting
        App.minimizeApp();
      }
    });
  } catch (e) {
    console.warn('[NativeApp] Init failed:', e);
  }
}
