import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, BookOpen, Target, MessageCircle } from 'lucide-react';

type Suggestion = {
  id: string;
  icon: typeof Sparkles;
  label: string;
  title: string;
  reason: string;
  cta: string;
  to: string;
};

/**
 * Smart Suggestions — opt-in surface on Home.
 * Deterministic, privacy-respecting: looks only at counts/recency of the
 * authenticated user's own activity to recommend a next best action.
 * No third-party calls; no shared analytics.
 */
export function SmartSuggestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data: prefs } = await supabase
        .from('user_privacy_settings' as never)
        .select('curated_suggestions_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      const on = !!(prefs as { curated_suggestions_enabled?: boolean } | null)?.curated_suggestions_enabled;
      if (cancelled) return;
      setEnabled(on);
      if (!on) return;

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [{ count: journalCount }, { count: goalCount }, { count: moveCount }] = await Promise.all([
        supabase.from('journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since),
        supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('micro_moves').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since),
      ]);

      if (cancelled) return;
      const j = journalCount ?? 0;
      const g = goalCount ?? 0;
      const m = moveCount ?? 0;

      let pick: Suggestion;
      if (g === 0) {
        pick = { id: 'goal', icon: Target, label: 'Set direction', title: 'Define an active goal', reason: 'You have no active goals this week.', cta: 'Add a goal', to: '/goals' };
      } else if (j < 2) {
        pick = { id: 'journal', icon: BookOpen, label: 'Reflect', title: 'Capture how this week is going', reason: 'Reflection compounds clarity.', cta: 'Open journal', to: '/journal' };
      } else if (m < 3) {
        pick = { id: 'moves', icon: Sparkles, label: 'Momentum', title: 'Pick three micro-moves for today', reason: 'Small actions keep your streak alive.', cta: 'See micro-moves', to: '/micro-moves' };
      } else {
        pick = { id: 'mentor', icon: MessageCircle, label: 'Go deeper', title: 'Ask your mentor what to focus on next', reason: 'You\u2019ve built signal this week — let\u2019s shape it.', cta: 'Talk to mentor', to: '/mentor' };
      }
      setSuggestion(pick);
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (!enabled || !suggestion) return null;
  const Icon = suggestion.icon;

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] tracking-[0.18em] uppercase text-white/60 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Suggested for you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.16em] uppercase text-white/50">{suggestion.label}</p>
            <p className="text-sm font-medium text-foreground leading-snug">{suggestion.title}</p>
            <p className="text-xs text-white/60 mt-1">{suggestion.reason}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="w-full justify-between" onClick={() => navigate(suggestion.to)}>
          {suggestion.cta}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
