import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStatePanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyStatePanel({
  icon: Icon,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: EmptyStatePanelProps) {
  return (
    <div className={cn('text-center py-16 px-6', className)}>
      <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border/30 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-7 h-7 text-primary/40" />
      </div>
      <h3 className="font-serif text-lg font-semibold mb-2 text-foreground/90">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mb-6">
        {description}
      </p>
      {(primaryCta || secondaryCta) && (
        <div className="flex items-center justify-center gap-3">
          {primaryCta && (
            <Button variant="gold" size="sm" onClick={primaryCta.onClick}>
              {primaryCta.label}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="outline" size="sm" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
