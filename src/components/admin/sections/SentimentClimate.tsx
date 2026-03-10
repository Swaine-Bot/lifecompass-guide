import { Heart } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ThresholdGuard } from '../ThresholdGuard';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SentimentClimate({ data }: { data: AdminAnalytics }) {
  const { sentiment } = data;
  const moodLabels = ['', 'Very Low', 'Low', 'Below Avg', 'Neutral-Low', 'Neutral', 'Neutral-High', 'Above Avg', 'Good', 'Great', 'Excellent'];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Sentiment & Emotional Climate"
        description="Platform emotional climate · Aggregated user tone · Privacy-safe sentiment signal"
        icon={Heart}
        privacyLevel="privacy-safe"
      />

      <ThresholdGuard count={sentiment.sampleSize}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Platform Avg Mood</p>
            <p className="text-5xl font-bold font-serif text-primary">{sentiment.avgMood.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">out of 10</p>
            <p className="text-xs text-muted-foreground mt-3">Based on {sentiment.sampleSize} aggregated entries</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Avg Energy Level</p>
            <p className="text-5xl font-bold font-serif text-accent">{sentiment.energyAvg.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">out of 10</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Sentiment Balance</p>
            <div className="space-y-3">
              {[
                { label: 'Positive (7-10)', pct: sentiment.moodDistribution.filter(m => m.mood >= 7).reduce((s, m) => s + m.count, 0) / sentiment.sampleSize * 100 },
                { label: 'Neutral (4-6)', pct: sentiment.moodDistribution.filter(m => m.mood >= 4 && m.mood < 7).reduce((s, m) => s + m.count, 0) / sentiment.sampleSize * 100 },
                { label: 'Negative (1-3)', pct: sentiment.moodDistribution.filter(m => m.mood < 4).reduce((s, m) => s + m.count, 0) / sentiment.sampleSize * 100 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{item.label}</span>
                    <span>{item.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Distribution Chart */}
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">MOOD DISTRIBUTION · AGGREGATED</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentiment.moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mood" tickFormatter={(v) => moodLabels[v] || `${v}`} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} labelFormatter={(v) => `Mood: ${v}/10`} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ThresholdGuard>
    </div>
  );
}
