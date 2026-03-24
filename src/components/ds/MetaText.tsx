import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetaTextProps {
  children: ReactNode;
  /** 'default' = 11px (.meta-text), 'xs' = 9px (.meta-text-xs) */
  size?: 'default' | 'xs';
  className?: string;
}

/**
 * Styled span for secondary metadata: timestamps, counters, helpers.
 *
 * @example
 * ```tsx
 * <MetaText>3 days ago</MetaText>
 * <MetaText size="xs">12 items</MetaText>
 * ```
 */
export function MetaText({ children, size = 'default', className }: MetaTextProps) {
  return (
    <span className={cn(size === 'xs' ? 'meta-text-xs' : 'meta-text', className)}>
      {children}
    </span>
  );
}

/* ── SectionLabel ────────────────────────────────────────── */

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Tracked uppercase label for category headings and small dividers.
 * Uses the `.section-label` utility (10px, 0.12em tracking).
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return <span className={cn('section-label', className)}>{children}</span>;
}

/* ── SourceBadge ─────────────────────────────────────────── */

interface SourceBadgeProps {
  children: ReactNode;
  /** 'muted' reduces opacity for less prominent sources */
  variant?: 'default' | 'muted';
  className?: string;
}

/**
 * Pill badge for origin/source labels (AI, Playbook, Mentor, etc).
 *
 * @example
 * ```tsx
 * <SourceBadge>AI Generated</SourceBadge>
 * <SourceBadge variant="muted">From Playbook</SourceBadge>
 * ```
 */
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

/* ── CategoryChip ────────────────────────────────────────── */

interface CategoryChipProps {
  children: ReactNode;
  className?: string;
}

/** Small bordered chip for categories and tags. */
export function CategoryChip({ children, className }: CategoryChipProps) {
  return <span className={cn('category-chip', className)}>{children}</span>;
}

/* ── StatusBadge ─────────────────────────────────────────── */

interface StatusBadgeProps {
  children: ReactNode;
  className?: string;
}

/** Colored pill for status indicators (active, paused, completed). */
export function StatusBadge({ children, className }: StatusBadgeProps) {
  return <span className={cn('status-badge', className)}>{children}</span>;
}
