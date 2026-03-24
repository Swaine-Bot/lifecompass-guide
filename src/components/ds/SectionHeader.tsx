import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  counter?: number | string;
  action?: ReactNode;
  muted?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  counter,
  action,
  muted,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="icon-orb-sm">
            <Icon />
          </div>
        )}
        <h2
          className={cn(
            'font-serif text-base font-semibold tracking-tight',
            muted && 'text-sm text-muted-foreground/40 uppercase tracking-wider'
          )}
        >
          {title}
        </h2>
        {counter !== undefined && (
          <span className="section-label ml-1">{counter}</span>
        )}
      </div>
      {action}
    </div>
  );
}
