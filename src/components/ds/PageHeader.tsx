import { ReactNode } from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Lucide icon rendered inside an icon-orb (or icon-orb-sm when compact) */
  icon?: LucideIcon;
  /** Page title — renders as the only <h1> on the page */
  title: string;
  /** Tracked uppercase subtitle below the title (auto-indented 42px) */
  subtitle?: string;
  /** Right-aligned action slot (buttons, controls) */
  actions?: ReactNode;
  /** true = browser back, string = navigate to specific path */
  back?: boolean | string;
  /** Smaller title + orb for detail/sub-pages */
  compact?: boolean;
  /** Custom left element instead of icon orb (e.g. avatar, logo) */
  leading?: ReactNode;
  className?: string;
}

/**
 * Standard page header for all top-level and detail screens.
 *
 * @example
 * ```tsx
 * <PageHeader icon={Home} title="Today" subtitle="Your daily command center" />
 * <PageHeader icon={Target} title="Goal" back compact actions={<Button>Edit</Button>} />
 * ```
 *
 * **Do NOT** write ad-hoc `<h1>` + icon layouts — always use PageHeader.
 */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  back,
  compact,
  leading,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === 'string') {
      navigate(back);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 mb-1">
          {back && (
            <button
              onClick={handleBack}
              className="settings-icon shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          {leading}
          {Icon && !leading && (
            <div className={compact ? 'icon-orb-sm' : 'icon-orb'}>
              <Icon />
            </div>
          )}
          <h1
            className={cn(
              'font-serif font-bold tracking-tight',
              compact ? 'text-lg' : 'text-xl md:text-2xl'
            )}
          >
            {title}
          </h1>
        </div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </div>
  );
}
