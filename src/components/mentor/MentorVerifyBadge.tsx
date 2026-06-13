/**
 * Opt-in fact-check / soundness badge for an assistant mentor message.
 * Tap "Verify" → calls the `mentor-verify` edge function and renders the
 * verdict inline. Keeps cost down by being user-triggered, not automatic.
 */
import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Verdict = 'verified' | 'caveats' | 'unsupported';
interface Result {
  verdict: Verdict;
  confidence: number;
  summary: string;
  issues: string[];
}

const STYLES: Record<Verdict, { label: string; cls: string; Icon: any }> = {
  verified:    { label: 'Verified',   cls: 'text-emerald-300/90 hover:text-emerald-200',   Icon: ShieldCheck },
  caveats:     { label: 'With caveats', cls: 'text-amber-300/90 hover:text-amber-200',     Icon: ShieldAlert },
  unsupported: { label: 'Unsupported', cls: 'text-rose-300/90 hover:text-rose-200',         Icon: ShieldX },
};

interface Props {
  assistantText: string;
  userQuestion?: string;
}

export function MentorVerifyBadge({ assistantText, userQuestion }: Props) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  // Skip very short replies (nothing to check).
  if (!assistantText || assistantText.trim().length < 120) return null;

  const run = async () => {
    if (loading || result) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mentor-verify', {
        body: { assistant: assistantText, user: userQuestion },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as Result);
    } catch (e: any) {
      toast.error(e?.message || 'Could not verify');
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={run}
        disabled={loading}
        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
        aria-label="Fact-check this reply"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        Verify
      </Button>
    );
  }

  const { label, cls, Icon } = STYLES[result.verdict];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-6 px-2 text-[11px] gap-1', cls)}
          aria-label={`Fact-check result: ${label}`}
        >
          <Icon className="w-3 h-3" />
          {label}
          <span className="opacity-60">· {Math.round(result.confidence * 100)}%</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Icon className={cn('w-3.5 h-3.5', cls.split(' ')[0])} />
          {label} · {Math.round(result.confidence * 100)}% confidence
        </div>
        {result.summary && <p className="text-muted-foreground leading-relaxed">{result.summary}</p>}
        {result.issues.length > 0 && (
          <ul className="space-y-1 pl-3 list-disc text-muted-foreground">
            {result.issues.map((i, idx) => <li key={idx}>{i}</li>)}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/40">
          AI fact-check — not a substitute for professional advice.
        </p>
      </PopoverContent>
    </Popover>
  );
}
