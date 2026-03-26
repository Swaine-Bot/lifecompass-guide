import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, RefreshCw } from 'lucide-react';
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
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary/40" />
          <Label className="text-[11px] font-medium text-white/55 cursor-pointer">AI Insight</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {STYLES.map((s) => (
              <button key={s.id} onClick={() => handleStyleChange(s.id)}
                className={cn(
                  'px-3 py-1.5 text-[9px] font-medium transition-all duration-400',
                  style === s.id ? 'text-primary/60' : 'text-white/18 hover:text-white/30'
                )}
                style={{ borderRadius: 999 }}>
                {s.label}
              </button>
            ))}
          </div>

          {insight ? (
            <div className="py-3">
              <p className="text-[11px] text-white/55 leading-relaxed italic">"{insight}"</p>
              <button onClick={() => generateInsight()} disabled={loading}
                className="mt-2 text-[9px] text-white/20 hover:text-white/40 flex items-center gap-1 transition-colors">
                <RefreshCw className={cn('w-2.5 h-2.5', loading && 'animate-spin')} />
                {loading ? 'Generating…' : 'Regenerate'}
              </button>
            </div>
          ) : loading ? (
            <div className="py-3 flex items-center gap-2">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-primary/30" />
              <span className="text-[9px] text-white/25">Generating…</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
