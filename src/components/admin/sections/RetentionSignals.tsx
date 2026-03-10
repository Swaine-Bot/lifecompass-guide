import { Activity } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ThresholdGuard } from '../ThresholdGuard';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['hsl(43,74%,52%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)', 'hsl(280,60%,55%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)'];

const lifePhaseLabels: Record<string, string> = {
  student_early_career: 'Student/Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

export function RetentionSignals({ data }: { data: AdminAnalytics }) {
  const { retention } = data;

  const lifePhaseData = retention.lifePhaseDistribution.map(d => ({
    ...d,
    name: lifePhaseLabels[d.name] || d.name,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="User Base & Retention Signals"
        description="Aggregated cohort demographics and subscription health"
        icon={Activity}
        privacyLevel="aggregated"
      />

      <ThresholdGuard count={retention.lifePhaseDistribution.reduce((s, d) => s + d.count, 0)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Phase */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">LIFE PHASE DISTRIBUTION</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifePhaseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Breakdown */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">SUBSCRIPTION TIERS</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={retention.subscriptionBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="count"
                    label={({ tier, count }) => `${tier}: ${count}`}>
                    {retention.subscriptionBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Country Distribution */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">GEOGRAPHIC DISTRIBUTION</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={retention.countryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {retention.countryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ThresholdGuard>
    </div>
  );
}
