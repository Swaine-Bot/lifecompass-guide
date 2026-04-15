import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Shield, LayoutDashboard, BarChart3, Heart, MessageSquare,
  Share2, Target, Activity, Lightbulb, Handshake, Lock, ChevronRight,
  Users, TrendingUp, Clock, DollarSign, Sparkles, Brain, Eye,
  Flame, Zap, Globe, Award, FileText, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { StatCard } from '@/components/admin/StatCard';

// ─── Demo Data ────────────────────────────────────────────────────────

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  },
};
const AXIS_TICK = { fontSize: 10, fill: 'hsl(var(--muted-foreground))' };
const GRID_STROKE = 'hsl(var(--border))';
const COLORS = ['hsl(43,74%,52%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)', 'hsl(280,60%,55%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)'];

const userGrowth = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  count: Math.floor(80 + i * 3.2 + Math.sin(i / 3) * 8),
}));

const engagementCycles = [
  { hour: '06:00', sessions: 12 }, { hour: '08:00', sessions: 34 },
  { hour: '10:00', sessions: 28 }, { hour: '12:00', sessions: 22 },
  { hour: '14:00', sessions: 18 }, { hour: '16:00', sessions: 24 },
  { hour: '18:00', sessions: 31 }, { hour: '20:00', sessions: 48 },
  { hour: '22:00', sessions: 42 }, { hour: '00:00', sessions: 15 },
];

const featureUsage = [
  { feature: 'AI Mentor', total: 1247, users: 89 },
  { feature: 'Goals', total: 934, users: 76 },
  { feature: 'Habits', total: 1102, users: 82 },
  { feature: 'Journal', total: 678, users: 54 },
  { feature: 'Share Cards', total: 423, users: 41 },
  { feature: 'Mirror', total: 312, users: 38 },
];

const sessionDepth = [
  { bucket: '< 1 min', count: 18 },
  { bucket: '1–3 min', count: 32 },
  { bucket: '3–10 min', count: 45 },
  { bucket: '10–20 min', count: 28 },
  { bucket: '20+ min', count: 14 },
];

