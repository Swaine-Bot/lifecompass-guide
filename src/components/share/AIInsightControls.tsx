import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type InsightStyle = 'reflective' | 'bold' | 'minimal' | 'motivational' | 'professional';

interface AIInsightControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  insight: string | null;
  onInsightChange: (insight: string | null) => void;
  style: InsightStyle;
  onStyleChange: (style: InsightStyle) => void;
  contentTitle: string;
  contentSubtitle?: string;
  contentType?: string;
}

const STYLES: { id: InsightStyle; label: string }[] = [
  { id: 'reflective', label: 'Reflective' },
  { id: 'bold', label: 'Bold' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'motivational', label: 'Motivational' },
  { id: 'professional', label: 'Professional' },
];

export function AIInsightControls({
  enabled, onToggle, insight, onInsightChange,
  style, onStyleChange, contentTitle, contentSubtitle, contentType,
}: AIInsightControlsProps) {
  const [loading, setLoading] = useState(false);

  const generateInsight = async (selectedStyle?: InsightStyle) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-share-insight', {
        body: {
          title: contentTitle,
          subtitle: contentSubtitle?.slice(0, 200),
          contentType: contentType || 'general',
          style: selectedStyle || style,
        },
      });
      if (error) throw error;
      const text = data?.insight || data?.text;
      if (text) onInsightChange(text);
      else toast.error('Could not generate insight');
    } catch (e) {
      console.error('AI insight error:', e);
      toast.error('AI insight unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (on: boolean) => {
    onToggle(on);
    if (on && !insight) await generateInsight();
  };

  const handleStyleChange = async (s: InsightStyle) => {
    onStyleChange(s);
    if (enabled) await generateInsight(s);
  };

  return (
    <div className="space-y-4">
      <div className="studio-switch-row">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium text-white/75 cursor-pointer">Include AI Insight</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {enabled && (
        <div className="space-y-3 pl-1">
          {/* Style selector */}
          <div className="flex gap-1.5 flex-wrap">
            {STYLES.map((s) => (
              <button key={s.id} onClick={() => handleStyleChange(s.id)}
                className={cn(
                  'studio-option-pill px-3 py-1.5 text-[10px] font-semibold transition-all',
                  style === s.id && 'active'
                )}
                style={{ borderRadius: 999 }}>
                <span className={style === s.id ? 'text-primary' : 'text-white/50'}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Insight preview */}
          {insight ? (
            <div className="studio-glass-tertiary p-4">
              <p className="text-xs text-white/75 leading-relaxed italic">"{insight}"</p>
              <Button variant="ghost" size="sm" onClick={() => generateInsight()} disabled={loading}
                className="mt-2.5 text-[10px] text-white/40 hover:text-white/60 h-7 px-2">
                <RefreshCw className={cn('w-3 h-3 mr-1', loading && 'animate-spin')} />
                {loading ? 'Generating…' : 'Regenerate'}
              </Button>
            </div>
          ) : loading ? (
            <div className="studio-glass-tertiary p-4 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-primary/60" />
              <span className="text-[10px] text-white/40">Generating insight…</span>
            </div>
          ) : null}

          <p className="text-[10px] text-white/25">
            AI insight is optional and will only appear if you choose to include it.
          </p>
        </div>
      )}
    </div>
  );
}
