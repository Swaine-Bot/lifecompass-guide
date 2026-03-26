/**
 * LifeStack Native Capabilities
 * 
 * Feature-detection layer for Capacitor plugin availability.
 * Returns true only when running natively AND the plugin is usable.
 */

import { isNative } from './platform';

export function supportsNativeShare(): boolean {
  return isNative();
}

export function supportsNativeClipboard(): boolean {
  return isNative();
}

export function supportsNativeFilesystem(): boolean {
  return isNative();
}

export function supportsNativePush(): boolean {
  return isNative();
}

export function supportsNativeHaptics(): boolean {
  return isNative();
}

export function supportsNativeKeyboard(): boolean {
  return isNative();
}

export function supportsNativeStatusBar(): boolean {
  return isNative();
}
