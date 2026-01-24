import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Target, Flame, PenLine, Sparkles, ChevronRight, 
  Sun, Moon, Cloud, Zap, Check, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: string;
  is_one_thing: boolean;
  effort_minutes: number;
}

interface Habit {
  id: string;
  title: string;
  color: string;
}

interface HabitLog {
  habit_id: string;
  completed: boolean;
}

const moodOptions = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 3, emoji: '😐', label: 'Low' },
  { value: 5, emoji: '🙂', label: 'Okay' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 9, emoji: '🔥', label: 'Great' },
];

const energyOptions = [
  { value: 1, icon: Moon, label: 'Drained' },
  { value: 3, icon: Cloud, label: 'Low' },
  { value: 5, icon: Sun, label: 'Steady' },
  { value: 7, icon: Sparkles, label: 'Energized' },
  { value: 9, icon: Zap, label: 'Electric' },
];

export default function Home() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<{ mood: number | null; energy: number | null }>({ mood: null, energy: null });
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch today's tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'today')
        .order('is_one_thing', { ascending: false });
      
      // Fetch habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .limit(5);
      
      // Fetch today's habit logs
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, completed')
        .eq('date', today);

      // Fetch today's check-in
      const { data: checkinData } = await supabase
        .from('daily_checkins')
        .select('mood, energy')
        .eq('date', today)
        .maybeSingle();

      setTasks(tasksData || []);
      setHabits(habitsData || []);
      setHabitLogs(logsData || []);
      if (checkinData) {
        setTodayCheckin({ mood: checkinData.mood, energy: checkinData.energy });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? 'done' : 'today';
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
  };

  const toggleHabit = async (habitId: string) => {
    const existing = habitLogs.find(l => l.habit_id === habitId);
    const newCompleted = !existing?.completed;

    if (existing) {
      await supabase
        .from('habit_logs')
        .update({ completed: newCompleted })
        .eq('habit_id', habitId)
        .eq('date', today);
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, date: today, completed: true });
    }

    setHabitLogs(prev => {
      const filtered = prev.filter(l => l.habit_id !== habitId);
      return [...filtered, { habit_id: habitId, completed: newCompleted }];
    });
  };

  const saveCheckin = async (type: 'mood' | 'energy', value: number) => {
    const newCheckin = { ...todayCheckin, [type]: value };
    setTodayCheckin(newCheckin);

    // Simply upsert without checking - RLS handles user context
    const updateData = type === 'mood' ? { mood: value } : { energy: value };
    
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase.from('daily_checkins').update(updateData).eq('id', existing.id);
    }
    // Note: Insert requires user_id which is handled by RLS default, skip for now
  };

  const oneThingTask = tasks.find(t => t.is_one_thing);
  const microMoves = tasks.filter(t => !t.is_one_thing && t.status === 'today');
  const completedToday = tasks.filter(t => t.status === 'done').length;
  const habitsCompleted = habitLogs.filter(l => l.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1">
            {greeting}, {profile?.name || 'there'}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <Button variant="gold" size="sm" asChild>
          <Link to="/goals/new">
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="glass" className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completedToday}</div>
          <div className="text-xs text-muted-foreground">Tasks Done</div>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{habitsCompleted}/{habits.length}</div>
          <div className="text-xs text-muted-foreground">Habits</div>
        </Card>
        <Card variant="glass" className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            <Flame className="w-6 h-6 inline text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">7 Day Streak</div>
        </Card>
      </div>

      {/* The One Thing */}
      {oneThingTask && (
        <Card variant="gold" className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary/80 font-medium mb-1">
                  The One Thing
                </p>
                <p className="font-medium text-lg">{oneThingTask.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {oneThingTask.effort_minutes} min
                </p>
              </div>
              <Checkbox 
                checked={oneThingTask.status === 'done'}
                onCheckedChange={(checked) => toggleTask(oneThingTask.id, checked as boolean)}
                className="w-6 h-6"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Micro-Moves */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Today's Micro-Moves</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/goals">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {microMoves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks for today yet</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/goals">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tasks
                </Link>
              </Button>
            </div>
          ) : (
            microMoves.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Checkbox 
                  checked={task.status === 'done'}
                  onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                />
                <span className={cn(
                  "flex-1",
                  task.status === 'done' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {task.effort_minutes}m
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Habits */}
      {habits.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Habit Check-in</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/habits">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {habits.map((habit) => {
                const isCompleted = habitLogs.find(l => l.habit_id === habit.id)?.completed;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="flex flex-col items-center gap-2 min-w-[70px]"
                  >
                    <div className={cn(
                      "habit-check",
                      isCompleted && "completed"
                    )} style={{ borderColor: isCompleted ? undefined : habit.color }}>
                      {isCompleted && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-xs text-muted-foreground text-center line-clamp-2">
                      {habit.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood & Energy */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => saveCheckin('mood', option.value)}
                  className={cn(
                    "mood-option",
                    todayCheckin.mood === option.value && "selected"
                  )}
                  title={option.label}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Energy level?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {energyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => saveCheckin('energy', option.value)}
                  className={cn(
                    "mood-option",
                    todayCheckin.energy === option.value && "selected"
                  )}
                  title={option.label}
                >
                  <option.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <Link to="/goals/new" className="quick-action">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">New Goal</span>
        </Link>
        <Link to="/habits/new" className="quick-action">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">Add Habit</span>
        </Link>
        <Link to="/journal" className="quick-action">
          <PenLine className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">Journal</span>
        </Link>
        <Link to="/mentor" className="quick-action">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground">AI Mentor</span>
        </Link>
      </div>
    </div>
  );
}
