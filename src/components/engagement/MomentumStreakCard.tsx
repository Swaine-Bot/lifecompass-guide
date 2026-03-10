import { Card } from '@/components/ui/card';
import { Flame, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MomentumStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  shieldAvailable: boolean;
}

export function MomentumStreakCard({ currentStreak, longestStreak, shieldAvailable }: MomentumStreakCardProps) {
  return (
    <Card variant="glass" className="p-4 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Flame className={cn(
          "w-6 h-6",
          currentStreak >= 7 ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="text-2xl font-bold text-primary">{currentStreak}</span>
      </div>
      <div className="text-xs text-muted-foreground">Day Streak</div>
      <div className="flex items-center justify-center gap-1 mt-1">
        {shieldAvailable && (
          <Shield className="w-3 h-3 text-primary/60" />
        )}
        <span className="text-[10px] text-muted-foreground">
          Best: {longestStreak}
        </span>
      </div>
    </Card>
  );
}
