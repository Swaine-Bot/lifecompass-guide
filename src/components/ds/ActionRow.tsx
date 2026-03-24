import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ActionRowProps {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'between' | 'center';
}

export function ActionRow({ children, className, justify = 'start' }: ActionRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        justify === 'center' && 'justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}
