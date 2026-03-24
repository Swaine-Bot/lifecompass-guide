import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetaTextProps {
  children: ReactNode;
  size?: 'default' | 'xs';
  className?: string;
}

export function MetaText({ children, size = 'default', className }: MetaTextProps) {
  return (
    <span className={cn(size === 'xs' ? 'meta-text-xs' : 'meta-text', className)}>
      {children}
    </span>
  );
}

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return <span className={cn('section-label', className)}>{children}</span>;
}

interface SourceBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'muted';
  className?: string;
}

export function SourceBadge({ children, variant = 'default', className }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        'source-badge',
        variant === 'muted' && 'bg-secondary/50 text-muted-foreground/40',
        className
      )}
    >
      {children}
    </span>
  );
}

interface CategoryChipProps {
  children: ReactNode;
  className?: string;
}

export function CategoryChip({ children, className }: CategoryChipProps) {
  return <span className={cn('category-chip', className)}>{children}</span>;
}

interface StatusBadgeProps {
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ children, className }: StatusBadgeProps) {
  return <span className={cn('status-badge', className)}>{children}</span>;
}
