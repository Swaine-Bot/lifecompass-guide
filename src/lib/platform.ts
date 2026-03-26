/**
 * LifeStack Platform Abstraction Layer
 * 
 * Single source of truth for runtime environment detection.
 * All native-vs-web branching flows through this module.
 */

import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isWeb(): boolean {
  return !Capacitor.isNativePlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
