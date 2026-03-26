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

export function onKeyboardChange(listener: KeyboardListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function initializeNativeKeyboard(): Promise<void> {
  if (!supportsNativeKeyboard() || initialized) return;
  initialized = true;

  try {
    const { Keyboard } = await import('@capacitor/keyboard');

    await Keyboard.setAccessoryBarVisible({ isVisible: true });
    await Keyboard.setScroll({ isDisabled: false });

    Keyboard.addListener('keyboardWillShow', (info) => {
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      listeners.forEach(fn => fn({ keyboardHeight: info.keyboardHeight }));
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      listeners.forEach(fn => fn({ keyboardHeight: 0 }));
    });
  } catch (e) {
    console.warn('[NativeKeyboard] Init failed:', e);
  }
}
