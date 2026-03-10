import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Target, CheckCircle2, Pause, Play, Archive, Edit, Trash2, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
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

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success border-success/20',
  completed: 'bg-primary/15 text-primary border-primary/20',
  paused: 'bg-warning/15 text-warning border-warning/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

export default function GoalDetail() {
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
    
    // Fetch goal
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

    // Fetch milestones
    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', id)
      .order('due_date', { ascending: true });

    setMilestones(milestonesData || []);

    // Fetch tasks
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
      // Delete related tasks first
      await supabase.from('tasks').delete().eq('goal_id', goal.id);
      
      // Delete related milestones
      await supabase.from('milestones').delete().eq('goal_id', goal.id);
      
      // Delete the goal
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/goals')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {goal.category && (
                <Badge variant="secondary" className="text-xs">
                  {goal.category}
                </Badge>
              )}
              <Badge className={cn("text-xs border", statusColors[goal.status])}>
                {goal.status}
              </Badge>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">{goal.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ShareButton
            source={{
              type: goal.status === 'active' ? 'goal_progress' : 'goal_created',
              id: goal.id,
              title: goal.title,
              subtitle: goal.why || undefined,
              statValue: goal.status === 'completed' ? '✓' : undefined,
              statLabel: goal.category || undefined,
              domain: goal.category || 'mind',
            }}
            variant="button"
          />
          {goal.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateGoalStatus('completed')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => updateGoalStatus('paused')}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </>
          )}
          {goal.status === 'paused' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateGoalStatus('active')}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          {goal.status === 'completed' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => updateGoalStatus('archived')}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Goal Details */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.why && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Why this matters</h3>
              <p>{goal.why}</p>
            </div>
          )}
          
          {goal.success_metric && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Success Metric</h3>
              <p>{goal.success_metric}</p>
            </div>
          )}
          
          {goal.constraints && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Constraints</h3>
              <p>{goal.constraints}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border/30">
            {goal.target_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Created: {format(new Date(goal.created_at), 'MMM d, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>{milestones.filter(m => m.status === 'done').length} of {milestones.length} completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    milestone.status === 'done' ? 'bg-success/10 border-success/20' : 'bg-muted/50 border-border/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn(
                      "w-5 h-5",
                      milestone.status === 'done' ? 'text-success' : 'text-muted-foreground'
                    )} />
                    <span className={milestone.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                      {milestone.title}
                    </span>
                  </div>
                  {milestone.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(milestone.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>{tasks.filter(t => t.status === 'done').length} of {tasks.length} completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    task.status === 'done' ? 'bg-success/10' : 'bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={cn(
                      "w-4 h-4",
                      task.status === 'done' ? 'text-success' : 'text-muted-foreground'
                    )} />
                    <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.effort_minutes && (
                      <Badge variant="outline" className="text-xs">
                        {task.effort_minutes}m
                      </Badge>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
