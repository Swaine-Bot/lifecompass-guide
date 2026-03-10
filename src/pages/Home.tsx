import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, Target, Flame, PenLine, Sparkles, ChevronRight, 
  Sun, Moon, Cloud, Zap, Check, Settings, Trophy, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useEngagement } from '@/hooks/useEngagement';
import { DailySignalCard } from '@/components/engagement/DailySignalCard';
import { XPDomainBars } from '@/components/engagement/XPDomainBars';
import { MomentumStreakCard } from '@/components/engagement/MomentumStreakCard';
import { useMilestonePrompt } from '@/hooks/useMilestonePrompt';
import { MilestonePromptModal } from '@/components/viral/MilestonePromptModal';

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
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<{ mood: number | null; energy: number | null }>({ mood: null, energy: null });
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const { 
    domainXP, streak, dailySignal, signalLoading, 
    awardXP, markSignalRead, xpForLevel, xpForNextLevel, totalXP, overallLevel
  } = useEngagement();
  const milestonePrompt = useMilestonePrompt();

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
    loadAvatarUrl();
  }, [profile]);

  const loadAvatarUrl = async () => {
    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    
    // If it's a storage path, generate signed URL
    if (profile.avatar_url.includes('avatars/') || profile.avatar_url.includes('/')) {
      const { data, error } = await supabase.storage
        .from('user-media')
        .createSignedUrl(profile.avatar_url, 3600);
      
      if (!error && data) {
        setAvatarUrl(data.signedUrl);
      }
    } else {
      setAvatarUrl(profile.avatar_url);
    }
  };

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

  const triggerReward = () => {
    setShowReward(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFD700', '#FFA500']
    });
    setTimeout(() => setShowReward(false), 2000);
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? 'done' : 'today';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
    
    if (!error) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      
      if (completed) {
        triggerReward();
        toast.success('🎉 Task completed! Keep it up!');
        awardXP('mind', 20, 'task_completed', taskId);
      }
    }
  };

  const addQuickTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    
    setIsAddingTask(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle.trim(),
          status: 'today',
          user_id: user.id,
          effort_minutes: 15,
          is_one_thing: false
        })
        .select()
        .single();
      
      if (!error && data) {
        setTasks(prev => [...prev, data]);
        setNewTaskTitle('');
        toast.success('Task added!');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
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

    if (newCompleted) {
      toast.success('✨ Habit completed!');
      awardXP('physical', 20, 'habit_completed', habitId);
    }
  };

  const saveCheckin = async (type: 'mood' | 'energy', value: number) => {
    const newCheckin = { ...todayCheckin, [type]: value };
    setTodayCheckin(newCheckin);

    const updateData = type === 'mood' ? { mood: value } : { energy: value };
    
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase.from('daily_checkins').update(updateData).eq('id', existing.id);
    }
  };

  const oneThingTask = tasks.find(t => t.is_one_thing && t.status !== 'done');
  const microMoves = tasks.filter(t => !t.is_one_thing && t.status === 'today');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const completedToday = completedTasks.length;
  const habitsCompleted = habitLogs.filter(l => l.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {profile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1">
              {greeting}, {profile?.name || 'there'}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" asChild>
            <Link to="/goals/new">
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
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
        <MomentumStreakCard
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
          shieldAvailable={streak.shield_available}
        />
      </div>

      {/* Daily Signal */}
      <DailySignalCard
        signal={dailySignal}
        loading={signalLoading}
        onReveal={markSignalRead}
      />

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
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Today's Micro-Moves
              {showReward && (
                <span className="flex items-center gap-1 text-primary animate-pulse">
                  <Trophy className="w-4 h-4" />
                  <Star className="w-3 h-3" />
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Quick Add Task */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a quick task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
              className="h-9 text-sm"
              disabled={isAddingTask}
            />
            <Button 
              size="sm" 
              onClick={addQuickTask}
              disabled={!newTaskTitle.trim() || isAddingTask}
              className="h-9 px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Task List - Compact */}
          {microMoves.length === 0 && completedTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Add your first task above!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {microMoves.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-secondary/30 transition-colors group"
                >
                  <Checkbox 
                    checked={false}
                    onCheckedChange={() => toggleTask(task.id, true)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.effort_minutes}m
                  </span>
                </div>
              ))}
              
              {/* Completed Tasks - More Compact */}
              {completedTasks.length > 0 && (
                <div className="pt-2 border-t border-border/30 mt-2">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Completed ({completedTasks.length})
                  </p>
                  {completedTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 py-1 px-2 text-muted-foreground"
                    >
                      <Checkbox 
                        checked={true}
                        onCheckedChange={() => toggleTask(task.id, false)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1 text-xs line-through truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

      {/* Life Domains XP */}
      <XPDomainBars
        domains={domainXP}
        xpForNextLevel={xpForNextLevel}
        xpForLevel={xpForLevel}
      />

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
