import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { wearableService } from '@/services/wearables/wearableService';
import type { WearableConnection, WearableProvider, DailyActivitySummary, WearableNotificationPrefs } from '@/services/wearables/types';
import { toast } from 'sonner';

export function useWearables() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [todaySteps, setTodaySteps] = useState<{ steps: number; provider: WearableProvider | null }>({ steps: 0, provider: null });
  const [todayActivity, setTodayActivity] = useState<DailyActivitySummary | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<WearableNotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [conns, steps, activity, prefs] = await Promise.all([
        wearableService.getConnections(user.id),
        wearableService.getTodaySteps(user.id),
        wearableService.getDailyActivity(user.id, new Date().toISOString().split('T')[0]),
        wearableService.getNotificationPrefs(user.id),
      ]);
      setConnections(conns);
      setTodaySteps(steps);
      setTodayActivity(activity);
      setNotifPrefs(prefs);
    } catch (e) {
      console.error('Failed to load wearable data:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const connect = async (provider: WearableProvider) => {
    if (!user) return;
    try {
      await wearableService.connectProvider(user.id, provider);
      toast.success(`${provider.replace('_', ' ')} connected`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to connect');
    }
  };

  const disconnect = async (provider: WearableProvider) => {
    if (!user) return;
    try {
      await wearableService.disconnectProvider(user.id, provider);
      toast.success('Device disconnected');
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to disconnect');
    }
  };

  const logManualSteps = async (steps: number) => {
    if (!user) return;
    try {
      await wearableService.logManualSteps(user.id, steps);
      toast.success(`${steps.toLocaleString()} steps logged`);
      await refresh();
    } catch (e: any) {
      toast.error('Failed to log steps');
    }
  };

  const updateNotifPrefs = async (updates: Partial<WearableNotificationPrefs>) => {
    if (!user) return;
    try {
      await wearableService.updateNotificationPrefs(user.id, updates);
      setNotifPrefs(prev => prev ? { ...prev, ...updates } : null);
    } catch (e: any) {
      toast.error('Failed to update preferences');
    }
  };

  const hasConnectedDevice = connections.some(c => c.connection_status === 'connected');

  return {
    connections,
    todaySteps,
    todayActivity,
    notifPrefs,
    loading,
    hasConnectedDevice,
    connect,
    disconnect,
    logManualSteps,
    updateNotifPrefs,
    refresh,
  };
}
