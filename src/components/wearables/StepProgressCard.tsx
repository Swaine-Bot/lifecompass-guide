import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Footprints, TrendingUp } from 'lucide-react';
import { useWearables } from '@/hooks/useWearables';

interface StepProgressCardProps {
  stepGoal?: number;
  compact?: boolean;
}

export function StepProgressCard({ stepGoal = 10000, compact = false }: StepProgressCardProps) {
  const { todaySteps, hasConnectedDevice, loading } = useWearables();

  if (loading || (!hasConnectedDevice && todaySteps.steps === 0)) return null;

  const pct = Math.min(100, Math.round((todaySteps.steps / stepGoal) * 100));
  const remaining = Math.max(0, stepGoal - todaySteps.steps);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
        <Footprints className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold">{todaySteps.steps.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">/ {stepGoal.toLocaleString()}</span>
          </div>
          <Progress value={pct} className="h-1.5 mt-1" />
        </div>
      </div>
    );
  }

  return (
    <Card variant="glass" className="border-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Today's Steps</span>
          </div>
          {pct >= 100 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">{todaySteps.steps.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ {stepGoal.toLocaleString()}</span>
        </div>
        <Progress value={pct} className="h-2 mt-2" />
        {remaining > 0 ? (
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {remaining.toLocaleString()} steps to go
          </p>
        ) : (
          <p className="text-[10px] text-emerald-400 mt-1.5 font-medium">
            ✓ Goal reached!
          </p>
        )}
        {todaySteps.provider && (
          <p className="text-[9px] text-muted-foreground/60 mt-1">
            via {todaySteps.provider.replace('_', ' ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
