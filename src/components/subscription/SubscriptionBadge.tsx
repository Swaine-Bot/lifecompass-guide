import { useSubscription } from '@/contexts/SubscriptionContext';
import { Crown, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function SubscriptionBadge({ className, showLabel = true }: SubscriptionBadgeProps) {
  const { tier, isFounder } = useSubscription();

  const config = {
    free: {
      icon: User,
      label: 'Free',
      className: 'bg-muted/50 text-muted-foreground border-muted',
    },
    pro: {
      icon: Crown,
      label: 'Pro',
      className: 'bg-primary/10 text-primary border-primary/30',
    },
    founder: {
      icon: Star,
      label: 'Founder',
      className: 'bg-primary/20 text-primary border-primary/50 gold-glow',
    },
  };

  const { icon: Icon, label, className: badgeClass } = config[tier];

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        badgeClass,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{label}</span>}
    </div>
  );
}
