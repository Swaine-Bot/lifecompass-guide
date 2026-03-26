/**
 * LifeStack Haptic Engine v4
 * 
 * Re-exports from the native haptics adapter which handles
 * both Capacitor native haptics and web vibration fallback.
 */

export { triggerHaptic } from '@/services/nativeHapticsAdapter';
export type { HapticEvent } from '@/services/nativeHapticsAdapter';
