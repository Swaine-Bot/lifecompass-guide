import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { habitSchema, validateWithSchema, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, LIFE_DOMAINS, DOMAIN_LABELS, DOMAIN_COLORS, type LifeDomain } from '@/lib/validation';

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
    domain: '' as string,
    target_value: '',
    metric_unit: '',
    color: '#D4AF37',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // Derive color from domain selection
  const selectedDomain = formData.domain as LifeDomain;
  const effectiveColor = selectedDomain && DOMAIN_COLORS[selectedDomain] ? DOMAIN_COLORS[selectedDomain] : formData.color;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const dataToValidate = { ...formData, color: effectiveColor };
    const validation = validateWithSchema(habitSchema, dataToValidate);
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
          domain: formData.domain as LifeDomain,
          target_value: formData.target_value ? parseFloat(formData.target_value) : null,
          metric_unit: formData.metric_unit || null,
          color: effectiveColor,
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
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">New Habit</h1>
            <p className="text-sm text-muted-foreground">Build a routine that sticks</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Primary — Name, Domain & Schedule */}
        <Card variant="glass">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground">
                Habit Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Morning meditation, Read 20 pages"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, MAX_TITLE_LENGTH) })}
                maxLength={MAX_TITLE_LENGTH}
                className="text-base"
                required
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.title.length}/{MAX_TITLE_LENGTH}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this habit look like when done well?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={2}
                className="resize-none"
              />
              <p className="text-[11px] text-muted-foreground/70 text-right">{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Domain <span className="text-primary">*</span>
              </Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData({ ...formData, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a life domain" />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {DOMAIN_LABELS[domain]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Frequency</Label>
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
          </CardContent>
        </Card>

        {/* Secondary — Tracking */}
        <Card variant="surface">
          <CardContent className="p-5 space-y-5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">Tracking</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_value" className="text-xs uppercase tracking-widest text-muted-foreground">Target</Label>
                <Input
                  id="target_value"
                  type="number"
                  placeholder="e.g., 10, 30, 100"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric_unit" className="text-xs uppercase tracking-widest text-muted-foreground">Unit</Label>
                <Input
                  id="metric_unit"
                  placeholder="e.g., minutes, pages"
                  value={formData.metric_unit}
                  onChange={(e) => setFormData({ ...formData, metric_unit: e.target.value })}
                />
              </div>
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
            disabled={loading || !formData.title.trim() || !formData.domain}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Habit'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
