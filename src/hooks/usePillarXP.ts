/**
 * 5-pillar XP hook — Mind / Money / Health / Relationship / Legacy.
 * Backed by the `user_pillar_xp` table + `award_pillar_xp` RPC.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Pillar = 'mind' | 'money' | 'health' | 'relationship' | 'legacy';

export interface PillarSnapshot {
  pillar: Pillar;
  total_xp: number;
  level: number;
}

export const PILLAR_META: Record<Pillar, { label: string; tint: string; icon: string }> = {
  mind:         { label: 'Mind',         tint: 'from-indigo-400/60 to-indigo-600/30',   icon: '🧠' },
  money:        { label: 'Money',        tint: 'from-amber-400/60 to-amber-600/30',     icon: '💎' },
  health:       { label: 'Health',       tint: 'from-emerald-400/60 to-emerald-600/30', icon: '💪' },
  relationship: { label: 'Relationship', tint: 'from-rose-400/60 to-rose-600/30',       icon: '🤝' },
  legacy:       { label: 'Legacy',       tint: 'from-violet-400/60 to-violet-600/30',   icon: '🪐' },
};

export const PILLAR_ORDER: Pillar[] = ['mind', 'money', 'health', 'relationship', 'legacy'];

export function usePillarXP() {
  const { user } = useAuth();
  const [pillars, setPillars] = useState<PillarSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPillars = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('user_pillar_xp' as any)
      .select('pillar,total_xp,level')
      .eq('user_id', user.id);
    setPillars(((data as any[]) || []) as PillarSnapshot[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPillars(); }, [fetchPillars]);

  const awardXp = useCallback(async (
    pillar: Pillar,
    amount: number,
    sourceType: string,
    sourceId?: string,
  ) => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('award_pillar_xp' as any, {
      _pillar: pillar,
      _amount: amount,
      _source_type: sourceType,
      _source_id: sourceId ?? null,
    });
    if (error) {
      console.error('[pillar XP]', error);
      return null;
    }
    const result = (Array.isArray(data) ? data[0] : data) as { new_total_xp: number; new_level: number; leveled_up: boolean } | null;
    if (result?.leveled_up) {
      toast.success(`Level up! ${PILLAR_META[pillar].label} reached level ${result.new_level}`);
    }
    fetchPillars();
    return result;
  }, [user, fetchPillars]);

  const getLevel = (p: Pillar) => pillars.find(x => x.pillar === p)?.level ?? 1;
  const getXp = (p: Pillar) => pillars.find(x => x.pillar === p)?.total_xp ?? 0;

  return { pillars, loading, awardXp, getLevel, getXp, refetch: fetchPillars };
}
