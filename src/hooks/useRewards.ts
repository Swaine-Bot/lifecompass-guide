/**
 * useRewards — subscribe to the user's point balance and award points.
 * Lightweight; auto-refetches after each award.
 */
import { useCallback, useEffect, useState } from 'react';
import { rewardsService, type RewardBalance, type RewardEvent } from '@/services/rewards/rewardsService';
import { useAuth } from '@/contexts/AuthContext';

export function useRewards() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<RewardBalance>({ balance: 0, earned_today: 0, earned_week: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const b = await rewardsService.getBalance();
      setBalance(b);
    } catch (e) {
      console.warn('[useRewards] refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const award = useCallback(async (
    eventType: RewardEvent,
    sourceId?: string,
    metadata?: Record<string, unknown>,
  ) => {
    const result = await rewardsService.award(eventType, sourceId, metadata);
    if (result.awarded > 0) {
      setBalance(b => ({ ...b, balance: result.balance, earned_today: b.earned_today + result.awarded, earned_week: b.earned_week + result.awarded }));
    }
    return result;
  }, []);

  return { balance, loading, refresh, award };
}
