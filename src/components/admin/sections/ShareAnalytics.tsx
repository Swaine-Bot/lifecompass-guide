import { BarChart3, Share2, Layers, Award, Globe } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { StatCard } from '../StatCard';

interface ShareAnalyticsData {
  totalCardsGenerated: number;
  totalSharesInitiated: number;
  topCardType: string;
  topPlatform: string;
  topDomains: { domain: string; count: number }[];
  cardTypeBreakdown: { type: string; count: number }[];
}

export function ShareAnalytics({ data }: { data?: ShareAnalyticsData | null }) {
  const d = data || {
    totalCardsGenerated: 0,
    totalSharesInitiated: 0,
    topCardType: 'N/A',
    topPlatform: 'N/A',
    topDomains: [],
    cardTypeBreakdown: [],
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Share Analytics"
        description="Privacy-respecting aggregate sharing metrics · No personal data exposed"
        icon={BarChart3}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cards Generated" value={d.totalCardsGenerated} icon={Layers} />
        <StatCard title="Shares Initiated" value={d.totalSharesInitiated} icon={Share2} />
        <StatCard title="Top Card Type" value={d.topCardType} icon={Award} />
        <StatCard title="Top Platform" value={d.topPlatform} icon={Globe} />
      </div>

      {d.cardTypeBreakdown.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">CARD TYPE BREAKDOWN</h3>
          <div className="space-y-3">
            {d.cardTypeBreakdown.map((item) => {
              const max = Math.max(...d.cardTypeBreakdown.map((i) => i.count));
              const pct = max > 0 ? (item.count / max) * 100 : 0;
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{item.type.replace(/_/g, ' ')}</span>
                    <span className="text-foreground font-medium">{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {d.topDomains.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">TOP SHARED LIFE DOMAINS</h3>
          <div className="flex flex-wrap gap-2">
            {d.topDomains.map((dom) => (
              <span key={dom.domain} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                {dom.domain} · {dom.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
