import { useNavigate } from 'react-router-dom';
import { Target, Flame, Zap, Calendar, BookOpen, Users, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuggestedAction } from '@/services/contextualActionEngine';
import { buildActionUrl } from '@/services/contextualActionEngine';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Flame,
  Zap,
  Calendar,
  BookOpen,
  Users,
  PenLine,
};

interface ContextualActionsProps {
  actions: SuggestedAction[];
  className?: string;
  /** Compact mode for inline use (e.g. inside mentor messages) */
  compact?: boolean;
}

/**
 * Renders contextual cross-feature action chips.
 * Used by Mentor messages, Goal detail, and other surfaces
 * to suggest relevant next-step features.
 */
export function ContextualActions({ actions, className, compact = false }: ContextualActionsProps) {
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'mt-2', className)}>
      {actions.map((action) => {
        const Icon = ICON_MAP[action.icon] || Zap;
        return (
          <button
            key={action.type}
            onClick={(e) => {
              e.stopPropagation();
              navigate(buildActionUrl(action));
            }}
            title={action.description}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border transition-colors',
              'text-[11px] font-medium tracking-wide',
              compact
                ? 'px-2.5 py-1 bg-white/[0.04] border-white/[0.08] text-foreground/70 hover:text-primary hover:border-primary/20 hover:bg-primary/[0.06]'
                : 'px-3 py-1.5 bg-white/[0.03] border-white/[0.06] text-foreground/60 hover:text-primary hover:border-primary/15 hover:bg-primary/[0.05]'
            )}
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
