// Wearable Provider Types & Unified Data Model

export type WearableProvider = 
  | 'apple_health'
  | 'garmin'
  | 'samsung_health'
  | 'huawei_health'
  | 'health_connect'
  | 'fitbit'
  | 'wear_os';

export type MetricType = 
  | 'steps'
  | 'distance'
  | 'active_calories'
  | 'heart_rate'
  | 'sleep_duration'
  | 'workouts'
  | 'standing_hours';

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';
export type SyncStatus = 'never' | 'syncing' | 'success' | 'failed';

export interface WearableProviderInfo {
  id: WearableProvider;
  name: string;
  icon: string; // emoji or icon key
  color: string; // HSL token reference
  supportedMetrics: MetricType[];
  authType: 'oauth' | 'native_sdk' | 'health_connect';
  platformSupport: ('web' | 'ios' | 'android')[];
  status: 'available' | 'coming_soon' | 'native_only';
  description: string;
}

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  connection_status: ConnectionStatus;
  permissions_granted: MetricType[];
  external_account_id?: string;
  last_sync_at?: string;
  last_sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface WearableMetric {
  id: string;
  user_id: string;
  provider: WearableProvider;
  metric_type: MetricType;
  metric_value: number;
  unit: string;
  source_timestamp: string;
  local_date: string;
  sync_batch_id?: string;
}

export interface WearableNotificationPrefs {
  step_reminders: boolean;
  step_milestones: boolean;
  inactivity_nudges: boolean;
  streak_alerts: boolean;
  weekly_summary: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface DailyActivitySummary {
  date: string;
  steps: number;
  distance_km: number;
  active_calories: number;
  provider: WearableProvider;
  synced_at?: string;
}

// Provider registry
export const WEARABLE_PROVIDERS: WearableProviderInfo[] = [
  {
    id: 'apple_health',
    name: 'Apple Health',
    icon: '🍎',
    color: 'hsl(0, 0%, 100%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration', 'workouts', 'standing_hours'],
    authType: 'native_sdk',
    platformSupport: ['ios'],
    status: 'native_only',
    description: 'Sync with Apple Health on iPhone & Apple Watch. Requires the native LifeStack app.',
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    icon: '⌚',
    color: 'hsl(200, 80%, 50%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration', 'workouts'],
    authType: 'oauth',
    platformSupport: ['web', 'ios', 'android'],
    status: 'available',
    description: 'Connect your Garmin watch to sync steps, workouts, heart rate, and sleep data.',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: '💙',
    color: 'hsl(195, 85%, 45%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration', 'workouts'],
    authType: 'oauth',
    platformSupport: ['web', 'ios', 'android'],
    status: 'available',
    description: 'Sync your Fitbit data including steps, sleep, and activity.',
  },
  {
    id: 'health_connect',
    name: 'Health Connect',
    icon: '💚',
    color: 'hsl(145, 65%, 45%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration', 'workouts'],
    authType: 'health_connect',
    platformSupport: ['android'],
    status: 'native_only',
    description: 'Connect via Android Health Connect. Works with Samsung, Pixel, and Wear OS watches.',
  },
  {
    id: 'samsung_health',
    name: 'Samsung Health',
    icon: '🔵',
    color: 'hsl(210, 80%, 55%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration'],
    authType: 'native_sdk',
    platformSupport: ['android'],
    status: 'native_only',
    description: 'Sync Samsung Galaxy Watch data via Health Connect on Android.',
  },
  {
    id: 'huawei_health',
    name: 'Huawei Health',
    icon: '🔴',
    color: 'hsl(0, 75%, 50%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate', 'sleep_duration'],
    authType: 'native_sdk',
    platformSupport: ['android'],
    status: 'coming_soon',
    description: 'Huawei Health integration coming soon.',
  },
  {
    id: 'wear_os',
    name: 'Wear OS',
    icon: '⭕',
    color: 'hsl(30, 80%, 50%)',
    supportedMetrics: ['steps', 'distance', 'active_calories', 'heart_rate'],
    authType: 'health_connect',
    platformSupport: ['android'],
    status: 'native_only',
    description: 'Works with Tag Heuer, Fossil, TicWatch, and other Wear OS devices via Health Connect.',
  },
];

export function getProviderInfo(id: WearableProvider): WearableProviderInfo | undefined {
  return WEARABLE_PROVIDERS.find(p => p.id === id);
}
