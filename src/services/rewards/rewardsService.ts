/**
 * Rewards engine client — reads balance and awards points for in-app events.
 *
 * Points are server-side-enforced (per-day caps) via the `award_reward` RPC.
 * Failures are non-fatal: callers should never block the user flow.
 */
import { supabase } from '@/integrations/supabase/client';

export type RewardEvent =
  | 'habit_completed'
  | 'goal_milestone'
  | 'journal_entry'
  | 'micro_move_done'
  | 'mentor_session'
  | 'daily_signal_read'
  | 'wearable_sync'
  | 'momentum_streak_7'
  | 'momentum_streak_30';

export interface RewardBalance {
  balance: number;
  earned_today: number;
  earned_week: number;
}

export interface RewardAwardResult {
  awarded: number;
  daily_remaining: number;
  balance: number;
}

export const rewardsService = {
  async getBalance(): Promise<RewardBalance> {
    const { data, error } = await supabase.rpc('get_my_reward_balance' as any);
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      balance: row?.balance ?? 0,
      earned_today: row?.earned_today ?? 0,
      earned_week: row?.earned_week ?? 0,
    };
  },

  async award(eventType: RewardEvent, sourceId?: string, metadata: Record<string, unknown> = {}): Promise<RewardAwardResult> {
    try {
      const { data, error } = await supabase.rpc('award_reward' as any, {
        _event_type: eventType,
        _source_id: sourceId ?? null,
        _metadata: metadata as any,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        awarded: row?.awarded ?? 0,
        daily_remaining: row?.daily_remaining ?? 0,
        balance: row?.balance ?? 0,
      };
    } catch (e) {
      // Non-fatal: never block user flows on rewards.
      console.warn('[rewards] award failed', eventType, e);
      return { awarded: 0, daily_remaining: 0, balance: 0 };
    }
  },

  async listLedger(limit = 50) {
    const { data, error } = await supabase
      .from('reward_ledger' as any)
      .select('id, event_type, points, source_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200));
    if (error) throw error;
    return data ?? [];
  },
};
