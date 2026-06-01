import { ShieldAlert } from 'lucide-react';

interface ThresholdGuardProps {
  count: number;
  minimum?: number;
  children: React.ReactNode;
}

export function ThresholdGuard({ count, minimum = 5, children }: ThresholdGuardProps) {
  if (count < minimum) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <ShieldAlert className="h-8 w-8 text-muted-foreground/70" />
        <p className="text-sm text-muted-foreground max-w-xs">
          Not enough aggregated data to display this insight safely.
        </p>
        <span className="text-[10px] text-muted-foreground/70">
          Minimum {minimum} data points required for privacy compliance.
        </span>
      </div>
    );
  }
  return <>{children}</>;
}
