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
  Sun, Moon, Cloud, Zap, Check, Settings, Trophy, Star, Share2
} from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { choreographedDispatch } from '@/engines/choreographyEngine';
import { useEngagement } from '@/hooks/useEngagement';
import { DailySignalCard } from '@/components/engagement/DailySignalCard';
import { XPDomainBars } from '@/components/engagement/XPDomainBars';
import { MomentumStreakCard } from '@/components/engagement/MomentumStreakCard';
import { useMilestonePrompt } from '@/hooks/useMilestonePrompt';
import { MilestonePromptModal } from '@/components/viral/MilestonePromptModal';
import { InvitePrompt } from '@/components/viral/InvitePrompt';
import { StepProgressCard } from '@/components/wearables/StepProgressCard';
import { useEnvironment } from '@/contexts/SensoryContext';

interface Task {
  id: string;
  title: string;
  status: string;
  is_one_thing: boolean;
  effort_minutes: number;
  created_by?: string;
  playbook_id?: string;
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
  useEnvironment('home');
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
  const [showInvite, setShowInvite] = useState(false);

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
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'today')
        .order('is_one_thing', { ascending: false });
      
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .limit(5);
      
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, completed')
        .eq('date', today);

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

  const triggerReward = (isOneThing: boolean = false) => {
    setShowReward(true);
    if (isOneThing) {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFA500']
      });
    }
    setTimeout(() => setShowReward(false), 1500);
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
        const isOneThing = tasks.find(t => t.id === taskId)?.is_one_thing ?? false;
        choreographedDispatch(isOneThing ? 'milestone_reached' : 'micro_move_complete');
        triggerReward(isOneThing);
        toast.success(isOneThing ? '🎉 The One Thing — done!' : '✓ Task completed');
        const result = await awardXP('mind', 20, 'task_completed', taskId);
        if (result?.leveled_up && user) {
          milestonePrompt.checkLevelUp('mind', result.new_level, true, user.id);
        }
        if (user) milestonePrompt.checkStreak(streak.current_streak + 1, user.id);
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
      choreographedDispatch('micro_move_complete');
      toast.success('✨ Habit completed!');
      const result = await awardXP('physical', 20, 'habit_completed', habitId);
      if (result?.leveled_up && user) {
        milestonePrompt.checkLevelUp('physical', result.new_level, true, user.id);
      }
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
    <div className="space-y-5 animate-fade-in">
      {/* Header — Premium Command Center */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <Link to="/settings" className="shrink-0">
            <Avatar className="w-11 h-11 ring-2 ring-primary/15 hover:ring-primary/30 transition-all cursor-pointer shadow-[0_0_16px_-4px_hsl(43_74%_52%/0.2)]">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-serif text-lg">
                {profile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight mb-0.5 truncate">
              {greeting}, {profile?.name || 'there'}
            </h1>
            <p className="text-muted-foreground/70 text-xs tracking-wide uppercase">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="gold" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/goals/new">
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </Link>
          </Button>
          <Button variant="gold" size="icon-sm" asChild className="sm:hidden">
            <Link to="/goals/new">
              <Plus className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild className="text-muted-foreground/60 hover:text-foreground">
            <Link to="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row — Grounded Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card variant="glass" className="p-3.5 text-center group hover-lift">
          <div className="text-2xl font-bold text-primary font-serif">{completedToday}</div>
          <div className="section-label mt-0.5">Done</div>
        </Card>
        <Card variant="glass" className="p-3.5 text-center group hover-lift">
          <div className="text-2xl font-bold text-primary font-serif">{habitsCompleted}<span className="text-muted-foreground/40 text-lg">/{habits.length}</span></div>
          <div className="section-label mt-0.5">Habits</div>
        </Card>
        <MomentumStreakCard
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
          shieldAvailable={streak.shield_available}
        />
      </div>

      {/* Step Progress */}
      <StepProgressCard />

      {/* Share Streak */}
      {streak.current_streak >= 3 && (
        <div className="flex justify-end -mt-2">
          <ShareButton
            source={{
              type: 'achievement',
              title: `${streak.current_streak} Day Streak`,
              subtitle: 'Momentum maintained through daily action.',
              statValue: String(streak.current_streak),
              statLabel: 'Consecutive Days',
              domain: 'discipline',
            }}
            variant="button"
          />
        </div>
      )}

      {/* Daily Signal */}
      <DailySignalCard
        signal={dailySignal}
        loading={signalLoading}
        onReveal={markSignalRead}
      />

      {/* The One Thing — Hero Card */}
      {oneThingTask && (
        <Card variant="gold" className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-primary/70 font-semibold mb-1.5">
                  The One Thing
                </p>
                <p className="font-serif font-semibold text-lg leading-snug">{oneThingTask.title}</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  {oneThingTask.effort_minutes} min estimated
                </p>
              </div>
              <Checkbox 
                checked={oneThingTask.status === 'done'}
                onCheckedChange={(checked) => toggleTask(oneThingTask.id, checked as boolean)}
                className="w-6 h-6 mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Micro-Moves */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Micro-Moves
              {showReward && (
                <span className="flex items-center gap-1 text-primary animate-pulse">
                  <Trophy className="w-3.5 h-3.5" />
                </span>
              )}
            </CardTitle>
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider tabular-nums">
              {completedTasks.length} done
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Quick Add */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a quick task…"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
              className="h-9 text-sm bg-secondary/30 border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/40"
              disabled={isAddingTask}
            />
            <Button 
              size="sm" 
              variant="gold-outline"
              onClick={addQuickTask}
              disabled={!newTaskTitle.trim() || isAddingTask}
              className="h-9 px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Task List */}
          {microMoves.length === 0 && completedTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/50">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Add your first task above</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {microMoves.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
                >
                  <Checkbox 
                    checked={false}
                    onCheckedChange={() => toggleTask(task.id, true)}
                    className="w-[18px] h-[18px]"
                  />
                  <span className="flex-1 text-sm truncate leading-snug">{task.title}</span>
                  {task.created_by === 'ai_mentor' && (
                    <span className="text-[9px] text-primary/50 uppercase tracking-wider shrink-0 bg-primary/[0.06] px-1.5 py-0.5 rounded">AI</span>
                  )}
                  {task.playbook_id && (
                    <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider shrink-0">Playbook</span>
                  )}
                  <span className="text-[11px] text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums shrink-0">
                    {task.effort_minutes}m
                  </span>
                </div>
              ))}
              
              {completedTasks.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-white/[0.04]">
                  <p className="text-[10px] text-muted-foreground/30 mb-1 flex items-center gap-1 uppercase tracking-wider px-2.5">
                    <Check className="w-3 h-3" /> Done ({completedTasks.length})
                  </p>
                  {completedTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2.5 py-1.5 px-2.5 text-muted-foreground/35"
                    >
                      <Checkbox 
                        checked={true}
                        onCheckedChange={() => toggleTask(task.id, false)}
                        className="w-[18px] h-[18px]"
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

      {/* Habits — Circular Check-in */}
      {habits.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Habit Check-in</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground/50 hover:text-foreground">
                <Link to="/habits">
                  View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
              {habits.map((habit) => {
                const isCompleted = habitLogs.find(l => l.habit_id === habit.id)?.completed;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className={cn(
                      "habit-check transition-transform group-hover:scale-105",
                      isCompleted && "completed"
                    )} style={{ borderColor: isCompleted ? undefined : habit.color }}>
                      {isCompleted && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 text-center line-clamp-2 leading-tight">
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

      {/* Mood & Energy — Side by Side */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card variant="surface">
          <CardHeader>
            <CardTitle className="text-base">How are you feeling?</CardTitle>
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

        <Card variant="surface">
          <CardHeader>
            <CardTitle className="text-base">Energy level?</CardTitle>
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

      {/* Quick Actions — Refined Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { to: '/goals/new', icon: Target, label: 'Goal' },
          { to: '/habits/new', icon: Flame, label: 'Habit' },
          { to: '/journal', icon: PenLine, label: 'Journal' },
          { to: '/mentor', icon: Sparkles, label: 'Mentor' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-primary/20 transition-all">
            <Icon className="w-4.5 h-4.5 text-primary/70" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{label}</span>
          </Link>
        ))}
      </div>

      {milestonePrompt.milestone && (
        <MilestonePromptModal
          milestone={milestonePrompt.milestone}
          open={milestonePrompt.open}
          onClose={() => {
            milestonePrompt.close();
            setShowInvite(true);
          }}
        />
      )}

      {showInvite && (
        <InvitePrompt context="post_milestone" onDismiss={() => setShowInvite(false)} />
      )}
    </div>
  );
}