const moodDistribution = [
  { mood: 3, count: 4 }, { mood: 4, count: 8 }, { mood: 5, count: 14 },
  { mood: 6, count: 22 }, { mood: 7, count: 38 }, { mood: 8, count: 31 },
  { mood: 9, count: 18 }, { mood: 10, count: 9 },
];
const moodLabels: Record<number, string> = { 3: 'Low', 4: 'Below Avg', 5: 'Neutral', 6: 'Neutral+', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Peak' };

const domainSentiment = [
  { domain: 'Health', positive: 68, neutral: 22, negative: 10 },
  { domain: 'Wealth', positive: 45, neutral: 35, negative: 20 },
  { domain: 'Productivity', positive: 62, neutral: 28, negative: 10 },
  { domain: 'Relationships', positive: 54, neutral: 30, negative: 16 },
  { domain: 'Legacy', positive: 71, neutral: 24, negative: 5 },
];

const mentorTopics = [
  { name: 'Goal Planning', value: 24 },
  { name: 'Burnout Recovery', value: 18 },
  { name: 'Financial Strategy', value: 16 },
  { name: 'Habit Discipline', value: 14 },
  { name: 'Relationship Health', value: 12 },
  { name: 'Career Transitions', value: 9 },
  { name: 'Purpose & Meaning', value: 7 },
];

const mentorIntentClusters = [
  { tag: 'Recovery-focused', description: 'Users seeking energy & burnout recovery strategies', frequency: 'High', trend: 'Rising' },
  { tag: 'Financial planning', description: 'Month-end financial review and planning queries', frequency: 'Medium', trend: 'Cyclical' },
  { tag: 'Habit formation', description: 'Users building discipline systems for consistency', frequency: 'High', trend: 'Stable' },
  { tag: 'Life transitions', description: 'Career changes, relocations, new life phases', frequency: 'Medium', trend: 'Rising' },
];

const shareCardTypes = [
  { type: 'Streak Achievement', count: 156 },
  { type: 'Goal Milestone', count: 124 },
  { type: 'AI Insight', count: 98 },
  { type: 'Weekly Progress', count: 87 },
  { type: 'Mirror Moment', count: 63 },
];

const shareDomainDistribution = [
  { name: 'Physical', value: 32 },
  { name: 'Mind', value: 24 },
  { name: 'Wealth', value: 18 },
  { name: 'Relationships', value: 14 },
  { name: 'Legacy', value: 12 },
];

const goalCategories = [
  { name: 'Health', count: 89, completionRate: 62 },
  { name: 'Career', count: 76, completionRate: 48 },
  { name: 'Finance', count: 64, completionRate: 55 },
  { name: 'Education', count: 52, completionRate: 71 },
  { name: 'Relationships', count: 41, completionRate: 44 },
  { name: 'Creative', count: 28, completionRate: 38 },
];

const goalStatus = [
  { status: 'Active', count: 187 },
  { status: 'Completed', count: 124 },
  { status: 'Paused', count: 38 },
  { status: 'Abandoned', count: 21 },
];

const domainActivity = [
  { domain: 'Physical', sessions: 342, growth: 12, intensity: 78 },
  { domain: 'Mind', sessions: 298, growth: 8, intensity: 72 },
  { domain: 'Wealth', sessions: 267, growth: 15, intensity: 65 },
  { domain: 'Relationships', sessions: 198, growth: 6, intensity: 58 },
  { domain: 'Legacy', sessions: 156, growth: 22, intensity: 52 },
];

const actionableInsights = [
  {
    type: 'opportunity',
    title: 'Recovery intent surge detected',
    description: 'Mentor queries about burnout recovery increased 34% after high-activity periods. Users in this state show 2.4x higher engagement with wellness recommendations.',
    domains: ['Health', 'Mind'],
    confidence: 87,
  },
  {
    type: 'trend',
    title: 'Month-end financial planning spike',
    description: 'Financial goal check-ins peak during the last 5 days of each month. Users reviewing budgets show 68% higher intent to act on financial recommendations.',
    domains: ['Wealth'],
    confidence: 92,
  },
  {
    type: 'opportunity',
    title: 'Consistency seekers cluster forming',
    description: 'Growing cluster of users building multi-habit routines. These users log 3.1x more sessions and share 4x more achievement cards.',
    domains: ['Productivity', 'Physical'],
    confidence: 79,
  },
  {
    type: 'signal',
    title: 'Life transition acceleration',
    description: 'Career transition conversations rising steadily. Users in transition show heightened openness to new tools, services, and learning resources.',
    domains: ['Career', 'Legacy'],
    confidence: 74,
  },
];

// ─── NAV ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'behavioral', label: 'Behavioral', icon: BarChart3 },
  { id: 'sentiment', label: 'Sentiment', icon: Heart },
  { id: 'mentor', label: 'Mentor AI', icon: MessageSquare },
  { id: 'shares', label: 'Shares', icon: Share2 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'domains', label: 'Domains', icon: Activity },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'partner', label: 'Partner View', icon: Handshake },
  { id: 'privacy', label: 'Trust', icon: Lock },
  { id: 'loop', label: 'Intelligence Loop', icon: Brain },
  { id: 'closing', label: 'Command', icon: Shield },
];

// ─── Component ────────────────────────────────────────────────────────

export default function AdminIntelligenceWalkthrough() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header — identical to Admin.tsx */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground">Intelligence Walkthrough</h1>
              <p className="text-xs text-muted-foreground">Strategic Analytics · LifeStack</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            Partner-facing preview
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="flex gap-1 pb-2 w-max min-w-full">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0',
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'behavioral' && <BehavioralSection />}
        {activeSection === 'sentiment' && <SentimentSection />}
        {activeSection === 'mentor' && <MentorSection />}
        {activeSection === 'shares' && <SharesSection />}
        {activeSection === 'goals' && <GoalsSection />}
        {activeSection === 'domains' && <DomainsSection />}
        {activeSection === 'insights' && <InsightsSection />}
        {activeSection === 'partner' && <PartnerViewSection />}
        {activeSection === 'privacy' && <PrivacySection />}
        {activeSection === 'loop' && <IntelligenceLoopSection />}
        {activeSection === 'closing' && <ClosingSection />}
      </div>
    </div>
  );
}

