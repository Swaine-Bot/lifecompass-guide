import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: ReactNode;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <Card variant="glass" className={cn('p-3.5 text-center group hover-lift', className)}>
      <div className="text-2xl font-bold text-primary font-serif">{value}</div>
      <div className="section-label mt-0.5">{label}</div>
    </Card>
  );
}
