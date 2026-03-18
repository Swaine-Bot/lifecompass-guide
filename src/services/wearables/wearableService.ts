import { supabase } from '@/integrations/supabase/client';
import type { WearableConnection, WearableMetric, WearableNotificationPrefs, WearableProvider, DailyActivitySummary } from './types';

const defaultNotifPrefs: WearableNotificationPrefs = {
  step_reminders: true,
  step_milestones: true,
  inactivity_nudges: true,
  streak_alerts: true,
  weekly_summary: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export const wearableService = {
  // ── Connections ──
  async getConnections(userId: string): Promise<WearableConnection[]> {
    const { data, error } = await supabase
      .from('wearable_connections' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as WearableConnection[];
  },

  async getConnection(userId: string, provider: WearableProvider): Promise<WearableConnection | null> {
    const { data } = await supabase
      .from('wearable_connections' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
    return data as unknown as WearableConnection | null;
  },

  async connectProvider(userId: string, provider: WearableProvider, externalId?: string): Promise<void> {
    const { error } = await supabase.from('wearable_connections' as any).upsert({
      user_id: userId,
      provider,
      connection_status: 'connected',
      external_account_id: externalId || null,
      last_sync_status: 'never',
      permissions_granted: ['steps', 'distance', 'active_calories'],
    }, { onConflict: 'user_id,provider' });
    if (error) throw error;
  },

  async disconnectProvider(userId: string, provider: WearableProvider): Promise<void> {
    const { error } = await supabase
      .from('wearable_connections' as any)
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);
    if (error) throw error;
  },

  async updateSyncStatus(userId: string, provider: WearableProvider, status: string): Promise<void> {
    const { error } = await supabase
      .from('wearable_connections' as any)
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: status,
      })
      .eq('user_id', userId)
      .eq('provider', provider);
    if (error) throw error;
  },

  // ── Metrics ──
  async upsertMetric(metric: Omit<WearableMetric, 'id'>): Promise<void> {
    const { error } = await supabase.from('wearable_metrics' as any).upsert({
      user_id: metric.user_id,
      provider: metric.provider,
      metric_type: metric.metric_type,
      metric_value: metric.metric_value,
      unit: metric.unit,
      source_timestamp: metric.source_timestamp,
      local_date: metric.local_date,
      sync_batch_id: metric.sync_batch_id || null,
    }, { onConflict: 'user_id,provider,metric_type,local_date' });
    if (error) throw error;
  },

  async getTodaySteps(userId: string): Promise<{ steps: number; provider: WearableProvider | null }> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('wearable_metrics' as any)
      .select('metric_value, provider')
      .eq('user_id', userId)
      .eq('metric_type', 'steps')
      .eq('local_date', today)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return { steps: Number((data as any).metric_value), provider: (data as any).provider };
    }
    return { steps: 0, provider: null };
  },

  async getDailyActivity(userId: string, date: string): Promise<DailyActivitySummary | null> {
    const { data } = await supabase
      .from('wearable_metrics' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('local_date', date);

    if (!data || (data as any[]).length === 0) return null;

    const metrics = data as any[];
    const stepsRow = metrics.find(m => m.metric_type === 'steps');
    const distanceRow = metrics.find(m => m.metric_type === 'distance');
    const caloriesRow = metrics.find(m => m.metric_type === 'active_calories');

    return {
      date,
      steps: stepsRow ? Number(stepsRow.metric_value) : 0,
      distance_km: distanceRow ? Number(distanceRow.metric_value) : 0,
      active_calories: caloriesRow ? Number(caloriesRow.metric_value) : 0,
      provider: stepsRow?.provider || metrics[0]?.provider,
      synced_at: stepsRow?.updated_at,
    };
  },

  async getWeeklySteps(userId: string): Promise<{ date: string; steps: number }[]> {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const { data } = await supabase
      .from('wearable_metrics' as any)
      .select('local_date, metric_value')
      .eq('user_id', userId)
      .eq('metric_type', 'steps')
      .in('local_date', dates)
      .order('local_date', { ascending: true });

    const map = new Map((data as any[] || []).map(d => [d.local_date, Number(d.metric_value)]));
    return dates.map(date => ({ date, steps: map.get(date) || 0 }));
  },

  // ── Notification Preferences ──
  async getNotificationPrefs(userId: string): Promise<WearableNotificationPrefs> {
    const { data } = await supabase
      .from('wearable_notification_prefs' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      return {
        step_reminders: (data as any).step_reminders ?? defaultNotifPrefs.step_reminders,
        step_milestones: (data as any).step_milestones ?? defaultNotifPrefs.step_milestones,
        inactivity_nudges: (data as any).inactivity_nudges ?? defaultNotifPrefs.inactivity_nudges,
        streak_alerts: (data as any).streak_alerts ?? defaultNotifPrefs.streak_alerts,
        weekly_summary: (data as any).weekly_summary ?? defaultNotifPrefs.weekly_summary,
        quiet_hours_start: (data as any).quiet_hours_start ?? defaultNotifPrefs.quiet_hours_start,
        quiet_hours_end: (data as any).quiet_hours_end ?? defaultNotifPrefs.quiet_hours_end,
      };
    }

    // Lazy create
    await supabase.from('wearable_notification_prefs' as any).upsert(
      { user_id: userId, ...defaultNotifPrefs },
      { onConflict: 'user_id' }
    );
    return { ...defaultNotifPrefs };
  },

  async updateNotificationPrefs(userId: string, updates: Partial<WearableNotificationPrefs>): Promise<void> {
    const { error } = await supabase
      .from('wearable_notification_prefs' as any)
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' });
    if (error) throw error;
  },

  // ── Manual Step Entry (fallback for when no wearable is connected) ──
  async logManualSteps(userId: string, steps: number, date?: string): Promise<void> {
    const localDate = date || new Date().toISOString().split('T')[0];
    await this.upsertMetric({
      user_id: userId,
      provider: 'health_connect' as WearableProvider, // treat manual as generic
      metric_type: 'steps',
      metric_value: steps,
      unit: 'count',
      source_timestamp: new Date().toISOString(),
      local_date: localDate,
    });
  },
};
