import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Check, Clock, Loader2, Download, Share2, Target, Flame, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ds';
import { useEnvironment } from '@/contexts/SensoryContext';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { cn } from '@/lib/utils';

interface PlaybookTask {
  title: string;
  description: string;
  effort_minutes: number;
}

interface PlaybookContent {
  purpose?: string;
  why?: string;
  action_types?: string[];
  goal_template?: {
    title: string;
    category?: string;
    success_metric?: string;
  };
  habit_template?: {
    title: string;
    description?: string;
    domain?: string;
    frequency?: string;
  };
  tasks?: PlaybookTask[];
  moves?: PlaybookTask[];
}

interface Playbook {
  id: string;
  title: string;
  description: string | null;
  phase: string | null;
  category: string | null;
  content_json: PlaybookContent | null;
}

const phaseLabels: Record<string, string> = {
  student_early_career: 'Student / Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

export default function PlaybookDetail() {
  useEnvironment('library');
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openShareStudio } = useUniversalShare();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [creatingHabit, setCreatingHabit] = useState(false);
  const [goalCreated, setGoalCreated] = useState(false);
  const [habitCreated, setHabitCreated] = useState(false);

  useEffect(() => {
    if (id) fetchPlaybook();
  }, [id]);

  const fetchPlaybook = async () => {
    const { data } = await supabase
      .from('library_playbooks')
      .select('id, title, description, phase, category, content_json')
      .eq('id', id!)
      .single();

    if (data) {
      setPlaybook(data as Playbook);
    }

    const { data: installData } = await supabase
      .from('playbook_installs')
      .select('id')
      .eq('playbook_id', id!)
      .maybeSingle();

    setInstalled(!!installData);
    setLoading(false);
  };

  const getMoves = (): PlaybookTask[] => {
    const content = playbook?.content_json;
    return content?.moves || content?.tasks || [];
  };

  const addSingleTask = async (task: PlaybookTask, index: number) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: task.title,
      description: task.description,
      effort_minutes: task.effort_minutes,
      status: 'today',
      created_by: 'user',
      source_type: 'playbook',
      is_one_thing: false,
    });

    if (!error) {
      setAddedTasks(prev => new Set(prev).add(index));
      toast.success(`"${task.title}" added to Micro-Moves`);
    } else {
      toast.error('Failed to add task');
    }
  };

  const installFullPlaybook = async () => {
    if (!user || !playbook) return;
    const moves = getMoves();
    if (moves.length === 0) return;
    setInstalling(true);

    try {
      await supabase.from('playbook_installs').insert({
        playbook_id: playbook.id,
        user_id: user.id,
      } as any);

      const tasks = moves.map((t, i) => ({
        user_id: user.id,
        title: t.title,
        description: t.description,
        effort_minutes: t.effort_minutes,
        status: 'today' as const,
        created_by: 'user',
        source_type: 'playbook',
        sequence_order: i + 1,
        is_one_thing: false,
      }));

      const { error } = await supabase.from('tasks').insert(tasks as any);
      if (error) throw error;

      setInstalled(true);
      setAddedTasks(new Set(moves.map((_, i) => i)));
      toast.success(`Playbook "${playbook.title}" installed with ${tasks.length} moves!`);
    } catch {
      toast.error('Failed to install playbook');
    } finally {
      setInstalling(false);
    }
  };

  const addAsGoal = async () => {
    if (!user || !playbook?.content_json?.goal_template) return;
    setCreatingGoal(true);
    try {
      const tmpl = playbook.content_json.goal_template;
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: tmpl.title,
        category: tmpl.category || playbook.category || null,
        success_metric: tmpl.success_metric || null,
        why: playbook.content_json.why || null,
        status: 'active',
      });
      if (error) throw error;
      setGoalCreated(true);
      toast.success(`Goal "${tmpl.title}" created!`);
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setCreatingGoal(false);
    }
  };

  const addAsHabit = async () => {
    if (!user || !playbook?.content_json?.habit_template) return;
    setCreatingHabit(true);
    try {
      const tmpl = playbook.content_json.habit_template;
      const domainMap: Record<string, string> = {
        physical: 'physical', mind: 'mind', wealth: 'wealth',
        relationships: 'relationships', legacy: 'legacy',
      };
      const domain = domainMap[tmpl.domain || ''] || 'mind';
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        title: tmpl.title,
        description: tmpl.description || null,
        domain: domain as any,
        frequency: (tmpl.frequency === 'weekly' ? 'weekly' : 'daily') as any,
      });
      if (error) throw error;
      setHabitCreated(true);
      toast.success(`Habit "${tmpl.title}" created!`);
    } catch {
      toast.error('Failed to create habit');
    } finally {
      setCreatingHabit(false);
    }
  };

  const handleShare = () => {
    if (!playbook) return;
    const moves = getMoves();
    openShareStudio({
      type: 'goal_progress',
      title: playbook.title,
      subtitle: playbook.content_json?.purpose || playbook.description || '',
      statValue: String(moves.length),
      statLabel: 'Action Items',
      id: playbook.id,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Playbook not found</p>
        <Button variant="ghost" onClick={() => navigate('/library')} className="mt-4">Back to Library</Button>
      </div>
    );
  }

  const content = playbook.content_json;
  const moves = getMoves();
  const actionTypes = content?.action_types || [];
  const hasGoal = actionTypes.includes('goal') && content?.goal_template;
  const hasHabit = actionTypes.includes('habit') && content?.habit_template;
  const hasMoves = actionTypes.includes('moves') && moves.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      <PageHeader
        icon={BookOpen}
        title={playbook.title}
        back="/library"
        compact
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        {playbook.phase && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground/70 uppercase tracking-wider">
            {phaseLabels[playbook.phase] || playbook.phase}
          </span>
        )}
        {playbook.category && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/[0.08] text-primary/80 uppercase tracking-wider">
            {playbook.category}
          </span>
        )}
        {moves.length > 0 && (
          <span className="text-[10px] text-muted-foreground/70">
            {moves.length} action items
          </span>
        )}
      </div>

      {/* Purpose */}
      {content?.purpose && (
        <Card variant="glass">
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-foreground/90">{content.purpose}</p>
          </CardContent>
        </Card>
      )}

      {/* Why it matters */}
      {content?.why && (
        <div className="px-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-primary/60 font-medium mb-1.5">Why this matters</p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{content.why}</p>
        </div>
      )}

      {/* Action Pathways */}
      {(hasGoal || hasHabit || hasMoves) && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/85 font-medium px-1">
            Add to Your System
          </p>
          <div className="grid gap-2">
            {hasGoal && (
              <button
                onClick={addAsGoal}
                disabled={goalCreated || creatingGoal}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-[18px] border transition-all text-left",
                  goalCreated
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card/60 border-white/[0.06] hover:border-primary/20 hover:bg-card/75"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  goalCreated ? "bg-primary/15" : "bg-primary/10"
                )}>
                  {goalCreated ? <Check className="w-4 h-4 text-primary" /> : <Target className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{goalCreated ? 'Goal Created' : 'Add as Goal'}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {content?.goal_template?.title}
                    {content?.goal_template?.success_metric && ` · ${content.goal_template.success_metric}`}
                  </p>
                </div>
                {creatingGoal && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
              </button>
            )}

            {hasHabit && (
              <button
                onClick={addAsHabit}
                disabled={habitCreated || creatingHabit}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-[18px] border transition-all text-left",
                  habitCreated
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card/60 border-white/[0.06] hover:border-primary/20 hover:bg-card/75"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  habitCreated ? "bg-primary/15" : "bg-primary/10"
                )}>
                  {habitCreated ? <Check className="w-4 h-4 text-primary" /> : <Flame className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{habitCreated ? 'Habit Created' : 'Add as Habit'}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {content?.habit_template?.title}
                    {content?.habit_template?.frequency && ` · ${content.habit_template.frequency}`}
                  </p>
                </div>
                {creatingHabit && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Install All Moves */}
      {moves.length > 0 && (
        <Button
          variant={installed ? "outline" : "gold"}
          className="w-full h-12 rounded-2xl"
          onClick={installFullPlaybook}
          disabled={installed || installing}
        >
          {installing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Installing...</>
          ) : installed ? (
            <><Check className="w-4 h-4 mr-2" /> All Moves Installed</>
          ) : (
            <><Download className="w-4 h-4 mr-2" /> Install All {moves.length} Micro Moves</>
          )}
        </Button>
      )}

      {/* Action Items */}
      {moves.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/85 font-medium px-1">
            Micro Moves
          </p>
          {moves.map((task, i) => {
            const isAdded = addedTasks.has(i);
            return (
              <Card key={i} variant="glass" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-primary/60 w-5 text-center pt-0.5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
                      <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{task.description}</p>
                      {task.effort_minutes > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/70">
                          <Clock className="w-3 h-3" />
                          {task.effort_minutes} min
                        </div>
                      )}
                    </div>
                    <Button
                      variant={isAdded ? "outline" : "gold-outline"}
                      size="sm"
                      className="shrink-0 rounded-full text-[11px] h-8"
                      onClick={() => !isAdded && addSingleTask(task, i)}
                      disabled={isAdded}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                      {isAdded ? 'Added' : 'Add'}
                    </Button>
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
