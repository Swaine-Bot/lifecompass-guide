import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Target, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  { value: '1', label: 'Critical - Do this first' },
  { value: '2', label: 'High - Important for this quarter' },
  { value: '3', label: 'Medium - Nice to achieve' },
  { value: '4', label: 'Low - Someday goal' },
];

export default function NewGoal() {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

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

      // Create initial milestones based on goal
      if (goal) {
        await supabase.from('milestones').insert([
          { goal_id: goal.id, title: 'Define clear success criteria', status: 'today' },
          { goal_id: goal.id, title: 'Identify first action step', status: 'this_week' },
          { goal_id: goal.id, title: 'Set up tracking system', status: 'backlog' },
        ]);

        // Create initial task
        await supabase.from('tasks').insert({
          user_id: user.id,
          goal_id: goal.id,
          title: `Review and refine "${formData.title}" goal`,
          status: 'today',
          effort_minutes: 15,
        });
      }

      toast.success('Goal created successfully!');
      navigate('/goals');
    } catch (err) {
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-bold">New Goal</h1>
          <p className="text-muted-foreground">Define what you want to achieve</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Goal Details
            </CardTitle>
            <CardDescription>
              Be specific about what success looks like
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Run a marathon, Launch my side business"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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
                <Label htmlFor="priority">Priority</Label>
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
              <Label htmlFor="target_date">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success_metric">Success Metric</Label>
              <Input
                id="success_metric"
                placeholder="How will you know you've achieved this?"
                value={formData.success_metric}
                onChange={(e) => setFormData({ ...formData, success_metric: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why">Why This Matters</Label>
              <Textarea
                id="why"
                placeholder="What's the deeper reason behind this goal?"
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints & Challenges</Label>
              <Textarea
                id="constraints"
                placeholder="What obstacles might you face?"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
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
                disabled={loading || !formData.title.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Goal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
