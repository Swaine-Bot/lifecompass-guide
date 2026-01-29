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
import { ArrowLeft, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { habitSchema, validateWithSchema, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '@/lib/validation';

const colors = [
  '#D4AF37', // Gold
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#F97316', // Orange
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EF4444', // Red
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

export default function NewHabit() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    target_value: '',
    metric_unit: '',
    color: colors[0],
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data
    const validation = validateWithSchema(habitSchema, formData);
    if (!validation.success) {
      toast.error('error' in validation ? validation.error : 'Validation failed');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          frequency: formData.frequency as 'daily' | 'weekly' | 'custom',
          target_value: formData.target_value ? parseFloat(formData.target_value) : null,
          metric_unit: formData.metric_unit || null,
          color: formData.color,
        });

      if (error) throw error;

      toast.success('Habit created!');
      navigate('/habits');
    } catch (err) {
      toast.error('Failed to create habit. Please try again.');
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
          <h1 className="font-serif text-2xl font-bold">New Habit</h1>
          <p className="text-muted-foreground">Build a routine that sticks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Habit Details
            </CardTitle>
            <CardDescription>
              Start small and build consistency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Habit Name * <span className="text-muted-foreground text-xs">({formData.title.length}/{MAX_TITLE_LENGTH})</span></Label>
              <Input
                id="title"
                placeholder="e.g., Morning meditation, Read 20 pages"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, MAX_TITLE_LENGTH) })}
                maxLength={MAX_TITLE_LENGTH}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground text-xs">({formData.description.length}/{MAX_DESCRIPTION_LENGTH})</span></Label>
              <Textarea
                id="description"
                placeholder="What does this habit look like when done well?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_value">Target (optional)</Label>
                <Input
                  id="target_value"
                  type="number"
                  placeholder="e.g., 10, 30, 100"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric_unit">Unit (optional)</Label>
                <Input
                  id="metric_unit"
                  placeholder="e.g., minutes, pages, reps"
                  value={formData.metric_unit}
                  onChange={(e) => setFormData({ ...formData, metric_unit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all",
                      formData.color === color && "ring-2 ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color, '--tw-ring-color': color } as React.CSSProperties}
                  />
                ))}
              </div>
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
                  'Create Habit'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
