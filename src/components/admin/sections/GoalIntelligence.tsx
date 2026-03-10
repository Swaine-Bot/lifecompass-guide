import { Target } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ThresholdGuard } from '../ThresholdGuard';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['hsl(43,74%,52%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)', 'hsl(280,60%,55%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)', 'hsl(200,50%,60%)', 'hsl(160,60%,45%)'];

export function GoalIntelligence({ data }: { data: AdminAnalytics }) {
  const { goals } = data;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Goal Intelligence"
        description="Aggregated goal themes and categories · No private goal text displayed"
        icon={Target}
        privacyLevel="anonymous"
      />

      <ThresholdGuard count={goals.totalGoals}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">GOAL CATEGORIES</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={goals.categories} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {goals.categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">GOAL STATUS DISTRIBUTION</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goals.statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion rates by category */}
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">COMPLETION RATE BY CATEGORY</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {goals.categories.filter(c => c.count >= 3).map((cat) => (
                <div key={cat.name} className="rounded-lg border border-border/30 bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">{cat.name}</p>
                  <p className="text-lg font-bold text-foreground">{cat.completionRate.toFixed(0)}%</p>
                  <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${cat.completionRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ThresholdGuard>
    </div>
  );
}
