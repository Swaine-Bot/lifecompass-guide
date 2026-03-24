import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Target, CheckCircle2, Circle, Pause, Play, Archive, Trash2, Flag, Clock } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { useEnvironment } from '@/contexts/SensoryContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Goal {
  id: string;
  title: string;
  category: string | null;
  target_date: string | null;
  priority: number;
  status: string;
  why: string | null;
  success_metric: string | null;
  constraints: string | null;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  effort_minutes: number | null;
}

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20', dotColor: 'bg-success' },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/20', dotColor: 'bg-primary' },
  paused: { label: 'Paused', color: 'bg-warning/10 text-warning border-warning/20', dotColor: 'bg-warning' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground border-border', dotColor: 'bg-muted-foreground' },
};

const priorityLabels: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

export default function GoalDetail() {
  useEnvironment('goals');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchGoalDetails();
    }
  }, [id, user]);

  const fetchGoalDetails = async () => {
    setLoading(true);
    
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (goalError || !goalData) {
      toast.error('Goal not found');
      navigate('/goals');
      return;
    }

    setGoal(goalData);

    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', id)
      .order('due_date', { ascending: true });

    setMilestones(milestonesData || []);

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('goal_id', id)
      .order('due_date', { ascending: true });

    setTasks(tasksData || []);
    setLoading(false);
  };

  const updateGoalStatus = async (status: 'active' | 'completed' | 'paused' | 'archived') => {
    if (!goal) return;

    const { error } = await supabase
      .from('goals')
      .update({ status })
      .eq('id', goal.id);

    if (error) {
      toast.error('Failed to update goal status');
    } else {
      setGoal({ ...goal, status });
      toast.success(`Goal marked as ${status}`);
    }
  };

  const deleteGoal = async () => {
    if (!goal) return;
    setIsDeleting(true);

    try {
      await supabase.from('tasks').delete().eq('goal_id', goal.id);
      await supabase.from('milestones').delete().eq('goal_id', goal.id);
      const { error } = await supabase.from('goals').delete().eq('id', goal.id);

      if (error) throw error;

      toast.success('Goal deleted successfully');
      navigate('/goals');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-64" />
          </div>
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!goal) return null;

  const status = statusConfig[goal.status] || statusConfig.active;
  const milestoneDone = milestones.filter(m => m.status === 'done').length;
  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const totalProgress = milestones.length + tasks.length;
  const doneProgress = milestoneDone + tasksDone;
  const progressPercent = totalProgress > 0 ? Math.round((doneProgress / totalProgress) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header — Mission Control */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => navigate('/goals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            {goal.category && (
              <span className="category-chip">
                {goal.category}
              </span>
            )}
            <span className={cn("status-badge", status.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status.dotColor)} />
              {status.label}
            </span>
            {goal.priority && (
              <span className="status-badge border-border/40 text-foreground">
                <Flag className="w-3 h-3 mr-1" />
                {priorityLabels[goal.priority] || 'Normal'}
              </span>
            )}
          </div>
        </div>

        <div className="pl-[52px]">
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight leading-tight">{goal.title}</h1>
        </div>
      </div>

      {/* Progress Bar — Mission Status */}
      <Card variant="gold" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-primary/60 font-semibold uppercase tracking-[0.15em]">Overall Progress</p>
              <p className="text-3xl font-bold font-serif mt-1">{progressPercent}<span className="text-lg text-muted-foreground/40">%</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums">{doneProgress}<span className="text-muted-foreground/40">/{totalProgress}</span></p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Items Done</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Actions — Contextual */}
      <div className="flex items-center gap-2 flex-wrap">
        <ShareButton
          source={{
            type: goal.status === 'active' ? 'goal_progress' : 'goal_created',
            id: goal.id,
            title: goal.title,
            subtitle: goal.why || undefined,
            statValue: goal.status === 'completed' ? '✓' : `${progressPercent}%`,
            statLabel: goal.category || undefined,
            domain: goal.category || 'mind',
          }}
          variant="button"
        />
        {goal.status === 'active' && (
          <>
            <Button variant="gold" size="sm" onClick={() => updateGoalStatus('completed')}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Complete
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => updateGoalStatus('paused')}>
              <Pause className="w-4 h-4 mr-1.5" />
              Pause
            </Button>
          </>
        )}
        {goal.status === 'paused' && (
          <Button variant="outline" size="sm" onClick={() => updateGoalStatus('active')}>
            <Play className="w-4 h-4 mr-1.5" />
            Resume
          </Button>
        )}
        {goal.status === 'completed' && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => updateGoalStatus('archived')}>
            <Archive className="w-4 h-4 mr-1.5" />
            Archive
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive/60 hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Goal Context */}
      {(goal.why || goal.success_metric || goal.constraints) && (
        <Card variant="glass">
          <CardContent className="p-5 space-y-4">
            {goal.why && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-1.5">Why This Matters</p>
                <p className="text-sm leading-relaxed">{goal.why}</p>
              </div>
            )}
            {goal.success_metric && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-1.5">Success Metric</p>
                <p className="text-sm leading-relaxed">{goal.success_metric}</p>
              </div>
            )}
            {goal.constraints && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium mb-1.5">Constraints</p>
                <p className="text-sm leading-relaxed">{goal.constraints}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-3 px-1">
        {goal.target_date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Calendar className="w-3.5 h-3.5" />
            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Clock className="w-3.5 h-3.5" />
          Created: {format(new Date(goal.created_at), 'MMM d, yyyy')}
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Milestones</CardTitle>
              <span className="text-xs text-muted-foreground/50 tabular-nums">{milestoneDone}/{milestones.length}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {milestones.map((milestone) => {
              const isDone = milestone.status === 'done';
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors",
                    isDone ? 'bg-success/[0.06]' : 'hover:bg-white/[0.03]'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-[18px] h-[18px] text-success shrink-0" />
                  ) : (
                    <Circle className="w-[18px] h-[18px] text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={cn(
                    "flex-1 text-sm",
                    isDone && "line-through text-muted-foreground/50"
                  )}>
                    {milestone.title}
                  </span>
                  {milestone.due_date && (
                    <span className="text-[11px] text-muted-foreground/40 tabular-nums shrink-0">
                      {format(new Date(milestone.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Linked Tasks */}
      {tasks.length > 0 && (
        <Card variant="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Linked Micro-Moves</CardTitle>
              <span className="text-xs text-muted-foreground/50 tabular-nums">{tasksDone}/{tasks.length}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {tasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                    isDone ? 'bg-success/[0.04]' : 'hover:bg-white/[0.03]'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/25 shrink-0" />
                  )}
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    isDone && "line-through text-muted-foreground/40"
                  )}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.effort_minutes && (
                      <span className="text-[10px] text-muted-foreground/30 tabular-nums">{task.effort_minutes}m</span>
                    )}
                    {task.due_date && (
                      <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{goal.title}"? This will also delete all associated milestones and tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteGoal}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
