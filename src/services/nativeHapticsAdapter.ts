/**
 * Native Haptics Adapter
 * 
 * Routes haptic feedback through Capacitor Haptics on native,
 * falls back to navigator.vibrate on web.
 * 
 * Preserves the existing LifeStack haptic event taxonomy and debounce logic.
 */

import { supportsNativeHaptics } from '@/lib/nativeCapabilities';

export type HapticEvent =
  | 'completion'
  | 'reward'
  | 'mentor_presence'
  | 'warning'
  | 'insight'
  | 'confirmation'
  | 'navigation'
  | 'arrival';

interface HapticSpec {
  vibrationPattern: number[];
  debounceMs: number;
  /** Capacitor ImpactStyle or NotificationType */
  nativeType: 'impact_light' | 'impact_medium' | 'impact_heavy' | 'notification_success' | 'notification_warning' | 'notification_error' | 'selection';
}

const HAPTIC_SPECS: Record<HapticEvent, HapticSpec> = {
  arrival:         { vibrationPattern: [0, 6],                   debounceMs: 2000, nativeType: 'impact_light' },
  completion:      { vibrationPattern: [0, 15],                  debounceMs: 200,  nativeType: 'impact_medium' },
  reward:          { vibrationPattern: [0, 12, 50, 12, 50, 20], debounceMs: 400,  nativeType: 'notification_success' },
  mentor_presence: { vibrationPattern: [0, 6],                   debounceMs: 800,  nativeType: 'impact_light' },
  warning:         { vibrationPattern: [0, 30, 80, 30],          debounceMs: 1000, nativeType: 'notification_warning' },
  insight:         { vibrationPattern: [0, 8, 40, 8],            debounceMs: 500,  nativeType: 'impact_medium' },
  confirmation:    { vibrationPattern: [0, 12],                  debounceMs: 300,  nativeType: 'notification_success' },
  navigation:      { vibrationPattern: [0, 4],                   debounceMs: 150,  nativeType: 'selection' },
};

const lastFired: Partial<Record<HapticEvent, number>> = {};

function shouldDebounce(event: HapticEvent, spec: HapticSpec): boolean {
  const now = Date.now();
  const last = lastFired[event];
  if (last && now - last < spec.debounceMs) return true;
  lastFired[event] = now;
  return false;
}

export function triggerHaptic(event: HapticEvent, enabled: boolean = true): void {
  if (!enabled) return;
  const spec = HAPTIC_SPECS[event];
  if (!spec || shouldDebounce(event, spec)) return;

  if (supportsNativeHaptics()) {
    fireNativeHaptic(spec.nativeType);
  } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(spec.vibrationPattern);
  }
}

async function fireNativeHaptic(type: HapticSpec['nativeType']): Promise<void> {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    
    switch (type) {
      case 'impact_light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'impact_medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'impact_heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'notification_success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'notification_warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'notification_error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      case 'selection':
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
        break;
    }
  } catch (e) {
    // Silent fail — haptics are non-critical
  }
}
