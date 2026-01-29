import { useState } from 'react';
import { useSubscription, PremiumFeature } from '@/contexts/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedFeatureProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  className?: string;
  previewContent?: React.ReactNode;
  teaser?: string;
}

export function LockedFeature({ 
  feature, 
  children, 
  className,
  previewContent,
  teaser = "Unlock with Pro"
}: LockedFeatureProps) {
  const { canAccessFeature, isPremium } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <>
      <div 
        className={cn(
          "relative group cursor-pointer",
          className
        )}
        onClick={() => setShowUpgrade(true)}
      >
        {/* Blurred preview of actual content */}
        <div className="blur-[2px] opacity-60 pointer-events-none select-none">
          {previewContent || children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent rounded-xl flex flex-col items-center justify-center gap-2 transition-all group-hover:from-background/95">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
            {teaser}
          </span>
        </div>
      </div>

      <UpgradeModal 
        open={showUpgrade} 
        onOpenChange={setShowUpgrade}
        trigger="feature"
      />
    </>
  );
}

// Simple lock icon for inline use
interface LockBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function LockBadge({ onClick, className }: LockBadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
        "bg-primary/10 text-primary border border-primary/20",
        "cursor-pointer hover:bg-primary/20 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <Lock className="w-3 h-3" />
      <span>Pro</span>
    </div>
  );
}
