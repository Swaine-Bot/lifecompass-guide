import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  /** Primary display value (number, string, or ReactNode like an icon) */
  value: ReactNode;
  /** Tracked uppercase descriptor below the value */
  label: string;
  className?: string;
}

/**
 * Glass-variant card for displaying a single metric.
 *
 * @example
 * ```tsx
 * <StatCard value={12} label="Active Goals" />
 * <StatCard value="87%" label="Completion Rate" />
 * ```
 *
 * **Do NOT** build one-off stat displays with raw `<Card>` or divs.
 */
export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <Card variant="glass" className={cn('p-3.5 text-center group hover-lift', className)}>
      <div className="text-2xl font-bold text-primary font-serif">{value}</div>
      <div className="section-label mt-0.5">{label}</div>
    </Card>
  );
}
