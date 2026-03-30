/**
 * Native Bootstrap
 * 
 * Single entry point for all native service initialization.
 * Called once from app root. No-ops on web.
 * 
 * CRITICAL: No native service failure may abort app launch.
 * Every initializer is independently guarded.
 */

import { isNative } from '@/lib/platform';
import { initializeNativeChrome } from './nativeChromeService';
import { initializeNativeKeyboard } from './nativeKeyboardService';
import { initializeNativeApp } from './nativeAppService';
import { initializeNativePush } from './nativePushService';

let bootstrapped = false;

function formatError(e: unknown): string {
  if (e instanceof Error) return `${e.message}\n${e.stack ?? ''}`;
  try { return JSON.stringify(e, null, 2); } catch { return String(e); }
}

async function safeInit(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`[NativeBootstrap] ${label} — OK`);
  } catch (e) {
    console.warn(`[NativeBootstrap] ${label} — FAILED (non-fatal):\n${formatError(e)}`);
  }
}

export async function bootstrapNative(): Promise<void> {
  if (!isNative() || bootstrapped) return;
  bootstrapped = true;

  console.log('[NativeBootstrap] Initializing native services...');

  const results = await Promise.allSettled([
    safeInit('Chrome', initializeNativeChrome),
    safeInit('Keyboard', initializeNativeKeyboard),
    safeInit('App', initializeNativeApp),
    safeInit('Push', initializeNativePush),
  ]);

  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[NativeBootstrap] Complete — ${results.length - failed}/${results.length} services ready`);
}
