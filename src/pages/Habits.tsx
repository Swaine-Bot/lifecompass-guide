import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Flame, Check, ChevronRight, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1">Habits</h1>
          <p className="text-muted-foreground text-sm">Build routines that shape your life</p>
        </div>
        <Button variant="gold" asChild className="shrink-0">
          <Link to="/habits/new">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* Today's Progress */}
      <Card variant="gold" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-primary/80 font-medium">Today's Progress</p>
              <p className="text-3xl font-bold">{todayCompleted}/{habits.length}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
              <Flame className={cn(
                "w-8 h-8",
                todayCompleted === habits.length && habits.length > 0 
                  ? "text-primary animate-pulse-gold" 
                  : "text-primary/50"
              )} />
            </div>
          </div>
          <Progress 
            value={habits.length > 0 ? (todayCompleted / habits.length) * 100 : 0} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Habits List */}
      {habits.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Flame className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">
            No habits yet. Start building your routine!
          </p>
          <Button variant="outline" asChild>
            <Link to="/habits/new">
              <Plus className="w-4 h-4 mr-2" />
              Create your first habit
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const streak = getStreak(habit.id);
            const weeklyProgress = getWeeklyProgress(habit.id);
            const isTodayComplete = logs.find(
              l => l.habit_id === habit.id && l.date === today
            )?.completed;

            return (
              <Card key={habit.id} variant="glass" className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Check button */}
                    <button
                      onClick={() => toggleHabit(habit.id, today)}
                      className={cn(
                        "habit-check shrink-0 mt-1",
                        isTodayComplete && "completed"
                      )}
                      style={{ borderColor: isTodayComplete ? undefined : habit.color }}
                    >
                      {isTodayComplete && <Check className="w-4 h-4" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{habit.title}</h3>
                        {streak > 0 && (
                          <span className="streak-badge">
                            <Flame className="w-3 h-3" />
                            {streak} days
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
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
                                "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                                isComplete
                                  ? "bg-primary text-primary-foreground"
                                  : isToday
                                    ? "bg-secondary border-2 border-dashed border-primary/30"
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
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        {weeklyProgress}%
                      </div>
                      <p className="text-xs text-muted-foreground">this week</p>
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
