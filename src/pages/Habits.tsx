import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Flame, Check, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/contexts/SensoryContext';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  target_value: number | null;
  metric_unit: string | null;
  color: string;
}

interface HabitLog {
  habit_id: string;
  date: string;
  completed: boolean;
  value: number | null;
}

export default function Habits() {
  useEnvironment('habits');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: subDays(new Date(), 0)
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at');

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'));

    setHabits(habitsData || []);
    setLogs(logsData || []);
    setLoading(false);
  };

  const toggleHabit = async (habitId: string, date: string) => {
    const existing = logs.find(l => l.habit_id === habitId && l.date === date);
    const newCompleted = !existing?.completed;

    if (existing) {
      await supabase
        .from('habit_logs')
        .update({ completed: newCompleted })
        .eq('habit_id', habitId)
        .eq('date', date);
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, date, completed: true });
    }

    setLogs(prev => {
      const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date));
      return [...filtered, { habit_id: habitId, date, completed: newCompleted, value: null }];
    });
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const log = logs.find(l => l.habit_id === habitId && l.date === dateStr);
      
      if (log?.completed) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else if (dateStr === today) {
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyProgress = (habitId: string) => {
    const completedDays = weekDays.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return logs.find(l => l.habit_id === habitId && l.date === dateStr)?.completed;
    }).length;
    
    return Math.round((completedDays / 7) * 100);
  };

  const todayCompleted = habits.filter(h => 
    logs.find(l => l.habit_id === h.id && l.date === today)?.completed
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="icon-orb">
              <Flame />
            </div>
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight">Habits</h1>
          </div>
          <p className="page-subtitle">Build routines that shape your life</p>
        </div>
        <Button variant="gold" size="sm" asChild className="shrink-0">
          <Link to="/habits/new">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* Today's Progress — Hero */}
      <Card variant="gold" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="section-label text-primary/60">Today's Progress</p>
              <p className="text-3xl font-bold font-serif mt-1">{todayCompleted}<span className="text-muted-foreground/40 text-xl">/{habits.length}</span></p>
            </div>
            <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/[0.05]">
              <Flame className={cn(
                "w-7 h-7 transition-colors",
                todayCompleted === habits.length && habits.length > 0 
                  ? "text-primary animate-pulse-gold" 
                  : "text-primary/40"
              )} />
            </div>
          </div>
          <Progress 
            value={habits.length > 0 ? (todayCompleted / habits.length) * 100 : 0} 
            className="h-1.5"
          />
        </CardContent>
      </Card>

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Flame className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-muted-foreground/50 text-sm mb-4">
            No habits yet. Start building your routine!
          </p>
          <Button variant="gold-outline" size="sm" asChild>
            <Link to="/habits/new">
              <Plus className="w-4 h-4 mr-2" />
              Create your first habit
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const streak = getStreak(habit.id);
            const weeklyProgress = getWeeklyProgress(habit.id);
            const isTodayComplete = logs.find(
              l => l.habit_id === habit.id && l.date === today
            )?.completed;

            return (
              <Card key={habit.id} variant="glass" className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    {/* Check button */}
                    <button
                      onClick={() => toggleHabit(habit.id, today)}
                      className={cn(
                        "habit-check shrink-0 mt-0.5",
                        isTodayComplete && "completed"
                      )}
                      style={{ borderColor: isTodayComplete ? undefined : habit.color }}
                    >
                      {isTodayComplete && <Check className="w-4 h-4" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{habit.title}</h3>
                        {streak > 0 && (
                          <span className="streak-badge shrink-0">
                            <Flame className="w-3 h-3" />
                            {streak}d
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground/50 mb-2.5 line-clamp-1">{habit.description}</p>
                      )}

                      {/* Week View */}
                      <div className="flex gap-1.5">
                        {eachDayOfInterval({
                          start: weekStart,
                          end: new Date()
                        }).map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isComplete = logs.find(
                            l => l.habit_id === habit.id && l.date === dateStr
                          )?.completed;
                          const isToday = dateStr === today;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => toggleHabit(habit.id, dateStr)}
                              className={cn(
                                "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-medium transition-all",
                                isComplete
                                  ? "bg-primary text-primary-foreground"
                                  : isToday
                                    ? "bg-secondary border border-dashed border-primary/30"
                                    : "bg-secondary/50"
                              )}
                            >
                              {format(day, 'E').charAt(0)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground/60">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {weeklyProgress}%
                      </div>
                      <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
