import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ActionRowProps {
  children: ReactNode;
  className?: string;
  /** Horizontal alignment of action items */
  justify?: 'start' | 'end' | 'between' | 'center';
}

/**
 * Flex row for groups of small action buttons (save, share, archive, etc).
 *
 * @example
 * ```tsx
 * <ActionRow justify="end">
 *   <Button variant="ghost" size="icon-sm"><Share2 /></Button>
 *   <Button variant="ghost" size="icon-sm"><Bookmark /></Button>
 * </ActionRow>
 * ```
 *
 * **Do NOT** write ad-hoc `flex items-center gap-1` rows for action groups.
 */
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
