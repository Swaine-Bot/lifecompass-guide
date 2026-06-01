import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { goalSchema, validateWithSchema, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/validation';
import { GoalDeclarationPrompt } from '@/components/viral/GoalDeclarationPrompt';
import { usePlaybookGenerator } from '@/hooks/usePlaybookGenerator';
import { PlaybookPreviewModal } from '@/components/playbook/PlaybookPreviewModal';
import { useMentorSpirit } from '@/contexts/MentorSpiritContext';

const categories = [
  { value: 'health', label: 'Health & Fitness' },
  { value: 'career', label: 'Career & Work' },
  { value: 'money', label: 'Money & Wealth' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'mindset', label: 'Mindset & Growth' },
  { value: 'legacy', label: 'Legacy & Purpose' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: '1', label: 'Critical — Do this first' },
  { value: '2', label: 'High — Important this quarter' },
  { value: '3', label: 'Medium — Nice to achieve' },
  { value: '4', label: 'Low — Someday goal' },
];

export default function NewGoal() {
  const [loading, setLoading] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [savedGoalId, setSavedGoalId] = useState<string | null>(null);
  const [savedGoalTitle, setSavedGoalTitle] = useState('');
  const [savedGoalCategory, setSavedGoalCategory] = useState('');
  const [showPlaybookOffer, setShowPlaybookOffer] = useState(false);
  const [savingPlaybook, setSavingPlaybook] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    target_date: '',
    priority: '2',
    success_metric: '',
    why: '',
    constraints: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { generating, preview, generateFromGoal, savePlaybook, dismiss } = usePlaybookGenerator();

  // Prefill from URL params (e.g. from Mentor contextual actions)
  useEffect(() => {
    const title = searchParams.get('title');
    const category = searchParams.get('category');
    if (title || category) {
      setFormData(prev => ({
        ...prev,
        ...(title && { title }),
        ...(category && { category }),
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validation = validateWithSchema(goalSchema, formData);
    if (!validation.success) {
      toast.error('error' in validation ? validation.error : 'Validation failed');
      return;
    }

    setLoading(true);
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: formData.title,
          category: formData.category || null,
          target_date: formData.target_date || null,
          priority: parseInt(formData.priority),
          success_metric: formData.success_metric || null,
          why: formData.why || null,
          constraints: formData.constraints || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      if (goal) {
        await supabase.from('milestones').insert([
          { goal_id: goal.id, title: 'Define clear success criteria', status: 'today' },
          { goal_id: goal.id, title: 'Identify first action step', status: 'this_week' },
          { goal_id: goal.id, title: 'Set up tracking system', status: 'backlog' },
        ]);

        await supabase.from('tasks').insert({
          user_id: user.id,
          goal_id: goal.id,
          title: `Review and refine "${formData.title}" goal`,
          status: 'today',
          effort_minutes: 15,
        });

        setSavedGoalId(goal.id);
      }

      toast.success('Goal created successfully!');
      summonSpirit('goal_created');
      setSavedGoalTitle(formData.title);
      setSavedGoalCategory(formData.category);
      setShowPlaybookOffer(true);
      setShowDeclaration(true);
    } catch (err) {
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlaybook = async () => {
    await generateFromGoal({
      id: savedGoalId || '',
      title: formData.title,
      category: formData.category,
      success_metric: formData.success_metric,
      why: formData.why,
      constraints: formData.constraints,
      target_date: formData.target_date,
    });
  };

  const handleSavePlaybook = async (tasks: { title: string; description: string; effort_minutes: number }[]) => {
    if (!preview) return;
    setSavingPlaybook(true);
    const success = await savePlaybook(
      { ...preview, tasks },
      { goalId: savedGoalId || undefined, sourceType: 'goal' }
    );
    setSavingPlaybook(false);
    if (success) {
      setShowPlaybookOffer(false);
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Declaration Prompt */}
      {showDeclaration && (
        <GoalDeclarationPrompt
          goalTitle={savedGoalTitle}
          goalCategory={savedGoalCategory}
          targetDate={formData.target_date}
          onDismiss={() => { setShowDeclaration(false); if (!showPlaybookOffer) navigate('/goals'); }}
        />
      )}

      {/* Playbook Offer */}
      {showPlaybookOffer && !preview && (
        <Card variant="glass" className="border-primary/20 animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Build your action playbook?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Let AI Mentor create a step-by-step plan for "{savedGoalTitle}"</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="gold"
                size="sm"
                className="gap-1.5"
                onClick={handleGeneratePlaybook}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Generate Playbook</>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowPlaybookOffer(false); navigate('/goals'); }}
                disabled={generating}
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playbook Preview Modal */}
      {preview && (
        <PlaybookPreviewModal
          open={!!preview}
          title={preview.playbook_title}
          tasks={preview.tasks}
          saving={savingPlaybook}
          onSave={handleSavePlaybook}
          onDismiss={() => { dismiss(); setShowPlaybookOffer(false); navigate('/goals'); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">New Goal</h1>
            <p className="text-sm text-muted-foreground">Define what you want to achieve</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Essential — Goal Title (prominent) */}
        <Card variant="glass">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground">
                Goal Title <span className="text-primary">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Run a marathon, Launch my side business"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, MAX_TITLE_LENGTH) })}
                maxLength={MAX_TITLE_LENGTH}
                className="text-base"
                required
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.title.length}/{MAX_TITLE_LENGTH}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date" className="text-xs uppercase tracking-widest text-muted-foreground">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Deeper context — quieter section */}
        <Card variant="surface">
          <CardContent className="p-5 space-y-5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/85 font-medium">Deeper Context</p>

            <div className="space-y-2">
              <Label htmlFor="success_metric" className="text-xs uppercase tracking-widest text-muted-foreground">
                Success Metric
              </Label>
              <Input
                id="success_metric"
                placeholder="How will you know you've achieved this?"
                value={formData.success_metric}
                onChange={(e) => setFormData({ ...formData, success_metric: e.target.value.slice(0, MAX_SHORT_TEXT_LENGTH) })}
                maxLength={MAX_SHORT_TEXT_LENGTH}
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.success_metric.length}/{MAX_SHORT_TEXT_LENGTH}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="why" className="text-xs uppercase tracking-widest text-muted-foreground">
                Why This Matters
              </Label>
              <Textarea
                id="why"
                placeholder="What's the deeper reason behind this goal?"
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={3}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.why.length}/{MAX_DESCRIPTION_LENGTH}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints" className="text-xs uppercase tracking-widest text-muted-foreground">
                Constraints & Challenges
              </Label>
              <Textarea
                id="constraints"
                placeholder="What obstacles might you face?"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={2}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.constraints.length}/{MAX_DESCRIPTION_LENGTH}</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-3 pt-2 pb-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            className="flex-1"
            disabled={loading || !formData.title.trim() || showPlaybookOffer}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Goal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
