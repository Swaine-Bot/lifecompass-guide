import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Check, X, GripVertical, Clock, Loader2 } from 'lucide-react';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';

interface GeneratedTask {
  title: string;
  description: string;
  effort_minutes: number;
}

interface PlaybookPreviewModalProps {
  open: boolean;
  title: string;
  tasks: GeneratedTask[];
  saving: boolean;
  onSave: (tasks: GeneratedTask[]) => void;
  onDismiss: () => void;
}

export function PlaybookPreviewModal({ open, title, tasks: initialTasks, saving, onSave, onDismiss }: PlaybookPreviewModalProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof GeneratedTask, value: string | number) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Review and edit your AI-generated playbook before saving.
            <AiContentLabel label="AI Generated" variant="inline" />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {tasks.map((task, i) => (
            <div
              key={i}
              className="group flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/20 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="text-xs font-medium text-primary/70 w-5 text-center">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {editingIndex === i ? (
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(i, 'title', e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setEditingIndex(i)}
                  >
                    {task.title}
                  </p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Clock className="w-3 h-3" />
                  {task.effort_minutes}m
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeTask(i)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">All tasks removed. Dismiss to cancel.</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onDismiss} disabled={saving}>
            Dismiss
          </Button>
          <Button
            variant="gold"
            onClick={() => onSave(tasks)}
            disabled={tasks.length === 0 || saving}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" /> Add {tasks.length} Moves</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
