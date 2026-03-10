import { BarChart3 } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ThresholdGuard } from '../ThresholdGuard';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

export function BehavioralAnalytics({ data }: { data: AdminAnalytics }) {
  const { behavioral } = data;
  const totalFeatureInteractions = behavioral.featureUsage.reduce((s, f) => s + f.total, 0);

  const adoptionData = Object.entries(behavioral.featureAdoption).map(([name, pct]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    adoption: pct,
    fill: `hsl(var(--primary) / ${0.4 + pct / 200})`,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Behavioral Analytics"
        description="Aggregated user behavior patterns · No individual clickstreams"
        icon={BarChart3}
        privacyLevel="aggregated"
      />

      <ThresholdGuard count={totalFeatureInteractions}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Usage */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">MOST USED FEATURES</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavioral.featureUsage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis dataKey="feature" type="category" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Adoption Radial */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">FEATURE ADOPTION RATE (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={14} data={adoptionData}>
                  <RadialBar background dataKey="adoption" />
                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active vs Passive */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">ACTIVE VS PASSIVE USERS</h3>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex-1">
                <div className="h-4 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(behavioral.activeVsPassive.active / (behavioral.activeVsPassive.active + behavioral.activeVsPassive.passive || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Active: {behavioral.activeVsPassive.active}</span>
                  <span>Passive: {behavioral.activeVsPassive.passive}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Active = users with 3+ feature interactions this month
            </p>
          </div>

          {/* Session Depth */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">SESSION DEPTH DISTRIBUTION</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavioral.sessionDepth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ThresholdGuard>
    </div>
  );
}
