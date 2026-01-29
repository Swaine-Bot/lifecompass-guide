import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Crown, Check, Sparkles, Clock, Brain, Users, BarChart3 } from 'lucide-react';

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
  const { config, microMovesCount, openCheckout } = useSubscription();
  const { t } = useLanguage();

  const getTitle = () => {
    if (trigger === 'threshold') {
      return "You're Ready to Deepen Your Commitment";
    }
    return "Unlock Your Full Potential";
  };

  const getDescription = () => {
    if (trigger === 'threshold') {
      return `You've completed ${microMovesCount} micro-moves. This is a rite of passage — you've proven your dedication. Now it's time to invest in your future self.`;
    }
    return "Join LifeStack Pro to access all life phases, deeper AI mentorship, and tools for long-term transformation.";
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

        <div className="grid gap-3 pt-4 border-t border-border/50">
          {/* Founder Tier - Limited Time */}
          <div 
            className="relative p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => openCheckout('founder')}
          >
            <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
              Founder - Limited
            </Badge>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Founder Membership</p>
                <p className="text-sm text-muted-foreground">Price locked forever</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">${config.founderPrice}</p>
                <p className="text-xs text-muted-foreground">/year</p>
              </div>
            </div>
          </div>

          {/* Yearly */}
          <div 
            className="p-4 rounded-xl border border-border/50 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => openCheckout('yearly')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Annual</p>
                <p className="text-sm text-muted-foreground">Save 33%</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${config.yearlyPrice}</p>
                <p className="text-xs text-muted-foreground">/year</p>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div 
            className="p-4 rounded-xl border border-border/30 cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => openCheckout('monthly')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground/80">Monthly</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground/80">${config.monthlyPrice}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Secure checkout via Gumroad. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
