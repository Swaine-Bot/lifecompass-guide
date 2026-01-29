import { Crown, Sparkles, Clock, Brain, Users, BarChart3, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import lifestackLogo from '@/assets/lifestack-logo.png';

const PREMIUM_BENEFITS = [
  { icon: Sparkles, label: 'Multi-phase life access' },
  { icon: Brain, label: 'Deep AI mentorship with memory' },
  { icon: Clock, label: 'Long-range planning tools' },
  { icon: Users, label: 'Community features' },
  { icon: BarChart3, label: 'Advanced analytics & insights' },
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Full access, billed monthly',
    features: ['All premium features', 'Cancel anytime', 'Priority support'],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Pro Annual',
    price: '$79',
    period: '/year',
    description: 'Best value — save 34%',
    features: ['All premium features', '2 months free', 'Priority support'],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'founder',
    name: 'Founder',
    price: '$79',
    period: ' one-time',
    description: 'Lifetime access, locked forever',
    features: ['All premium features', 'Lifetime access', 'Founder badge', 'Early access to new features'],
    highlight: false,
    badge: 'Limited',
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { config, openCheckout, isPremium, tier } = useSubscription();

  const handleCheckout = (planId: 'monthly' | 'yearly' | 'founder') => {
    openCheckout(planId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={lifestackLogo} alt="LifeStack" className="h-8 w-8" />
            <span className="text-xl font-serif font-semibold">LifeStack</span>
          </div>
          {user ? (
            <a href="/" className="text-sm text-primary hover:underline">
              Back to App →
            </a>
          ) : (
            <a href="/auth" className="text-sm text-primary hover:underline">
              Sign In →
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
          <Crown className="w-4 h-4" />
          <span>Unlock Your Full Potential</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          Transform Your Life with LifeStack Pro
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Access all life phases, deeper AI mentorship, and powerful tools for long-term transformation.
        </p>

        {isPremium && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <Check className="w-4 h-4" />
            <span>You're already a {tier === 'founder' ? 'Founder' : 'Pro'} member!</span>
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {PREMIUM_BENEFITS.map((benefit, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm"
            >
              <benefit.icon className="w-4 h-4 text-primary" />
              <span>{benefit.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.highlight 
                  ? 'border-primary shadow-md scale-105' 
                  : 'border-border/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    plan.highlight 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan.id as 'monthly' | 'yearly' | 'founder')}
                  disabled={isPremium}
                >
                  {isPremium ? 'Already Subscribed' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4">Secure Payment via Gumroad</h2>
          <p className="text-muted-foreground mb-6">
            All payments are processed securely through Gumroad, a trusted platform used by millions of creators. 
            Your payment information is never stored on our servers.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Instant access
            </span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>30-day guarantee</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LifeStack. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
