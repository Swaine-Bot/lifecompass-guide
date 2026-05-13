import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type LifeDomain = 'physical' | 'mind' | 'wealth' | 'relationships' | 'legacy';

interface DomainXP {
  domain: LifeDomain;
  total_xp: number;
  level: number;
}

interface MomentumStreak {
  current_streak: number;
  longest_streak: number;
  shield_available: boolean;
  last_activity_date: string | null;
}

interface DailySignal {
  id: string;
  content: string;
  signal_type: string;
  suggested_action: string | null;
  is_read: boolean;
}

// XP thresholds: level N requires (N-1)^2 * 100 total XP
function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export function useEngagement() {
  const { user } = useAuth();
  const [domainXP, setDomainXP] = useState<DomainXP[]>([]);
  const [streak, setStreak] = useState<MomentumStreak>({
    current_streak: 0,
    longest_streak: 0,
    shield_available: true,
    last_activity_date: null,
  });
  const [dailySignal, setDailySignal] = useState<DailySignal | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchXP = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_xp')
      .select('domain, total_xp, level')
      .eq('user_id', user.id);
    
    // Ensure all domains present
    const domains: LifeDomain[] = ['physical', 'mind', 'wealth', 'relationships', 'legacy'];
    const xpMap = new Map((data || []).map((d: any) => [d.domain, d]));
    const allDomains = domains.map(domain => ({
      domain,
      total_xp: (xpMap.get(domain) as any)?.total_xp || 0,
      level: (xpMap.get(domain) as any)?.level || 1,
    }));
    setDomainXP(allDomains);
  }, [user]);

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('momentum_streaks')
      .select('current_streak, longest_streak, shield_available, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setStreak(data as MomentumStreak);
    }
  }, [user]);

  const fetchDailySignal = useCallback(async () => {
    if (!user) return;
    setSignalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-signal');
      if (error) throw error;
      if (data?.signal) {
        setDailySignal(data.signal);
      }
    } catch (e) {
      console.error('Failed to fetch daily signal:', e);
    } finally {
      setSignalLoading(false);
    }
  }, [user]);

  const recordActivity = useCallback(async () => {
    if (!user) return null;
    // Build local calendar date (YYYY-MM-DD) from device clock so streaks
    // align with the user's wall time, not server UTC.
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const prevStreak = streak.current_streak;
    const { data, error } = await supabase.rpc('record_daily_activity', { _local_date: localDate });
    if (error) {
      console.error('[streak] record_daily_activity error', error);
      return null;
    }
    const result: any = Array.isArray(data) ? data[0] : data;
    if (result) {
      setStreak({
        current_streak: result.current_streak,
        longest_streak: result.longest_streak,
        last_activity_date: result.last_activity_date,
        shield_available: result.shield_available,
      });
      if (result.changed && result.current_streak > prevStreak && prevStreak > 0) {
        toast.success(`🔥 ${result.current_streak} day streak!`);
      }
      console.debug('[streak]', { localDate, prevStreak, result });
    }
    return result;
  }, [user, streak.current_streak]);

  const awardXP = useCallback(async (domain: LifeDomain, amount: number, sourceType: string, sourceId?: string) => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('award_xp', {
      _user_id: user.id,
      _domain: domain,
      _xp_amount: amount,
      _source_type: sourceType,
      _source_id: sourceId || null,
    });
    
    if (error) {
      console.error('Award XP error:', error);
      return null;
    }
    
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.leveled_up) {
      toast.success(`🎉 Level Up! ${domain.charAt(0).toUpperCase() + domain.slice(1)} is now Level ${result.new_level}!`);
    } else if (result) {
      toast.success(`+${amount} XP in ${domain.charAt(0).toUpperCase() + domain.slice(1)}`);
    }

    // Authoritative streak update (timezone-aware, atomic, idempotent)
    await recordActivity();
    await fetchXP();
    return result;
  }, [user, fetchXP, recordActivity]);

  const markSignalRead = useCallback(async () => {
    if (!dailySignal || dailySignal.is_read) return;
    await supabase
      .from('daily_signals')
      .update({ is_read: true })
      .eq('id', dailySignal.id);
    setDailySignal(prev => prev ? { ...prev, is_read: true } : null);
  }, [dailySignal]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      // Record today's activity authoritatively, then load fresh state.
      await recordActivity();
      await Promise.all([fetchXP(), fetchStreak(), fetchDailySignal()]);
      setLoading(false);
    };
    load();
  }, [user, fetchXP, fetchStreak, fetchDailySignal, recordActivity]);

  const totalXP = domainXP.reduce((sum, d) => sum + d.total_xp, 0);
  const overallLevel = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)) + 1);

  return {
    domainXP,
    streak,
    dailySignal,
    signalLoading,
    loading,
    totalXP,
    overallLevel,
    awardXP,
    recordActivity,
    markSignalRead,
    xpForLevel,
    xpForNextLevel,
  };
}
