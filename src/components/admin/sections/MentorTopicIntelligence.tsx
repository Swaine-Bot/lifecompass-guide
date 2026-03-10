import { MessageSquare, Shield } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ThresholdGuard } from '../ThresholdGuard';
import { AdminAnalytics } from '@/services/adminAnalyticsService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['hsl(43,74%,52%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)', 'hsl(280,60%,55%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)', 'hsl(200,50%,60%)', 'hsl(160,60%,45%)'];

export function MentorTopicIntelligence({ data }: { data: AdminAnalytics }) {
  const { mentorTopics } = data;

  if (!mentorTopics) {
    return (
      <div className="space-y-8">
        <SectionHeader title="Mentor Chat Topic Intelligence" description="Topic analysis unavailable — insufficient data" icon={MessageSquare} privacyLevel="privacy-safe" />
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-12 text-center">
          <p className="text-muted-foreground text-sm">Not enough mentor conversations for topic analysis.</p>
        </div>
      </div>
    );
  }

  const topicData = mentorTopics.topTopics.map(t => ({ name: t.topic, value: t.percentage }));
  const sentimentData = [
    { name: 'Positive', value: mentorTopics.sentimentBreakdown.positive },
    { name: 'Neutral', value: mentorTopics.sentimentBreakdown.neutral },
    { name: 'Negative', value: mentorTopics.sentimentBreakdown.negative },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Mentor Chat Topic Intelligence"
        description="Anonymous topic categories · Raw private conversations are not displayed"
        icon={MessageSquare}
        privacyLevel="privacy-safe"
      />

      {/* Privacy Disclaimer */}
      <div className="rounded-lg border border-info/20 bg-info/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-info mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Mentor chat analytics are aggregated into anonymous topic categories. Raw private conversations are not displayed here. All insights are derived from anonymized, aggregated analysis.
        </p>
      </div>

      <ThresholdGuard count={mentorTopics.totalConversations}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Conversations</p>
            <p className="text-2xl font-bold font-serif text-foreground">{mentorTopics.totalConversations}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold font-serif text-foreground">{mentorTopics.totalMessages}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Messages/Chat</p>
            <p className="text-2xl font-bold font-serif text-foreground">{mentorTopics.totalConversations > 0 ? (mentorTopics.totalMessages / mentorTopics.totalConversations).toFixed(1) : 0}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Topics Identified</p>
            <p className="text-2xl font-bold font-serif text-foreground">{mentorTopics.topTopics.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic Distribution */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">TOP DISCUSSION TOPICS</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">CONVERSATION SENTIMENT</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}>
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--muted-foreground))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Themes */}
        {mentorTopics.keyThemes.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">KEY THEMES · AGGREGATED MARKET SIGNAL</h3>
            <div className="flex flex-wrap gap-2">
              {mentorTopics.keyThemes.map((theme) => (
                <span key={theme} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </ThresholdGuard>
    </div>
  );
}
