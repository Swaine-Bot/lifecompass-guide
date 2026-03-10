import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Dumbbell, Brain, Wallet, Users, Crown } from 'lucide-react';

type LifeDomain = 'physical' | 'mind' | 'wealth' | 'relationships' | 'legacy';

interface DomainXP {
  domain: LifeDomain;
  total_xp: number;
  level: number;
}

interface XPDomainBarsProps {
  domains: DomainXP[];
  xpForNextLevel: (level: number) => number;
  xpForLevel: (level: number) => number;
}

const domainConfig: Record<LifeDomain, { icon: any; label: string; color: string }> = {
  physical: { icon: Dumbbell, label: 'Physical', color: 'text-green-400' },
  mind: { icon: Brain, label: 'Mind', color: 'text-blue-400' },
  wealth: { icon: Wallet, label: 'Wealth', color: 'text-yellow-400' },
  relationships: { icon: Users, label: 'Relationships', color: 'text-pink-400' },
  legacy: { icon: Crown, label: 'Legacy', color: 'text-purple-400' },
};

export function XPDomainBars({ domains, xpForNextLevel, xpForLevel }: XPDomainBarsProps) {
  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Life Domains</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {domains.map((d) => {
          const config = domainConfig[d.domain];
          const Icon = config.icon;
          const currentLevelXP = xpForLevel(d.level);
          const nextLevelXP = xpForNextLevel(d.level);
          const xpInLevel = d.total_xp - currentLevelXP;
          const xpNeeded = nextLevelXP - currentLevelXP;
          const progress = xpNeeded > 0 ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 0;

          return (
            <div key={d.domain} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", config.color)} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Lvl {d.level} · {d.total_xp} XP
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
