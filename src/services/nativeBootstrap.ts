/**
 * Native Bootstrap
 * 
 * Single entry point for all native service initialization.
 * Called once from app root. No-ops on web.
 */

import { isNative } from '@/lib/platform';
import { initializeNativeChrome } from './nativeChromeService';
import { initializeNativeKeyboard } from './nativeKeyboardService';
import { initializeNativeApp } from './nativeAppService';
import { initializeNativePush } from './nativePushService';

let bootstrapped = false;

export async function bootstrapNative(): Promise<void> {
  if (!isNative() || bootstrapped) return;
  bootstrapped = true;

  console.log('[NativeBootstrap] Initializing native services...');
  
  await Promise.all([
    initializeNativeChrome(),
    initializeNativeKeyboard(),
    initializeNativeApp(),
    initializeNativePush(),
  ]);

  console.log('[NativeBootstrap] Native services ready');
}