// ─── 1. Overview ──────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Executive Overview" description="High-level platform intelligence" icon={Sparkles} privacyLevel="aggregated" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={2847} subtitle="412 active this month" icon={Users} />
        <StatCard title="Monthly Revenue" value="$4,230" subtitle="6.2% conversion" icon={DollarSign} trend="up" />
        <StatCard title="Avg Session" value="8m 42s" subtitle="Per active user" icon={Clock} />
        <StatCard title="Engagement Score" value="7.4" subtitle="Out of 10 · Trending up" icon={Activity} trend="up" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="DAU" value={127} icon={TrendingUp} />
        <StatCard title="WAU" value={342} icon={TrendingUp} />
        <StatCard title="Mentor Sessions" value={1247} icon={MessageSquare} />
        <StatCard title="Share Cards" value={528} icon={Share2} />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">USER GROWTH · 30 DAYS</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} stroke={GRID_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
              <Tooltip {...CHART_TOOLTIP} labelFormatter={(v) => new Date(v).toLocaleDateString()} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain activity bars */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">LIFE DOMAIN ACTIVITY DISTRIBUTION</h3>
        <div className="space-y-3">
          {domainActivity.map(d => (
            <div key={d.domain} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{d.domain}</span>
                <span className="text-foreground font-medium">{d.sessions} sessions</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(d.sessions / 342) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Behavioral ────────────────────────────────────────────────────

function BehavioralSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Behavioral Analytics" description="Aggregated user behavior patterns · No individual clickstreams" icon={BarChart3} privacyLevel="aggregated" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">DAILY ENGAGEMENT CYCLES</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementCycles}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="hour" tick={AXIS_TICK} stroke={GRID_STROKE} />
                <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-primary" />
            Users engage most deeply during evening reflection windows (20:00–22:00)
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">MOST USED FEATURES</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" tick={AXIS_TICK} stroke={GRID_STROKE} />
                <YAxis dataKey="feature" type="category" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke={GRID_STROKE} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">SESSION DEPTH DISTRIBUTION</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionDepth}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="bucket" tick={AXIS_TICK} stroke={GRID_STROKE} />
                <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">ACTIVE VS PASSIVE USERS</h3>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex-1">
              <div className="h-4 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: '72%' }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Active: 297</span>
                <span>Passive: 115</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Active = users with 3+ feature interactions this month</p>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-primary" />
            Goal tracking correlates with 2.1x increased mentor usage
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Sentiment ─────────────────────────────────────────────────────

function SentimentSection() {
  const totalMood = moodDistribution.reduce((s, m) => s + m.count, 0);
  const avgMood = moodDistribution.reduce((s, m) => s + m.mood * m.count, 0) / totalMood;

  return (
    <div className="space-y-8">
      <SectionHeader title="Sentiment & Emotional Climate" description="Platform emotional climate · Aggregated user tone · Privacy-safe sentiment signal" icon={Heart} privacyLevel="privacy-safe" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Platform Avg Mood</p>
          <p className="text-5xl font-bold font-serif text-primary">{avgMood.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground mt-1">out of 10</p>
          <p className="text-xs text-muted-foreground mt-3">Based on {totalMood} aggregated entries</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Avg Energy Level</p>
          <p className="text-5xl font-bold font-serif text-accent">6.8</p>
          <p className="text-sm text-muted-foreground mt-1">out of 10</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Sentiment Balance</p>
          <div className="space-y-3">
            {[
              { label: 'Positive (7-10)', pct: 66 },
              { label: 'Neutral (4-6)', pct: 27 },
              { label: 'Struggling (1-3)', pct: 7 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{item.label}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">MOOD DISTRIBUTION · AGGREGATED</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="mood" tickFormatter={(v) => moodLabels[v] || `${v}`} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} stroke={GRID_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
              <Tooltip {...CHART_TOOLTIP} labelFormatter={(v) => `Mood: ${v}/10`} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain-linked sentiment */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">DOMAIN-LINKED SENTIMENT</h3>
        <div className="space-y-4">
          {domainSentiment.map(d => (
            <div key={d.domain}>
              <p className="text-xs font-medium text-foreground mb-1.5">{d.domain}</p>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-success/70 transition-all" style={{ width: `${d.positive}%` }} />
                <div className="bg-muted-foreground/30 transition-all" style={{ width: `${d.neutral}%` }} />
                <div className="bg-destructive/50 transition-all" style={{ width: `${d.negative}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Positive {d.positive}%</span>
                <span>Neutral {d.neutral}%</span>
                <span>Struggling {d.negative}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 4. Mentor Intelligence ───────────────────────────────────────────

function MentorSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="AI Mentor Intelligence" description="Anonymous topic categories · No private conversations displayed" icon={MessageSquare} privacyLevel="privacy-safe" />

      <div className="rounded-lg border border-info/20 bg-info/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-info mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          All insights are derived from anonymized, aggregated topic analysis. Raw private conversations are never exposed.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Conversations</p>
          <p className="text-2xl font-bold font-serif text-foreground">1,247</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Messages</p>
          <p className="text-2xl font-bold font-serif text-foreground">8,934</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Messages/Chat</p>
          <p className="text-2xl font-bold font-serif text-foreground">7.2</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Topics Identified</p>
          <p className="text-2xl font-bold font-serif text-foreground">7</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">TOP DISCUSSION TOPICS</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mentorTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" tick={AXIS_TICK} stroke={GRID_STROKE} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke={GRID_STROKE} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Clusters */}
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">INTENT CLUSTERS · EMERGING THEMES</h3>
          <div className="space-y-3">
            {mentorIntentClusters.map(cluster => (
              <div key={cluster.tag} className="rounded-lg border border-border/30 bg-secondary/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{cluster.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      cluster.trend === 'Rising' ? 'bg-success/10 text-success border border-success/20' :
                      cluster.trend === 'Cyclical' ? 'bg-info/10 text-info border border-info/20' :
                      'bg-secondary text-muted-foreground border border-border/30'
                    )}>
                      {cluster.trend}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{cluster.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Themes */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">KEY THEMES · AGGREGATED MARKET SIGNAL</h3>
        <div className="flex flex-wrap gap-2">
          {['Burnout Recovery', 'Financial Discipline', 'Habit Stacking', 'Career Pivots', 'Relationship Boundaries', 'Purpose Discovery', 'Energy Management', 'Time Optimization'].map(theme => (
            <span key={theme} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {theme}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-primary" />
          These intent signals translate directly into context-aware sponsor alignment opportunities
        </p>
      </div>
    </div>
  );
}

// ─── 5. Shares ────────────────────────────────────────────────────────

function SharesSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Share & Viral Distribution" description="Privacy-respecting aggregate sharing metrics" icon={Share2} privacyLevel="aggregated" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cards Generated" value={528} icon={Award} />
        <StatCard title="Shares Initiated" value={312} icon={Share2} />
        <StatCard title="External Reach" value="2.4x" subtitle="Amplification factor" icon={Globe} />
        <StatCard title="Viral Rate" value="18%" subtitle="Cards shared externally" icon={TrendingUp} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">MOST SHARED ACHIEVEMENT TYPES</h3>
          <div className="space-y-3">
            {shareCardTypes.map(item => {
              const max = Math.max(...shareCardTypes.map(i => i.count));
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.type}</span>
                    <span className="text-foreground font-medium">{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(item.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">VIRALITY BY DOMAIN</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shareDomainDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {shareDomainDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">Physical achievements drive the highest external sharing</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Streak and milestone cards in the Physical domain are shared 2.3x more than other domains. Users in active health journeys are your most powerful organic distributors.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Goals ─────────────────────────────────────────────────────────

function GoalsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Goals & Progression Intelligence" description="Aggregated goal themes and categories · No private goal text" icon={Target} privacyLevel="anonymous" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">GOAL CATEGORIES</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {goalCategories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">GOAL STATUS DISTRIBUTION</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke={GRID_STROKE} />
                <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">COMPLETION RATE BY CATEGORY</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {goalCategories.map(cat => (
              <div key={cat.name} className="rounded-lg border border-border/30 bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">{cat.name}</p>
                <p className="text-lg font-bold text-foreground">{cat.completionRate}%</p>
                <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${cat.completionRate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">Users pursuing financial goals show 2x engagement in mentor sessions</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Financial goal-setters average 12.4 mentor messages per week vs 6.1 for other categories. This represents high-intent, advice-seeking behavior.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Domains ───────────────────────────────────────────────────────

function DomainsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Domain-Level Intelligence" description="Activity and intensity across life domains" icon={Activity} privacyLevel="aggregated" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainActivity.map(d => (
          <div key={d.domain} className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">{d.domain}</h3>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                d.growth >= 15 ? 'bg-success/10 text-success border border-success/20' :
                d.growth >= 10 ? 'bg-primary/10 text-primary border border-primary/20' :
                'bg-secondary text-muted-foreground border border-border/30'
              )}>
                +{d.growth}% growth
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Sessions</span>
                  <span className="font-medium text-foreground">{d.sessions}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Intensity</span>
                  <span className="font-medium text-foreground">{d.intensity}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${d.intensity}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">DOMAIN ACTIVITY COMPARISON</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="domain" tick={AXIS_TICK} stroke={GRID_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── 8. Actionable Insights ───────────────────────────────────────────

function InsightsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Actionable Insights Engine" description="Decision-grade intelligence surfaced from behavioral patterns" icon={Lightbulb} privacyLevel="aggregated" />

      <div className="space-y-4">
        {actionableInsights.map((insight, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider',
                  insight.type === 'opportunity' ? 'bg-success/10 text-success border border-success/20' :
                  insight.type === 'trend' ? 'bg-info/10 text-info border border-info/20' :
                  'bg-primary/10 text-primary border border-primary/20'
                )}>
                  {insight.type}
                </span>
                <h3 className="text-sm font-medium text-foreground">{insight.title}</h3>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${insight.confidence}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{insight.confidence}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
            <div className="flex gap-1.5 mt-3">
              {insight.domains.map(d => (
                <span key={d} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground text-center">
          Each insight is generated from aggregated behavioral patterns across 2,847 users. Confidence scores reflect statistical reliability.
        </p>
      </div>
    </div>
  );
}

// ─── 9. Partner View ──────────────────────────────────────────────────

function PartnerViewSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Partner Intelligence View" description="Filtered intelligence for brand partners" icon={Handshake} privacyLevel="aggregated" />

      <div className="rounded-lg border border-info/20 bg-info/5 p-4 flex items-start gap-3">
        <Eye className="h-5 w-5 text-info mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Partners receive filtered, category-specific intelligence. No individual user data is shared. All metrics are aggregated and anonymized.
        </p>
      </div>

      {/* Example: Health Partner View */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Health & Recovery Partner View</h3>
          <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-medium">Active Category</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Domain Users</p>
            <p className="text-lg font-bold font-serif text-foreground">342</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Avg Engagement</p>
            <p className="text-lg font-bold font-serif text-foreground">8.2/10</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Intent Signal</p>
            <p className="text-lg font-bold font-serif text-primary">High</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Card Shares</p>
            <p className="text-lg font-bold font-serif text-foreground">156</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Category-Specific Insights</p>
          {[
            'Recovery-focused queries peak after high-activity streaks',
            'Users tracking health habits share 2.3x more externally',
            'Morning engagement correlates with wellness content receptivity',
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Example: Wealth Partner View */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Wealth & Financial Planning Partner View</h3>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">Active Category</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Domain Users</p>
            <p className="text-lg font-bold font-serif text-foreground">267</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Mentor Queries</p>
            <p className="text-lg font-bold font-serif text-foreground">16%</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Intent Signal</p>
            <p className="text-lg font-bold font-serif text-primary">Very High</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Goal Completion</p>
            <p className="text-lg font-bold font-serif text-foreground">55%</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Category-Specific Insights</p>
          {[
            'Financial planning queries spike during last 5 days of each month',
            'Users with financial goals show 2x mentor engagement',
            'Savings-related insights generate highest share card creation',
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 10. Privacy ──────────────────────────────────────────────────────

function PrivacySection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Privacy & Trust Layer" description="Ethical data intelligence · No personal data exposure" icon={Lock} privacyLevel="privacy-safe" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { icon: Shield, title: 'Data Anonymization', description: 'All analytics are derived from aggregated, anonymized datasets. No individual user profiles are exposed to partners or internal reports.' },
          { icon: Eye, title: 'No Personal Data Exposure', description: 'Private conversations, personal goals, and journal entries are never displayed. Only category-level patterns surface.' },
          { icon: Lock, title: 'Ethical Usage Controls', description: 'Platform intelligence follows strict ethical guidelines. No manipulative targeting, no dark patterns, no exploitation of vulnerable states.' },
          { icon: CheckCircle2, title: 'Opt-in / Consent Structure', description: 'Users explicitly consent to anonymized analytics participation. Curated suggestions require separate opt-in acknowledgment.' },
        ].map(item => (
          <div key={item.title} className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Settings-style controls */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">SYSTEM CONTROLS</h3>
        <div className="space-y-3">
          {[
            { label: 'Privacy threshold enforcement', value: 'Min 5 data points', active: true },
            { label: 'Individual data access', value: 'Disabled for partners', active: true },
            { label: 'Raw conversation access', value: 'Restricted to system only', active: true },
            { label: 'Partner data export', value: 'Aggregated reports only', active: true },
            { label: 'Placement inventory limits', value: 'Max 1 per surface per session', active: true },
          ].map(control => (
            <div key={control.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <p className="text-xs font-medium text-foreground">{control.label}</p>
                <p className="text-[10px] text-muted-foreground">{control.value}</p>
              </div>
              <div className={cn(
                'h-5 w-9 rounded-full flex items-center px-0.5 transition-colors',
                control.active ? 'bg-primary justify-end' : 'bg-secondary justify-start'
              )}>
                <div className="h-4 w-4 rounded-full bg-primary-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Power without exploitation. Intelligence without surveillance.
        </p>
      </div>
    </div>
  );
}

// ─── 11. Intelligence Loop ────────────────────────────────────────────

function IntelligenceLoopSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Intelligence → Placement Loop" description="How behavioral signals become placement opportunities" icon={Brain} privacyLevel="aggregated" />

      {/* Step 1: Behavior captured */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">STEP 1</span>
          <h3 className="text-sm font-medium text-foreground">User Behavior Captured</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Habits logged', value: '1,102' },
            { label: 'Mentor sessions', value: '1,247' },
            { label: 'Goals tracked', value: '370' },
            { label: 'Journal entries', value: '678' },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-lg font-bold font-serif text-foreground">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Intelligence generated */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-info/10 text-info border border-info/20 px-2 py-0.5 rounded-full font-medium">STEP 2</span>
          <h3 className="text-sm font-medium text-foreground">Insight Generation</h3>
        </div>
        <div className="space-y-2">
          {[
            { signal: 'Recovery intent surge', confidence: 87, domain: 'Health' },
            { signal: 'Financial planning spike', confidence: 92, domain: 'Wealth' },
            { signal: 'Consistency seekers cluster', confidence: 79, domain: 'Productivity' },
          ].map(s => (
            <div key={s.signal} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs text-foreground">{s.signal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{s.domain}</span>
                <span className="text-[10px] text-muted-foreground">{s.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Placement opportunity */}
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-medium">STEP 3</span>
          <h3 className="text-sm font-medium text-foreground">Placement Opportunity Surfaces</h3>
        </div>
        <div className="space-y-3">
          {[
            { surface: 'AI Mentor output', context: 'After recovery insight', partner: 'Health & wellness partner' },
            { surface: 'Share card', context: 'Financial milestone shared', partner: 'Financial services partner' },
            { surface: 'Goal recommendation', context: 'Habit stacking detected', partner: 'Productivity tools partner' },
          ].map(p => (
            <div key={p.surface} className="rounded-lg border border-border/30 bg-secondary/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{p.surface}</span>
                <ChevronRight className="h-3 w-3 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground">Context: {p.context}</p>
              <p className="text-[10px] text-primary mt-1">{p.partner}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4: User action */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">RESULT</span>
          <h3 className="text-sm font-medium text-foreground">User Action in Context</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The user encounters a relevant, context-aware placement during a moment of genuine intent. The interaction feels like a system recommendation — not an insertion. Trust is preserved. Value is delivered.
        </p>
      </div>
    </div>
  );
}

// ─── 12. Closing ──────────────────────────────────────────────────────

function ClosingSection() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Command Center" description="Strategic overview" icon={Shield} privacyLevel="aggregated" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={2847} icon={Users} />
        <StatCard title="Active Rate" value="72%" subtitle="Monthly active" icon={Activity} trend="up" />
        <StatCard title="Avg Session" value="8m 42s" icon={Clock} />
        <StatCard title="Avg Mood" value="7.1" subtitle="Platform sentiment" icon={Heart} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Domains Active" value={5} icon={Target} />
        <StatCard title="Insights Surfaced" value={4} subtitle="Actionable signals" icon={Lightbulb} />
        <StatCard title="Share Cards" value={528} icon={Share2} />
        <StatCard title="Trust Score" value="9.2" subtitle="Privacy compliance" icon={Shield} trend="up" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-12 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-foreground">Understand the moments that matter.</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Act with precision. Preserve trust.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs text-primary font-medium">LifeStack Intelligence</span>
        </div>
      </div>
    </div>
  );
}
