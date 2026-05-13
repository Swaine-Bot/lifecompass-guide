import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Authoritative daily streak ping.
 *
 * Fires once per authenticated mount AND whenever the app returns from
 * background / regains focus, in case the user crossed midnight while
 * the app was open. Sends the user's local calendar date so the server
 * computes the streak in their timezone, not server UTC.
 */
export function useDailyStreakPing() {
  const { user } = useAuth();
  const lastPingedDateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const localDate = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const ping = async () => {
      const today = localDate();
      if (lastPingedDateRef.current === today) return;
      lastPingedDateRef.current = today;
      const { data, error } = await supabase.rpc('record_daily_activity', { _local_date: today });
      if (error) {
        console.error('[streak-ping] error', error);
        lastPingedDateRef.current = null; // allow retry
        return;
      }
      const r: any = Array.isArray(data) ? data[0] : data;
      console.debug('[streak-ping]', { today, result: r });
      if (r?.changed) {
        window.dispatchEvent(new CustomEvent('streak-updated', { detail: r }));
      }
    };

    ping();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', ping);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', ping);
    };
  }, [user]);
}
