import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ChevronRight, Plus, Calendar, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  status: string;
  target_date: string | null;
  category: string | null;
  priority: number;
}

/**
 * Dedicated, isolated Goals card for the Home screen.
 * Visual structure mirrors the Micro-Moves card for consistency,
 * but state, scrolling, and actions are completely independent.
 */
export function GoalsHomeCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('goals')
        .select('id, title, status, target_date, category, priority')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(5);
      if (!cancelled) {
        setGoals((data as Goal[]) || []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel('home-goals-' + user.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary/80" />
            Active Goals
          </CardTitle>
          <Link
            to="/goals"
            className="section-label tabular-nums hover:text-primary transition-colors flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-1.5">
            <div className="h-10 rounded-lg bg-white/[0.03] animate-pulse" />
            <div className="h-10 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-5">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary/40" />
            <p className="text-xs text-foreground/70 mb-3">
              No active goals yet. Set your first one.
            </p>
            <Button variant="gold-outline" size="sm" asChild>
              <Link to="/goals/new">
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Goal
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => navigate(`/goals/${goal.id}`)}
                className="w-full flex items-center gap-2.5 py-2.5 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group text-left min-w-0"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center shrink-0">
                  <Flag className="w-3.5 h-3.5 text-primary/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug truncate">
                    {goal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {goal.category && (
                      <span className="text-[10px] uppercase tracking-wider text-foreground/60">
                        {goal.category}
                      </span>
                    )}
                    {goal.target_date && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(goal.target_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 group-hover:text-primary/70 transition-colors" />
              </button>
            ))}
            <Button variant="ghost" size="sm" asChild className="w-full mt-2 text-foreground/80">
              <Link to="/goals/new">
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Goal
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
