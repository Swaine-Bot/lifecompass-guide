import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';

interface DailySignalCardProps {
  signal: {
    content: string;
    signal_type: string;
    suggested_action: string | null;
    is_read: boolean;
  } | null;
  loading: boolean;
  onReveal: () => void;
}

const signalTypeLabels: Record<string, { label: string; icon: string }> = {
  strategic_insight: { label: 'Strategic Insight', icon: '🎯' },
  reflection: { label: 'Reflection', icon: '🪞' },
  encouragement: { label: 'Challenge', icon: '💪' },
  pattern_observation: { label: 'Pattern Observed', icon: '📊' },
  growth_suggestion: { label: 'Growth Suggestion', icon: '🌱' },
};

export function DailySignalCard({ signal, loading, onReveal }: DailySignalCardProps) {
  const [revealed, setRevealed] = useState(false);

  if (loading) {
    return (
      <Card variant="gold" className="overflow-hidden">
        <CardContent className="p-5 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground/60">Preparing your Daily Signal…</span>
        </CardContent>
      </Card>
    );
  }

  if (!signal) return null;

  const handleReveal = () => {
    setRevealed(true);
    onReveal();
  };

  const typeInfo = signalTypeLabels[signal.signal_type] || { label: signal.signal_type, icon: '✨' };

  return (
    <Card variant="gold" className="overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-primary/70 font-semibold">
              Daily Signal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AiContentLabel variant="chip" />
          </div>
        </div>

        {!revealed && !signal.is_read ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground/50 mb-3">A signal has arrived for today</p>
            <Button
              variant="glass-gold"
              className="px-8"
              onClick={handleReveal}
            >
              Reveal Signal
              <ChevronDown className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-3"
            >
              {/* Type badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{typeInfo.icon}</span>
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{typeInfo.label}</span>
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed font-serif">{signal.content}</p>

              {/* Suggested Action */}
              {signal.suggested_action && (
                <div className="p-3.5 rounded-lg bg-primary/[0.06] border border-primary/10">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-primary/50 font-medium mb-1.5">
                    Suggested Move
                  </p>
                  <p className="text-sm font-medium leading-snug">{signal.suggested_action}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
