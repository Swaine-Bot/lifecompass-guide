import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiContentLabelProps {
  label?: string;
  variant?: 'chip' | 'inline' | 'subtle';
  className?: string;
}

export function AiContentLabel({ label = 'AI-generated', variant = 'chip', className }: AiContentLabelProps) {
  if (variant === 'inline') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 font-medium",
        className
      )}>
        <Sparkles className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  }

  if (variant === 'subtle') {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-[10px] text-primary/50 italic",
        className
      )}>
        <Sparkles className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
      "bg-primary/10 text-primary/70 border border-primary/10",
      className
    )}>
      <Sparkles className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
