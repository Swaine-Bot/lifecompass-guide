/**
 * Native App Chrome Service
 * 
 * Configures status bar and app chrome for native platforms.
 * No-ops on web.
 */

import { supportsNativeStatusBar } from '@/lib/nativeCapabilities';

export async function initializeNativeChrome(): Promise<void> {
  if (!supportsNativeStatusBar()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch (e) {
    console.warn('[NativeChrome] Status bar init failed:', e);
  }
}
