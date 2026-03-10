import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-5 transition-all hover:border-primary/20',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold font-serif text-foreground">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
    </div>
  );
}
