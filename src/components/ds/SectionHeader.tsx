import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Section title — serif semibold */
  title: string;
  /** Optional icon rendered in icon-orb-sm */
  icon?: LucideIcon;
  /** Counter or short label shown as a section-label badge */
  counter?: number | string;
  /** Right-aligned action (link, button, control) */
  action?: ReactNode;
  /** Use muted style for sub-sections (smaller, uppercase, tracked) */
  muted?: boolean;
  className?: string;
}

/**
 * Inline section divider with optional icon, counter, and action.
 *
 * @example
 * ```tsx
 * <SectionHeader title="Active Goals" icon={Target} counter={3} />
 * <SectionHeader title="History" muted action={<Button size="sm">View all</Button>} />
 * ```
 *
 * **Do NOT** write manual flex section headers — always use SectionHeader.
 */
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
