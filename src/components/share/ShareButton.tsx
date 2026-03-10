import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUniversalShare, type ShareSource } from '@/hooks/useUniversalShare';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  source: ShareSource;
  variant?: 'icon' | 'button' | 'ghost';
  size?: 'sm' | 'default';
  className?: string;
}

export function ShareButton({ source, variant = 'icon', size = 'sm', className }: ShareButtonProps) {
  const { openShareStudio } = useUniversalShare();

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn('gap-1.5', className)}
        onClick={() => openShareStudio(source)}
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn('text-muted-foreground hover:text-foreground', className)}
      onClick={() => openShareStudio(source)}
      aria-label="Share"
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
}
