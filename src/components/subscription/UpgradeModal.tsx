import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Crown, Sparkles, Clock, Brain, Users, BarChart3, LogIn } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: 'threshold' | 'feature' | 'manual';
}

const PREMIUM_BENEFITS = [
  { icon: Sparkles, label: 'Multi-phase life access' },
  { icon: Brain, label: 'Deep AI mentorship with memory' },
  { icon: Clock, label: 'Long-range planning tools' },
  { icon: Users, label: 'Community features' },
  { icon: BarChart3, label: 'Advanced analytics & insights' },
];

export function UpgradeModal({ open, onOpenChange, trigger = 'manual' }: UpgradeModalProps) {
  const { microMovesCount } = useSubscription();
  const { t } = useLanguage();

  const getTitle = () => {
    if (trigger === 'threshold') {
      return "You've Shown Real Dedication";
    }
    return "Premium Features";
  };

  const getDescription = () => {
    if (trigger === 'threshold') {
      return `You've completed ${microMovesCount} micro-moves — an incredible milestone. These features are available with an active LifeStack subscription.`;
    }
    return "Access all life phases, deeper AI mentorship, and tools for long-term transformation with an active subscription.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">{getTitle()}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {PREMIUM_BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground/90">{benefit.label}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Active subscription required</p>
                <p className="text-sm text-muted-foreground">
                  Log in with an active LifeStack account to access these features.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          LifeStack is an account-based life companion platform.
        </p>
      </DialogContent>
    </Dialog>
  );
}
