import { useSubscription } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressToPaywallProps {
  className?: string;
  showLabel?: boolean;
}

export function ProgressToPaywall({ className, showLabel = true }: ProgressToPaywallProps) {
  const { microMovesCount, config, isPremium, hasReachedThreshold } = useSubscription();

  // Don't show for premium users
  if (isPremium) return null;

  const progress = Math.min((microMovesCount / config.microMovesThreshold) * 100, 100);
  const remaining = Math.max(config.microMovesThreshold - microMovesCount, 0);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Micro-moves
          </span>
          <span className="font-medium">
            {microMovesCount} / {config.microMovesThreshold}
          </span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
      {showLabel && !hasReachedThreshold && (
        <p className="text-xs text-muted-foreground">
          {remaining} more to unlock your next chapter
        </p>
      )}
      {hasReachedThreshold && (
        <p className="text-xs text-primary font-medium">
          ✨ You're ready to deepen your commitment
        </p>
      )}
    </div>
  );
}
