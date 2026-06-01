import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/SensoryContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, Flag, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format, isBefore, isToday, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { choreographedDispatch } from '@/engines/choreographyEngine';
import { useMentorSpirit } from '@/contexts/MentorSpiritContext';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'this_week' | 'today' | 'done';
  due_date: string | null;
  effort_minutes: number | null;
  priority: number;
  tags: any;
  is_one_thing: boolean;
  created_by: string | null;
  playbook_id: string | null;
  created_at: string;
  updated_at: string;
}

const PRIORITY_LABEL: Record<number, string> = {
  1: 'Low', 2: 'Normal', 3: 'High', 4: 'Critical',
};

const PRIORITY_COLOR: Record<number, string> = {
  1: 'text-muted-foreground/70',
  2: 'text-foreground/80',
  3: 'text-amber-400',
  4: 'text-red-400',
};

export default function MicroMoves() {
  useEnvironment('home');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { summon } = useMentorSpirit();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_one_thing', false)
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Could not load Micro Moves');
      console.error(error);
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime sync
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('micro-moves-' + user.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => fetchTasks(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTasks]);

  const grouped = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todayList: Task[] = [];
    const upcoming: Task[] = [];
    const overdue: Task[] = [];
    const completed: Task[] = [];
    for (const t of tasks) {
      if (t.status === 'done') { completed.push(t); continue; }
      if (t.due_date) {
        const d = parseISO(t.due_date);
        if (isToday(d) || t.status === 'today') todayList.push(t);
        else if (isBefore(d, todayStart)) overdue.push(t);
        else upcoming.push(t);
      } else if (t.status === 'today') {
        todayList.push(t);
      } else {
        upcoming.push(t);
      }
    }
    return { todayList, upcoming, overdue, completed };
  }, [tasks]);

  const toggleComplete = async (t: Task) => {
    const newStatus = t.status === 'done' ? 'today' : 'done';
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', t.id);
    if (error) {
      toast.error('Could not update');
      fetchTasks();
      return;
    }
    if (newStatus === 'done') {
      choreographedDispatch('micro_move_complete');
      summon('micro_move_complete');
      toast.success('✓ Completed');
    } else {
      toast('Marked incomplete');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setTasks(prev => prev.filter(x => x.id !== id));
    setDeleteTarget(null);
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); fetchTasks(); }
    else toast.success('Micro Move deleted');
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-fade-in">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const totalActive = grouped.todayList.length + grouped.upcoming.length + grouped.overdue.length;

  return (
    <div className="space-y-5 animate-fade-in min-w-0 overflow-x-hidden pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="settings-icon shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl sm:text-2xl font-bold truncate on-image-title">
            Micro Moves
          </h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground/70">
            {totalActive} active · {grouped.completed.length} done
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      {totalActive > 0 && (
        <Button
          variant="cta"
          size="default"
          className="w-full"
          onClick={() => {
            const activeTasks = [
              ...grouped.overdue,
              ...grouped.todayList,
              ...grouped.upcoming,
            ].slice(0, 12);
            navigate('/mentor', {
              state: {
                actionPlanRequest: {
                  visiblePrompt: 'Help me sequence my Micro Moves into a focused action plan for the days ahead.',
                  goalContext: {
                    title: 'My current Micro Moves',
                    micro_moves: activeTasks.map(t => ({
                      title: t.title,
                      status: t.status,
                      due_date: t.due_date,
                    })),
                  },
                },
              },
            });
          }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask Mentor for Action Plan
        </Button>
      )}

      {totalActive === 0 && grouped.completed.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-10 text-center">
            <Sparkles className="w-7 h-7 mx-auto mb-3 text-primary/60" />
            <p className="font-serif text-base mb-1">No Micro Moves yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Small, deliberate actions compound. Add your first one.
            </p>
            <Button variant="gold" size="sm" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-1" /> Custom Micro Move
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => navigate('/library')}
            >
              Add as New Playbook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Section title="Overdue" tone="danger" tasks={grouped.overdue}
            onToggle={toggleComplete} onEdit={setEditing} onDelete={setDeleteTarget} />
          <Section title="Today" tasks={grouped.todayList}
            onToggle={toggleComplete} onEdit={setEditing} onDelete={setDeleteTarget} />
          <Section title="Upcoming" tasks={grouped.upcoming}
            onToggle={toggleComplete} onEdit={setEditing} onDelete={setDeleteTarget} />
          <Section title="Completed" muted tasks={grouped.completed}
            onToggle={toggleComplete} onEdit={setEditing} onDelete={setDeleteTarget} />
        </>
      )}

      <EditSheet
        open={!!editing || creating}
        task={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => { fetchTasks(); }}
        userId={user?.id}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this Micro Move?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({
  title, tasks, muted, tone, onToggle, onEdit, onDelete,
}: {
  title: string;
  tasks: Task[];
  muted?: boolean;
  tone?: 'danger';
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-2 min-w-0">
      <h2 className={cn(
        'text-[11px] uppercase tracking-[0.14em] font-semibold px-1',
        tone === 'danger' ? 'text-red-400/90' : muted ? 'text-muted-foreground/70' : 'text-muted-foreground/80',
      )}>
        {title} <span className="text-muted-foreground/70">· {tasks.length}</span>
      </h2>
      <div className="space-y-1.5">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} muted={muted} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task, muted, onToggle, onEdit, onDelete,
}: {
  task: Task; muted?: boolean;
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const isDone = task.status === 'done';
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-3 sm:p-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <label
            className="flex items-center gap-2 shrink-0 cursor-pointer select-none pt-0.5 min-h-[44px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isDone}
              onCheckedChange={() => onToggle(task)}
              className="w-5 h-5 shrink-0"
              aria-label={isDone ? 'Mark incomplete' : 'Mark as complete'}
            />
            <span className="text-[10px] uppercase tracking-wider font-medium text-foreground/80 whitespace-nowrap hidden sm:inline">
              {isDone ? 'Completed' : 'Mark as complete'}
            </span>
          </label>
          <button
            onClick={() => onEdit(task)}
            className="flex-1 min-w-0 text-left"
          >
            <p className={cn(
              'text-sm font-medium leading-snug break-words',
              (isDone || muted) && 'line-through text-muted-foreground/60',
            )}>
              {task.title}
            </p>
            {task.description && !isDone && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {task.priority && task.priority !== 2 && (
                <span className={cn('inline-flex items-center gap-1 text-[10px] uppercase tracking-wider', PRIORITY_COLOR[task.priority])}>
                  <Flag className="w-3 h-3" /> {PRIORITY_LABEL[task.priority]}
                </span>
              )}
              {task.due_date && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="w-3 h-3" /> {format(parseISO(task.due_date), 'MMM d')}
                </span>
              )}
              {task.effort_minutes ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Clock className="w-3 h-3" /> ~{task.effort_minutes < 60 ? `${task.effort_minutes} min` : `${Math.round(task.effort_minutes / 60 * 10) / 10}h`}
                </span>
              ) : null}
              {task.created_by === 'ai_mentor' && (
                <span className="source-badge">AI</span>
              )}
            </div>
          </button>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              aria-label="Edit"
              className="settings-icon w-8 h-8"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task)}
              aria-label="Delete"
              className="settings-icon w-8 h-8 hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditSheet({
  open, task, onClose, onSaved, userId,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
}) {
  const isCreate = !task;
  const { summon } = useMentorSpirit();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(2);
  const [dueDate, setDueDate] = useState('');
  const [effort, setEffort] = useState<string>('');
  const [effortUnit, setEffortUnit] = useState<'min' | 'hr'>('min');
  const [status, setStatus] = useState<Task['status']>('today');
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '');
      setDescription(task?.description ?? '');
      setPriority(task?.priority ?? 2);
      setDueDate(task?.due_date ?? '');
      const mins = task?.effort_minutes ?? null;
      if (mins == null) { setEffort(''); setEffortUnit('min'); }
      else if (mins >= 60 && mins % 60 === 0) { setEffort(String(mins / 60)); setEffortUnit('hr'); }
      else { setEffort(String(mins)); setEffortUnit('min'); }
      setStatus(task?.status ?? 'today');
      const tags = Array.isArray(task?.tags) ? task!.tags : [];
      setTagsText(tags.join(', '));
    }
  }, [open, task]);

  const save = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!userId) return;
    setSaving(true);
    const tags = tagsText.split(',').map(s => s.trim()).filter(Boolean);
    const rawEffort = parseFloat(effort);
    const effortMinutes = !effort.trim() || isNaN(rawEffort) || rawEffort <= 0
      ? null
      : Math.max(1, Math.min(600, Math.round(effortUnit === 'hr' ? rawEffort * 60 : rawEffort)));
    const payload = {
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 2000) || null,
      priority,
      due_date: dueDate || null,
      effort_minutes: effortMinutes,
      status,
      tags,
    };
    let error;
    if (isCreate) {
      ({ error } = await supabase.from('tasks').insert({
        ...payload,
        user_id: userId,
        is_one_thing: false,
        created_by: 'user',
      }));
    } else {
      ({ error } = await supabase.from('tasks').update(payload).eq('id', task!.id));
    }
    setSaving(false);
    if (error) { toast.error('Save failed'); return; }
    toast.success(isCreate ? 'Micro Move added' : 'Micro Move updated');
    summon(isCreate ? 'micro_move_created' : 'task_complete');
    onSaved();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isCreate ? 'New Micro Move' : 'Edit Micro Move'}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="mm-title">Title</Label>
            <Input id="mm-title" value={title} onChange={(e) => setTitle(e.target.value)}
              maxLength={200} placeholder="A small, deliberate action…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mm-desc">Description</Label>
            <Textarea id="mm-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={2000} rows={3} placeholder="Optional context or steps" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <Label>Priority</Label>
              <Select value={String(priority)} onValueChange={(v) => setPriority(parseInt(v, 10))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                  <SelectItem value="4">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="mm-due">Due date</Label>
              <Input id="mm-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 min-w-0 col-span-2">
              <Label htmlFor="mm-effort" className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
                Estimated time to complete
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">Optional</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="mm-effort"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={effortUnit === 'hr' ? 10 : 600}
                  step={effortUnit === 'hr' ? 0.25 : 1}
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  placeholder="e.g. 15"
                  className="flex-1"
                />
                <Select value={effortUnit} onValueChange={(v) => setEffortUnit(v as 'min' | 'hr')}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">Minutes</SelectItem>
                    <SelectItem value="hr">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mm-tags">Tags (comma-separated)</Label>
            <Input id="mm-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. health, deep-work" />
          </div>
        </div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="gold" onClick={save} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : isCreate ? 'Create' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
