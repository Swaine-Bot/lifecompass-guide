/**
 * Native Keyboard Service
 * 
 * Manages keyboard events on native platforms to prevent
 * fixed input surfaces from being obscured.
 */

import { supportsNativeKeyboard } from '@/lib/nativeCapabilities';

type KeyboardListener = (info: { keyboardHeight: number }) => void;

const listeners = new Set<KeyboardListener>();
let initialized = false;
let currentKeyboardHeight = 0;
let keyboardModulePromise: Promise<typeof import('@capacitor/keyboard') | null> | null = null;

function emitKeyboardHeight(keyboardHeight: number) {
  if (keyboardHeight === currentKeyboardHeight) return;

  currentKeyboardHeight = keyboardHeight;
  document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
  listeners.forEach(fn => fn({ keyboardHeight }));
}

function getVisualViewportKeyboardHeight(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0;

  const viewport = window.visualViewport;
  const inferredHeight = Math.round(window.innerHeight - viewport.height - viewport.offsetTop);

  return inferredHeight > 120 ? inferredHeight : 0;
}

function initializeViewportFallback() {
  if (typeof window === 'undefined' || !window.visualViewport) return;

  const updateFromViewport = () => emitKeyboardHeight(getVisualViewportKeyboardHeight());

  updateFromViewport();
  window.visualViewport.addEventListener('resize', updateFromViewport);
  window.visualViewport.addEventListener('scroll', updateFromViewport);
  window.addEventListener('orientationchange', updateFromViewport);
}

async function getKeyboardModule() {
  if (!supportsNativeKeyboard()) return null;

  keyboardModulePromise ??= import('@capacitor/keyboard').catch(() => null);
  return keyboardModulePromise;
}

export function onKeyboardChange(listener: KeyboardListener): () => void {
  listeners.add(listener);
  listener({ keyboardHeight: currentKeyboardHeight });
  return () => listeners.delete(listener);
}

export async function initializeNativeKeyboard(): Promise<void> {
  if (initialized) return;
  initialized = true;

  emitKeyboardHeight(0);
  initializeViewportFallback();

  if (!supportsNativeKeyboard()) return;

  const keyboardModule = await getKeyboardModule();
  const Keyboard = keyboardModule?.Keyboard;
  if (!Keyboard) {
    console.warn('[NativeKeyboard] Plugin not available — using viewport fallback only');
    return;
  }

  // Each API call is independently guarded — partial support (Android) must not fail init
  try { await Keyboard.setAccessoryBarVisible({ isVisible: true }); }
  catch (e) { console.warn('[NativeKeyboard] setAccessoryBarVisible not supported:', (e as Error)?.message ?? e); }

  try { await Keyboard.setScroll({ isDisabled: false }); }
  catch (e) { console.warn('[NativeKeyboard] setScroll not supported:', (e as Error)?.message ?? e); }

  try {
    Keyboard.addListener('keyboardWillShow', (info) => emitKeyboardHeight(info.keyboardHeight));
    Keyboard.addListener('keyboardDidShow', (info) => emitKeyboardHeight(info.keyboardHeight));
    Keyboard.addListener('keyboardWillHide', () => emitKeyboardHeight(0));
    Keyboard.addListener('keyboardDidHide', () => emitKeyboardHeight(0));
  } catch (e) { console.warn('[NativeKeyboard] Listener attach failed:', (e as Error)?.message ?? e); }
}

export async function setKeyboardAccessoryBarVisible(isVisible: boolean): Promise<void> {
  try {
    const keyboardModule = await getKeyboardModule();
    const Keyboard = keyboardModule?.Keyboard;
    if (!Keyboard) return;

    await Keyboard.setAccessoryBarVisible({ isVisible });
  } catch (e) {
    console.warn('[NativeKeyboard] Accessory bar update failed:', e);
  }
}
