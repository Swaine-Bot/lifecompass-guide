import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Plus, Target } from 'lucide-react';

interface PlacementRow {
  supported_categories: string[] | null;
  supported_playbook_tags: string[] | null;
  partner_tier: string | null;
  priority_weight: number | null;
  availability: boolean | null;
  deep_link: string | null;
  cta_text: string | null;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
}

const TIERS = ['trial', 'standard', 'preferred', 'strategic'] as const;

export function PartnerPlacementConfig({ partnerId }: { partnerId: string }) {
  const [row, setRow] = useState<PlacementRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catInput, setCatInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('partners')
        .select(
          'supported_categories, supported_playbook_tags, partner_tier, priority_weight, availability, deep_link, cta_text, campaign_start_date, campaign_end_date',
        )
        .eq('id', partnerId)
        .maybeSingle();
      setRow(
        (data as any) || {
          supported_categories: [],
          supported_playbook_tags: [],
          partner_tier: 'standard',
          priority_weight: 50,
          availability: true,
          deep_link: null,
          cta_text: null,
          campaign_start_date: null,
          campaign_end_date: null,
        },
      );
      setLoading(false);
    })();
  }, [partnerId]);

  if (loading || !row) return <div className="h-32 rounded-lg bg-secondary/30 animate-pulse" />;

  const update = <K extends keyof PlacementRow>(key: K, value: PlacementRow[K]) =>
    setRow((prev) => (prev ? { ...prev, [key]: value } : prev));

  const addChip = (kind: 'cat' | 'tag') => {
    const raw = (kind === 'cat' ? catInput : tagInput).trim().toLowerCase();
    if (!raw) return;
    if (kind === 'cat') {
      const arr = row.supported_categories || [];
      if (!arr.includes(raw)) update('supported_categories', [...arr, raw]);
      setCatInput('');
    } else {
      const arr = row.supported_playbook_tags || [];
      if (!arr.includes(raw)) update('supported_playbook_tags', [...arr, raw]);
      setTagInput('');
    }
  };

  const removeChip = (kind: 'cat' | 'tag', value: string) => {
    if (kind === 'cat') {
      update('supported_categories', (row.supported_categories || []).filter((v) => v !== value));
    } else {
      update('supported_playbook_tags', (row.supported_playbook_tags || []).filter((v) => v !== value));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({
          supported_categories: row.supported_categories || [],
          supported_playbook_tags: row.supported_playbook_tags || [],
          partner_tier: row.partner_tier || 'standard',
          priority_weight: Math.max(0, Math.min(100, row.priority_weight ?? 50)),
          availability: row.availability !== false,
          deep_link: row.deep_link || null,
          cta_text: row.cta_text || null,
          campaign_start_date: row.campaign_start_date || null,
          campaign_end_date: row.campaign_end_date || null,
        } as any)
        .eq('id', partnerId);
      if (error) throw error;
      toast.success('Placement config saved');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary/70" />
            <h3 className="text-sm font-semibold">Placement Targeting</h3>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Supported Categories</Label>
            <p className="text-[10px] text-muted-foreground">
              Playbook steps whose <code>partner_categories</code> include any of these will match.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(row.supported_categories || []).map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 pr-1">
                  {c}
                  <button onClick={() => removeChip('cat', c)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={catInput}
                onChange={(e) => setCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip('cat'))}
                placeholder="e.g. fitness, nutrition, wealth"
                className="h-8 text-xs"
              />
              <Button size="sm" variant="outline" onClick={() => addChip('cat')} className="gap-1">
                <Plus className="w-3 h-3" />Add
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Playbook Tags (bonus match)</Label>
            <div className="flex flex-wrap gap-1.5">
              {(row.supported_playbook_tags || []).map((t) => (
                <Badge key={t} variant="outline" className="gap-1 pr-1">
                  {t}
                  <button onClick={() => removeChip('tag', t)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip('tag'))}
                placeholder="e.g. new-parent, first-time-investor"
                className="h-8 text-xs"
              />
              <Button size="sm" variant="outline" onClick={() => addChip('tag')} className="gap-1">
                <Plus className="w-3 h-3" />Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold">Priority & Availability</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Partner Tier</Label>
              <select
                value={row.partner_tier || 'standard'}
                onChange={(e) => update('partner_tier', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority Weight (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={row.priority_weight ?? 50}
                onChange={(e) => update('priority_weight', parseInt(e.target.value || '0', 10))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
            <div>
              <Label className="text-xs font-medium">Availability</Label>
              <p className="text-[10px] text-muted-foreground">Off = temporarily paused across all placements</p>
            </div>
            <Switch
              checked={row.availability !== false}
              onCheckedChange={(v) => update('availability', v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Start</Label>
              <Input
                type="date"
                value={row.campaign_start_date || ''}
                onChange={(e) => update('campaign_start_date', e.target.value || null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign End</Label>
              <Input
                type="date"
                value={row.campaign_end_date || ''}
                onChange={(e) => update('campaign_end_date', e.target.value || null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold">Deep Link & CTA</h3>
          <div className="space-y-1.5">
            <Label className="text-xs">Deep Link (native / web URL)</Label>
            <Input
              value={row.deep_link || ''}
              onChange={(e) => update('deep_link', e.target.value)}
              placeholder="https://partner.app/onboarding or partner://route"
            />
            <p className="text-[10px] text-muted-foreground">Falls back to Default CTA URL, then Website.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CTA Text Override</Label>
            <Input
              value={row.cta_text || ''}
              onChange={(e) => update('cta_text', e.target.value)}
              placeholder="Start free trial"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? 'Saving…' : 'Save Placement Config'}
      </Button>
    </div>
  );
}
