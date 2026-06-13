import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Brain, Activity, HeartPulse, Banknote, ShieldCheck,
  TrendingUp, Sparkles, Target, MapPin, LineChart as LineIcon,
  AlertTriangle, Gauge, Zap,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  trajectoryData, healthRiskClusters, financialIndicators, insuranceClusters,
  interventions, userSegments, geoClusters, roiMetrics, headlineKpis, aiBriefings,
} from '@/services/predictiveIntelligenceData';

const severityTone = (s: 'low' | 'medium' | 'high') =>
  s === 'high' ? 'bg-red-500/15 text-red-300 border-red-500/30'
  : s === 'medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--background) / 0.92)',
    border: '1px solid hsl(var(--border) / 0.5)',
    borderRadius: 12,
    color: 'hsl(var(--foreground))',
    backdropFilter: 'blur(12px)',
  },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
};

function SectionTitle({ icon: Icon, eyebrow, title, sub }: any) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h2 className="text-lg sm:text-xl font-serif text-foreground leading-tight">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl',
      'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]',
      className,
    )}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </Card>
  );
}

export default function PredictiveIntelligence() {
  const { user, loading, isAdmin } = useAuth();
  const { isDemoMode, setDemoMode } = useDemoMode();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 space-y-4">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden text-foreground">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/20 border border-primary/30 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-serif font-semibold truncate">
                Predictive Intelligence &amp; Risk Analytics
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Behavioral intelligence · Enterprise · Privacy-governed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
              POPIA · GDPR · HIPAA
            </Badge>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-card/40">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Demo</span>
              <Switch checked={isDemoMode} onCheckedChange={setDemoMode} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {headlineKpis.map(k => (
            <GlassCard key={k.label} className="p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</p>
              <p className="text-3xl font-serif mt-2 text-foreground">{k.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{k.sub}</p>
            </GlassCard>
          ))}
        </div>

        {/* Executive AI Briefings */}
        <section>
          <SectionTitle icon={Sparkles} eyebrow="Executive AI Analyst" title="Today's intelligence brief"
            sub="Auto-generated by the ensemble model · explainable, auditable" />
          <div className="grid md:grid-cols-3 gap-3">
            {aiBriefings.map(b => (
              <GlassCard key={b.title} className="p-5">
                <Badge className={cn('text-[10px] uppercase tracking-wider mb-3',
                  b.tag === 'Critical' ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                  : b.tag === 'Opportunity' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-primary/15 text-primary border border-primary/30')}>
                  {b.tag}
                </Badge>
                <h3 className="font-serif text-base text-foreground leading-snug mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Behavioral Trajectory Engine */}
        <section>
          <SectionTitle icon={TrendingUp} eyebrow="Module 01" title="Behavioral Trajectory Engine"
            sub="Predicted trajectories across health, financial, mental, productivity & momentum" />
          <GlassCard className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border) / 0.3)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="momentum" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="financial" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mental" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="productivity" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Momentum</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Health</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Financial</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" />Mental</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />Productivity</span>
            </div>
          </GlassCard>
        </section>

        {/* Health + Financial side by side */}
        <section className="grid lg:grid-cols-2 gap-4">
          <div>
            <SectionTitle icon={HeartPulse} eyebrow="Module 02" title="Health Risk Prediction"
              sub="Opt-in cohort modeling · severity-graded" />
            <GlassCard className="p-5 space-y-2">
              {healthRiskClusters.map(r => <RiskRow key={r.label} r={r} />)}
            </GlassCard>
          </div>
          <div>
            <SectionTitle icon={Banknote} eyebrow="Module 03" title="Financial Stress Intelligence"
              sub="Behavioral indicators only · no raw banking data" />
            <GlassCard className="p-5 space-y-2">
              {financialIndicators.map(r => <RiskRow key={r.label} r={r} />)}
            </GlassCard>
          </div>
        </section>

        {/* Insurance + Life Momentum */}
        <section className="grid lg:grid-cols-2 gap-4">
          <div>
            <SectionTitle icon={ShieldCheck} eyebrow="Module 04" title="Insurance Risk Intelligence"
              sub="Cohort clustering · intervention-ready" />
            <GlassCard className="p-5 space-y-2">
              {insuranceClusters.map(r => <RiskRow key={r.label} r={r} />)}
            </GlassCard>
          </div>
          <div>
            <SectionTitle icon={Gauge} eyebrow="Module 05" title="Life Momentum Index"
              sub="LifeStack's proprietary behavioral composite" />
            <GlassCard className="p-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { dim: 'Habits', value: 82 },
                    { dim: 'Sleep', value: 74 },
                    { dim: 'Movement', value: 78 },
                    { dim: 'Journaling', value: 69 },
                    { dim: 'Goals', value: 81 },
                    { dim: 'Social', value: 72 },
                    { dim: 'Recovery', value: 76 },
                    { dim: 'Financial', value: 70 },
                  ]}>
                    <PolarGrid stroke="hsl(var(--border) / 0.4)" />
                    <PolarAngleAxis dataKey="dim" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <PolarRadiusAxis stroke="hsl(var(--border) / 0.4)" tick={false} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} strokeWidth={2} />
                    <Tooltip {...tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Intervention engine */}
        <section>
          <SectionTitle icon={Zap} eyebrow="Module 06" title="Intervention Recommendation Engine"
            sub="AI-ranked by predicted impact, confidence & ROI" />
          <GlassCard className="p-5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {interventions.map(i => (
                <div key={i.title} className="rounded-2xl p-4 border border-border/40 bg-background/40">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.audience}</p>
                  <h4 className="font-serif text-foreground mt-1 leading-tight">{i.title}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <Stat label="Impact" value={`+${i.impact}%`} />
                    <Stat label="Confidence" value={i.confidence.toFixed(2)} />
                    <Stat label="ROI" value={`R${i.roi}`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Segments */}
        <section>
          <SectionTitle icon={Target} eyebrow="Module 07" title="High-Value User Segmentation"
            sub="Archetype intelligence · retention & growth signals" />
          <GlassCard className="p-5">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userSegments}>
                  <CartesianGrid stroke="hsl(var(--border) / 0.3)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="users" radius={[8,8,0,0]}>
                    {userSegments.map((s, i) => (
                      <Cell key={i} fill={s.growth < 0 ? '#ef4444' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid md:grid-cols-3 gap-2 mt-4">
              {userSegments.map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-xl px-3 py-2 border border-border/40 bg-background/40">
                  <span className="text-sm text-foreground">{s.name}</span>
                  <span className={cn('text-xs font-mono', s.growth < 0 ? 'text-red-400' : 'text-emerald-400')}>
                    {s.growth > 0 ? '+' : ''}{s.growth}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Geo */}
        <section>
          <SectionTitle icon={MapPin} eyebrow="Module 08" title="Aggregated Intelligence Maps"
            sub="Anonymized regional behavioral clusters · cohort ≥ 5" />
          <GlassCard className="p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {geoClusters.map(g => (
                <div key={g.region} className="rounded-2xl p-4 border border-border/40 bg-background/40">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif text-foreground">{g.region}</h4>
                    <Badge variant="outline" className="text-[10px]">Anon</Badge>
                  </div>
                  <HeatBar label="Momentum" value={g.momentum} color="bg-primary" />
                  <HeatBar label="Engagement" value={g.engagement} color="bg-emerald-400" />
                  <HeatBar label="Burnout" value={g.burnout} color="bg-red-400" />
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* ROI */}
        <section>
          <SectionTitle icon={LineIcon} eyebrow="Module 10" title="Institutional ROI Engine"
            sub="Projected enterprise impact · quarterly view" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {roiMetrics.map(m => (
              <GlassCard key={m.label} className="p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-serif mt-2">{m.value}</p>
                <p className="text-[11px] text-emerald-400 mt-1">{m.delta}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Compliance footer */}
        <GlassCard className="p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            All predictive analytics are <span className="text-foreground">opt-in</span>, anonymized at cohort level (n ≥ 5),
            and never expose protected health data or identifiable journal contents.
            Users may export, disable, or erase their predictive profile at any time.
            All institutional access is RBAC-controlled, audit-logged, and token-scoped.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function RiskRow({ r }: { r: any }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 border border-border/30 bg-background/40">
      <div className="min-w-0">
        <p className="text-sm text-foreground truncate">{r.label}</p>
        <p className="text-[11px] text-muted-foreground">
          {r.count.toLocaleString()} users · confidence {r.confidence.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('text-xs font-mono', r.trend > 0 ? 'text-red-400' : 'text-emerald-400')}>
          {r.trend > 0 ? '+' : ''}{r.trend}%
        </span>
        <Badge variant="outline" className={cn('text-[10px] uppercase', severityTone(r.severity))}>
          {r.severity}
        </Badge>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border/30 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-mono text-foreground">{value}</p>
    </div>
  );
}

function HeatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
