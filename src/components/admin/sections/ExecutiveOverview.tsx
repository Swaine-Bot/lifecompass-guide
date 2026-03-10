import { Users, TrendingUp, Clock, Target, MessageSquare, Sparkles, DollarSign, Activity } from 'lucide-react';
import { StatCard } from '../StatCard';
import { SectionHeader } from '../SectionHeader';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export function ExecutiveOverview({ data }: { data: AdminAnalytics }) {
  const { overview, userGrowth } = data;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Executive Overview"
        description="High-level platform intelligence"
        icon={Sparkles}
        privacyLevel="aggregated"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={overview.totalUsers} subtitle={`${overview.activeUsersMonth} active this month`} icon={Users} />
        <StatCard title="Monthly Revenue" value={`$${overview.monthlyRevenue.toFixed(2)}`} subtitle={`${overview.conversionRate.toFixed(1)}% conversion`} icon={DollarSign} trend="up" />
        <StatCard title="Avg Session Time" value={formatDuration(overview.avgSessionsPerUser)} subtitle="Per active user" icon={Clock} />
        <StatCard title="Feature Engagement" value={overview.totalMentorChats + overview.totalFeedPosts} subtitle={`${overview.totalMentorChats} chats · ${overview.totalFeedPosts} posts`} icon={Activity} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="DAU" value={overview.activeUsersToday} icon={TrendingUp} />
        <StatCard title="WAU" value={overview.activeUsersWeek} icon={TrendingUp} />
        <StatCard title="Avg Goals/User" value={overview.avgGoalsPerUser.toFixed(1)} icon={Target} />
        <StatCard title="Avg Habits/User" value={overview.avgHabitsPerUser.toFixed(1)} icon={MessageSquare} />
      </div>

      {/* Growth Chart */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">USER GROWTH · 30 DAYS</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                stroke="hsl(var(--border))"
              />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
