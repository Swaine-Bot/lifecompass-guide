import { BarChart3, Share2, Layers, Award, Globe } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { StatCard } from '../StatCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ShareAnalyticsData {
  totalCardsGenerated: number;
  totalSharesInitiated: number;
  topCardType: string;
  topPlatform: string;
  topDomains: { domain: string; count: number }[];
  cardTypeBreakdown: { type: string; count: number }[];
  dailyTrend?: { date: string; generated: number; shared: number }[];
  privacyModeUsage?: { mode: string; count: number }[];
  formatBreakdown?: { format: string; count: number }[];
  themeBreakdown?: { theme: string; count: number }[];
}

export function ShareAnalytics({ data }: { data?: ShareAnalyticsData | null }) {
  const d = data || {
    totalCardsGenerated: 0,
    totalSharesInitiated: 0,
    topCardType: 'N/A',
    topPlatform: 'N/A',
    topDomains: [],
    cardTypeBreakdown: [],
    dailyTrend: [],
    privacyModeUsage: [],
    formatBreakdown: [],
    themeBreakdown: [],
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

      {/* Daily Trend */}
      {d.dailyTrend && d.dailyTrend.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">GENERATION & SHARE TRENDS</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Line type="monotone" dataKey="generated" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Generated" />
                <Line type="monotone" dataKey="shared" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Shared" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

      {/* Format & Theme Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {d.formatBreakdown && d.formatBreakdown.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">FORMAT USAGE</h3>
            <div className="flex flex-wrap gap-2">
              {d.formatBreakdown.map((f) => (
                <span key={f.format} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                  {f.format} · {f.count}
                </span>
              ))}
            </div>
          </div>
        )}
        {d.themeBreakdown && d.themeBreakdown.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">THEME USAGE</h3>
            <div className="flex flex-wrap gap-2">
              {d.themeBreakdown.map((t) => (
                <span key={t.theme} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium capitalize">
                  {t.theme.replace(/_/g, ' ')} · {t.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Mode Distribution */}
      {d.privacyModeUsage && d.privacyModeUsage.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">PRIVACY MODE DISTRIBUTION</h3>
          <div className="flex flex-wrap gap-2">
            {d.privacyModeUsage.map((pm) => (
              <span key={pm.mode} className="text-xs bg-secondary text-foreground px-3 py-1.5 rounded-full font-medium capitalize">
                {pm.mode} · {pm.count}
              </span>
            ))}
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
