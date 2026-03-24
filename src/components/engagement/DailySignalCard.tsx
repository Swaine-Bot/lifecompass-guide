import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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

const signalTypeLabels: Record<string, string> = {
  strategic_insight: '🎯 Strategic Insight',
  reflection: '🪞 Reflection',
  encouragement: '💪 Challenge',
  pattern_observation: '📊 Pattern Observed',
  growth_suggestion: '🌱 Growth Suggestion',
};

export function DailySignalCard({ signal, loading, onReveal }: DailySignalCardProps) {
  const [revealed, setRevealed] = useState(false);

  if (loading) {
    return (
      <Card variant="gold" className="overflow-hidden">
        <CardContent className="p-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Preparing your Daily Signal...</span>
        </CardContent>
      </Card>
    );
  }

  if (!signal) return null;

  const handleReveal = () => {
    setRevealed(true);
    onReveal();
  };

  return (
    <Card variant="gold" className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-primary/80 font-semibold">
              Daily Signal
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {signalTypeLabels[signal.signal_type] || signal.signal_type}
          </span>
        </div>

        {!revealed && !signal.is_read ? (
          <Button
            variant="glass-gold"
            className="w-full mt-2"
            onClick={handleReveal}
          >
            Tap to reveal today's signal
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-sm leading-relaxed mt-2">{signal.content}</p>
              {signal.suggested_action && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs uppercase tracking-wider text-primary/60 font-medium mb-1">
                    Suggested Move
                  </p>
                  <p className="text-sm font-medium">{signal.suggested_action}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
