import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles, Target, Heart, TrendingUp, DollarSign, Brain,
  Shield, Flame, ChevronRight, Star, Award, Lock,
  Activity, BookOpen, Users, Compass, Bot, User,
  BarChart3, Zap, Eye, Check, ArrowRight, Globe,
  Briefcase, Crown, Gem, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Curated Placements — In-App Product Walkthrough
   Every "slide" is a real LifeStack UI screen.
───────────────────────────────────────────────────────────── */

// Reusable section wrapper — simulates a full viewport screen
function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(
      'min-h-screen flex flex-col justify-center py-16 px-4 relative',
      className,
    )}>
      {children}
    </section>
  );
}

// LifeStack icon orb inline
function Orb({ children, size = 'md' }: { children: React.ReactNode; size?: 'sm' | 'md' }) {
  return (
    <div className={size === 'sm' ? 'icon-orb-sm' : 'icon-orb'}>
      {children}
    </div>
  );
}

// Simulated chat bubble
function ChatBubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="chat-bubble-user text-sm leading-relaxed max-w-[80%]">{children}</div>
        <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center shrink-0 ring-1 ring-white/[0.08]">
          <User className="w-3.5 h-3.5 text-foreground/80" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/15 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-primary/90" />
      </div>
      <div className="chat-bubble-assistant flex-1 min-w-0">{children}</div>
    </div>
  );
}

// Simulated sponsor placement card — native to the system
function CuratedSpot({ partner, label, description, icon: Icon }: {
  partner: string; label: string; description: string; icon: React.ElementType;
}) {
  return (
    <Card variant="surface" className="overflow-hidden hover-lift cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
            <Icon className="w-4 h-4 text-primary/80" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="source-badge">Curated</span>
              <span className="meta-text-xs">{partner}</span>
            </div>
            <p className="text-sm font-medium text-foreground/90 leading-snug">{label}</p>
            <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/70 shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// Share card mockup — uses real system tokens
function ShareCardMock({ title, stat, label, phrase, sponsor }: {
  title: string; stat: string; label: string; phrase: string; sponsor?: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden relative select-none"
      style={{
        background: 'linear-gradient(145deg, hsl(220 18% 11%), hsl(220 18% 8%))',
        border: '1px solid hsla(0,0%,100%,0.04)',
        boxShadow: '0 8px 32px -8px hsla(0,0%,0%,0.4)',
        padding: '24px',
        aspectRatio: '4/5',
        maxWidth: '280px',
      }}
    >
      {/* Subtle dot texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(hsla(0,0%,100%,0.5) 0.5px, transparent 0.5px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative flex flex-col justify-between h-full">
        {/* Top band */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))' }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: 'hsl(220,20%,6%)', letterSpacing: '0.08em' }}>LS</span>
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-primary/[0.08] text-primary/70 font-medium border border-primary/10">
            Achievement
          </span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-3xl font-bold font-serif" style={{ color: 'hsl(43,74%,55%)' }}>{stat}</div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-foreground/50 font-medium">{label}</p>
          <h3 className="font-serif font-semibold text-base text-foreground/90 leading-snug">{title}</h3>
        </div>

        {/* Sponsor tile */}
        {sponsor && (
          <div className="rounded-xl p-3 mb-3"
            style={{ background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="source-badge">Curated</span>
              <span className="text-[10px] text-muted-foreground/70">{sponsor}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.06)', paddingTop: 10 }}>
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.1em] text-primary/60 font-medium">{phrase}</p>
            <span className="text-[8px] tracking-[0.1em] text-foreground/25">Shared from LifeStack</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category domain card
function DomainCard({ icon: Icon, title, description, color, sponsor }: {
  icon: React.ElementType; title: string; description: string; color: string; sponsor?: string;
}) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold font-serif text-foreground/90">{title}</h4>
            <p className="text-[10px] text-muted-foreground/70">{description}</p>
          </div>
        </div>
        {sponsor && (
          <div className="flex items-center gap-2 pt-2 mt-2" style={{ borderTop: '1px solid hsla(0,0%,100%,0.04)' }}>
            <span className="source-badge">Exclusive Partner</span>
            <span className="text-[10px] text-muted-foreground/70">{sponsor}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CuratedPlacements() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══ SCREEN 1: COVER — App Entry ═══ */}
      <Screen>
        <div className="max-w-lg mx-auto text-center space-y-8">
          {/* LifeStack icon */}
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))',
              boxShadow: '0 8px 32px -8px hsl(43 74% 52% / 0.3)',
            }}>
            <span className="text-lg font-bold" style={{ color: 'hsl(220,20%,6%)', letterSpacing: '0.06em' }}>LS</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Exclusive Curated Placements
            </h1>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-md mx-auto">
              A premium intent-driven brand visibility ecosystem inside a life companion app people return to daily.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="section-label text-primary/60">LifeStack</span>
            <p className="text-xs text-muted-foreground/70 max-w-sm">
              Your life companion app and AI mentor — from your first job to your last breath.
            </p>
          </div>

          <div className="pt-4">
            <ChevronDown className="w-5 h-5 text-muted-foreground/70 mx-auto animate-bounce" />
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 2: WHAT IS LIFESTACK — Dashboard View ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Compass /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">What LifeStack Is</h2>
          </div>
          <p className="page-subtitle">A deeply personal, high-frequency platform</p>

          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            LifeStack is a life companion app and AI mentor that supports users across every dimension of personal evolution — a high-engagement, emotionally trusted environment with unusually strong user attention quality.
          </p>

          {/* Life domain tiles — real dashboard pattern */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Heart, label: 'Health & Recovery', color: 'hsl(0 72% 55%)' },
              { icon: DollarSign, label: 'Wealth & Finance', color: 'hsl(142 71% 45%)' },
              { icon: Brain, label: 'Mind & Focus', color: 'hsl(199 89% 48%)' },
              { icon: Target, label: 'Goals & Discipline', color: 'hsl(43 74% 52%)' },
              { icon: Users, label: 'Relationships', color: 'hsl(280 60% 55%)' },
              { icon: Compass, label: 'Purpose & Growth', color: 'hsl(170 60% 45%)' },
            ].map(({ icon: Icon, label, color }) => (
              <Card key={label} variant="glass" className="overflow-hidden">
                <CardContent className="p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color} / 0.12`, border: `1px solid ${color} / 0.2` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-xs font-medium text-foreground/80">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { value: 'Daily', label: 'Return Rate' },
              { value: '7+', label: 'Min / Session' },
              { value: 'Deep', label: 'Engagement' },
            ].map(({ value, label }) => (
              <Card key={label} variant="glass">
                <CardContent className="p-3.5 text-center">
                  <div className="text-lg font-serif font-bold text-foreground">{value}</div>
                  <p className="section-label mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 3: NOT TRADITIONAL ADVERTISING — Mentor Chat ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Sparkles /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Not Traditional Advertising</h2>
          </div>
          <p className="page-subtitle">Intent-driven placement in high-trust context</p>

          {/* Simulated mentor chat */}
          <Card variant="glass" className="overflow-hidden">
            <div className="p-1.5">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
                <Orb size="sm"><Sparkles /></Orb>
                <span className="text-xs font-medium text-foreground/70">AI Mentor</span>
                <span className="meta-text-xs ml-auto">Active</span>
              </div>
            </div>
            <CardContent className="space-y-4 py-4">
              <ChatBubble role="user">
                I want to start improving my sleep and recovery routine. Any suggestions?
              </ChatBubble>
              <ChatBubble role="assistant">
                <div className="text-sm leading-relaxed space-y-2">
                  <p>Great question. Based on your recent patterns, here's what I'd recommend:</p>
                  <p><strong>1. Wind-down window</strong> — Set a consistent 30-min pre-sleep routine</p>
                  <p><strong>2. Screen discipline</strong> — Blue light filter after 9pm</p>
                  <p><strong>3. Recovery tracking</strong> — Monitor your HRV and sleep quality</p>
                </div>
              </ChatBubble>

              {/* This is the curated placement — native to the system */}
              <CuratedSpot
                partner="Recovery Partner"
                label="Track your recovery with precision"
                description="Wearable-connected sleep and HRV analysis, personalised to your LifeStack profile."
                icon={Activity}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card variant="surface">
              <CardContent className="p-3.5 text-center">
                <Eye className="w-5 h-5 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Context-Aware</p>
              </CardContent>
            </Card>
            <Card variant="surface">
              <CardContent className="p-3.5 text-center">
                <Shield className="w-5 h-5 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">Trust-Preserving</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 4: VALUE TO PARTNERS — Insights & Metrics ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><BarChart3 /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Value to Partners</h2>
          </div>
          <p className="page-subtitle">Premium contextual visibility</p>

          <div className="space-y-3">
            {[
              { icon: Eye, title: 'Attention During Meaningful Decisions', desc: 'Users engage when making real life choices — not scrolling passively.' },
              { icon: Target, title: 'Self-Improvement Alignment', desc: 'Every placement sits within a progress-oriented, action-driven context.' },
              { icon: Shield, title: 'Privacy-Conscious Presence', desc: 'No invasive tracking. Curated relevance through life-phase awareness.' },
              { icon: Lock, title: 'Exclusive Domain Inventory', desc: 'Limited placements per category. No auction-style commoditisation.' },
              { icon: Zap, title: 'Emotionally Resonant Moments', desc: 'Brand visibility during breakthroughs, milestones, and progress points.' },
              { icon: Star, title: 'Trust-Rich Context', desc: 'Users trust their LifeStack mentor. That trust extends to curated recommendations.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} variant="glass" className="overflow-hidden">
                <CardContent className="p-4 flex items-start gap-3">
                  <Orb size="sm"><Icon /></Orb>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90">{title}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 5: PLACEMENT ECOSYSTEM — Multiple Real Screens ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Globe /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Placement Ecosystem</h2>
          </div>
          <p className="page-subtitle">Where curated spots live inside LifeStack</p>

          <div className="space-y-3">
            {[
              { icon: Sparkles, label: 'AI Mentor Outputs', desc: 'Contextual placement beneath personalised guidance', tag: 'Primary' },
              { icon: Star, label: 'Share Cards', desc: 'Sponsor tile within viral shareable content', tag: 'Viral' },
              { icon: Target, label: 'Goal Recommendations', desc: 'Tools and resources aligned with active goals', tag: 'High Intent' },
              { icon: BookOpen, label: 'Weekly Insights Digest', desc: 'Curated sponsor within progress summaries', tag: 'Recurring' },
              { icon: Compass, label: 'Discovery & Resources', desc: 'Category-specific tools and partner surfaces', tag: 'Exploratory' },
              { icon: Activity, label: 'Habit & Routine Flows', desc: 'Integration within daily tracking and streaks', tag: 'Daily' },
            ].map(({ icon: Icon, label, desc, tag }) => (
              <Card key={label} variant="glass" className="overflow-hidden hover-lift cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Orb size="sm"><Icon /></Orb>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90">{label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{desc}</p>
                  </div>
                  <span className="category-chip shrink-0">{tag}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 6: AI MENTOR PLACEMENTS — Real Chat UI ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Sparkles /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">AI Mentor Placements</h2>
          </div>
          <p className="page-subtitle">Context-aligned curated recommendations</p>

          {/* Example 1: Health */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="space-y-4 py-4">
              <ChatBubble role="user">How can I improve my energy levels throughout the day?</ChatBubble>
              <ChatBubble role="assistant">
                <div className="text-sm leading-relaxed space-y-2">
                  <p>Your recent check-ins show energy dips around 2pm. Consider:</p>
                  <p>• <strong>Strategic nutrition</strong> — protein-rich lunch, avoid sugar crashes</p>
                  <p>• <strong>Movement breaks</strong> — 10-min walks between focused blocks</p>
                  <p>• <strong>Hydration tracking</strong> — aim for 2.5L daily</p>
                </div>
              </ChatBubble>
              <CuratedSpot
                partner="Wellness Brand"
                label="Personalised nutrition for sustained energy"
                description="AI-powered meal plans aligned with your LifeStack wellness goals."
                icon={Heart}
              />
            </CardContent>
          </Card>

          {/* Example 2: Finance */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="space-y-4 py-4">
              <ChatBubble role="user">I need help building a savings plan for the next 6 months.</ChatBubble>
              <ChatBubble role="assistant">
                <div className="text-sm leading-relaxed space-y-2">
                  <p>Based on your financial goals, here's a structured approach:</p>
                  <p>• <strong>Automate first</strong> — set up a 15% auto-transfer on pay day</p>
                  <p>• <strong>Track weekly</strong> — review spending patterns every Sunday</p>
                </div>
              </ChatBubble>
              <CuratedSpot
                partner="Banking Partner"
                label="Smart savings tools for your goals"
                description="Automated savings accounts with market-leading rates."
                icon={DollarSign}
              />
            </CardContent>
          </Card>

          {/* Example 3: Productivity */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="space-y-4 py-4">
              <ChatBubble role="user">I keep getting distracted during deep work sessions.</ChatBubble>
              <ChatBubble role="assistant">
                <div className="text-sm leading-relaxed space-y-2">
                  <p>Focus is a skill. Let's build your distraction defence:</p>
                  <p>• <strong>Time-blocking</strong> — 90-min focused sprints with breaks</p>
                  <p>• <strong>Environment design</strong> — dedicated workspace, phone in another room</p>
                </div>
              </ChatBubble>
              <CuratedSpot
                partner="Focus App"
                label="Distraction-free deep work environment"
                description="AI-powered focus sessions synced with your LifeStack schedule."
                icon={Brain}
              />
            </CardContent>
          </Card>
        </div>
      </Screen>

      {/* ═══ SCREEN 7: SHARE CARD PLACEMENTS ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Star /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Share Card Placements</h2>
          </div>
          <p className="page-subtitle">Viral distribution with curated partner presence</p>

          <p className="text-sm text-muted-foreground/60 leading-relaxed">
            When users share achievements, insights, and progress externally, curated sponsor tiles travel with the card — reaching audiences beyond the app.
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
            <div className="snap-center shrink-0">
              <ShareCardMock
                title="Today's Breakthrough"
                stat="14"
                label="Day Streak"
                phrase="momentum maintained"
                sponsor="Wellness Partner"
              />
            </div>
            <div className="snap-center shrink-0">
              <ShareCardMock
                title="Weekly Progress"
                stat="87%"
                label="Goals Hit"
                phrase="built different"
                sponsor="Productivity Brand"
              />
            </div>
            <div className="snap-center shrink-0">
              <ShareCardMock
                title="Mentor Insight"
                stat="💡"
                label="Key Lesson"
                phrase="clarity found"
              />
            </div>
          </div>

          <Card variant="surface">
            <CardContent className="p-4 flex items-start gap-3">
              <Orb size="sm"><TrendingUp /></Orb>
              <div>
                <p className="text-sm font-medium text-foreground/80">Viral Reach</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Share cards extend curated brand presence to social platforms, messaging apps, and external audiences — every share is organic distribution.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Screen>

      {/* ═══ SCREEN 8: CATEGORY EXCLUSIVITY ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Crown /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Category Exclusivity</h2>
          </div>
          <p className="page-subtitle">Own a life domain inside LifeStack</p>

          <div className="space-y-3">
            <DomainCard icon={Heart} title="Health & Recovery" description="Fitness, sleep, nutrition, wellness" color="hsl(0,72%,55%)" sponsor="Premium Health Brand" />
            <DomainCard icon={DollarSign} title="Wealth & Financial Planning" description="Savings, investing, insurance, budgeting" color="hsl(142,71%,45%)" sponsor="Banking Partner" />
            <DomainCard icon={Brain} title="Productivity & Focus" description="Deep work, planning, tools, routines" color="hsl(199,89%,48%)" sponsor="Productivity Suite" />
            <DomainCard icon={Users} title="Personal Growth" description="Learning, skills, coaching, development" color="hsl(280,60%,55%)" />
            <DomainCard icon={Compass} title="Travel & Experiences" description="Exploration, adventure, discovery" color="hsl(170,60%,45%)" />
            <DomainCard icon={Heart} title="Family & Home" description="Parenting, home, relationships" color="hsl(340,65%,50%)" />
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 9: EXAMPLE BRAND SCENARIOS ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Briefcase /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Brand Scenarios</h2>
          </div>
          <p className="page-subtitle">Real-world placement examples</p>

          <div className="space-y-4">
            {[
              {
                flow: 'Wellness Recovery Flow',
                user: "My energy has been low all week. What should I change?",
                insight: "Your sleep data shows only 5.2 hours average. Let's fix your wind-down routine and track recovery metrics.",
                partner: 'Health Wearable Co.',
                placement: 'Recovery tracking with HRV analysis',
                mindset: 'User is actively seeking health improvement',
              },
              {
                flow: 'Financial Planning Flow',
                user: "I want to save R50,000 in the next 12 months.",
                insight: "At R4,167/month, that's achievable. Let's set up automated transfers and track weekly progress.",
                partner: 'Digital Bank',
                placement: 'Smart savings account with goal tracking',
                mindset: 'User is making concrete financial decisions',
              },
              {
                flow: 'Goal Execution Flow',
                user: "I keep starting projects but never finishing them.",
                insight: "Let's build a completion framework: smaller milestones, daily micro-moves, and weekly reviews.",
                partner: 'Productivity Platform',
                placement: 'Task management synced with LifeStack goals',
                mindset: 'User is ready to commit to new tools',
              },
            ].map(({ flow, user, insight, partner, placement, mindset }) => (
              <Card key={flow} variant="glass" className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="category-chip">{flow}</span>
                  </div>

                  {/* Mini chat */}
                  <div className="space-y-2 py-2">
                    <div className="flex justify-end">
                      <div className="chat-bubble-user text-xs leading-relaxed max-w-[75%] !py-2 !px-3">{user}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/15 mt-0.5">
                        <Bot className="w-2.5 h-2.5 text-primary/90" />
                      </div>
                      <div className="chat-bubble-assistant !py-2 !px-3 text-xs leading-relaxed">{insight}</div>
                    </div>
                  </div>

                  {/* Placement */}
                  <div className="rounded-lg p-3" style={{ background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.04)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="source-badge">Curated</span>
                      <span className="text-[10px] text-muted-foreground/70">{partner}</span>
                    </div>
                    <p className="text-xs text-foreground/70">{placement}</p>
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 italic">
                    User mindset: {mindset}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 10: WHY PLACEMENTS PERFORM DIFFERENTLY ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><TrendingUp /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Why This Performs Differently</h2>
          </div>
          <p className="page-subtitle">Trusted context creates superior attention</p>

          <div className="space-y-3">
            {[
              { label: 'Repeat Engagement', value: 'Daily return users with habit-forming loops' },
              { label: 'Emotional Context', value: 'Placements during genuine personal progress' },
              { label: 'Self-Improvement Mindset', value: 'Users actively seeking solutions and tools' },
              { label: 'Action-Oriented Moments', value: 'Decision-making context, not passive scrolling' },
              { label: 'Relevance Without Aggression', value: 'Curated, not targeted — trust preserved' },
            ].map(({ label, value }) => (
              <Card key={label} variant="glass">
                <CardContent className="p-4">
                  <p className="section-label text-primary/70 mb-1">{label}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison */}
          <Card variant="surface">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="section-label text-destructive/60 mb-2">Traditional Ads</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground/70">
                    <li>• Interruptive placement</li>
                    <li>• Passive scrolling context</li>
                    <li>• Ad fatigue & blindness</li>
                    <li>• Low trust signal</li>
                  </ul>
                </div>
                <div>
                  <p className="section-label text-primary/70 mb-2">LifeStack Curated</p>
                  <ul className="space-y-1.5 text-xs text-foreground/60">
                    <li>• <strong>Intent-aligned</strong></li>
                    <li>• <strong>Decision-making context</strong></li>
                    <li>• <strong>Trust-native presence</strong></li>
                    <li>• <strong>Organic brand signal</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Screen>

      {/* ═══ SCREEN 11: PRIVACY & TRUST — Settings UI ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Shield /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Privacy & Trust</h2>
          </div>
          <p className="page-subtitle">Responsible, limited, context-respectful inventory</p>

          {/* Settings-style toggles */}
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="divide-y divide-white/[0.04]">
              {[
                { label: 'Curated Suggestions', desc: 'Show context-relevant partner recommendations', on: true },
                { label: 'Privacy-Safe Matching', desc: 'No personal data shared with partners', on: true },
                { label: 'Limited Inventory', desc: 'Maximum 1 curated spot per session', on: true },
                { label: 'Transparent Attribution', desc: 'All curated content clearly labelled', on: true },
              ].map(({ label, desc, on }) => (
                <div key={label} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90">{label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{desc}</p>
                  </div>
                  <div className={cn(
                    'w-10 h-6 rounded-full relative transition-colors shrink-0 ml-3',
                    on ? 'bg-primary/80' : 'bg-muted/40',
                  )}>
                    <div className={cn(
                      'w-4 h-4 rounded-full bg-foreground absolute top-1 transition-transform',
                      on ? 'translate-x-5' : 'translate-x-1',
                    )} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card variant="surface">
              <CardContent className="p-3.5 text-center">
                <Lock className="w-5 h-5 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">No Ad Overload</p>
              </CardContent>
            </Card>
            <Card variant="surface">
              <CardContent className="p-3.5 text-center">
                <Shield className="w-5 h-5 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">User Trust First</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 12: PARTNER VALUE PROPOSITION ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Gem /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Partner Value Proposition</h2>
          </div>
          <p className="page-subtitle">Why brands invest in LifeStack</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Crown, label: 'Prestige Inventory' },
              { icon: Shield, label: 'Trust-Rich Visibility' },
              { icon: Target, label: 'Identity-Aligned' },
              { icon: Star, label: 'Premium Audience' },
              { icon: Zap, label: 'Early-Mover Edge' },
              { icon: Lock, label: 'Exclusive Access' },
            ].map(({ icon: Icon, label }) => (
              <Card key={label} variant="glass">
                <CardContent className="p-4 text-center">
                  <Orb size="sm"><Icon /></Orb>
                  <p className="text-xs font-medium text-foreground/80 mt-2">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card variant="gold" className="overflow-hidden">
            <CardContent className="p-5 text-center space-y-3">
              <Award className="w-8 h-8 text-primary mx-auto" />
              <h3 className="font-serif font-semibold text-base text-foreground">Strategic Early-Mover Advantage</h3>
              <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
                Limited placement inventory means early partners secure the most valuable positions in a growing ecosystem of engaged, action-oriented users.
              </p>
            </CardContent>
          </Card>
        </div>
      </Screen>

      {/* ═══ SCREEN 13: EARLY MOVER / EXCLUSIVITY ═══ */}
      <Screen>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Orb><Flame /></Orb>
            <h2 className="font-serif text-xl font-bold tracking-tight">Exclusivity & Packages</h2>
          </div>
          <p className="page-subtitle">Limited inventory, strategic positioning</p>

          <div className="space-y-3">
            {[
              { tier: 'Flagship Launch Partner', desc: 'Full ecosystem presence across all surfaces. Maximum visibility and brand integration.', badge: 'Exclusive' },
              { tier: 'Category Owner', desc: 'Sole partner within a life domain. Own Health, Wealth, Productivity, or Growth.', badge: 'Limited' },
              { tier: 'Regional Partner', desc: 'Market-specific presence in South Africa, EMEA, or selected territories.', badge: 'Strategic' },
              { tier: 'Seasonal Campaign', desc: 'Time-bound curated presence during key life moments and seasonal peaks.', badge: 'Flexible' },
            ].map(({ tier, desc, badge }) => (
              <Card key={tier} variant="glass" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-serif font-semibold text-foreground/90">{tier}</h4>
                    <span className="status-badge bg-primary/10 text-primary/80 border-primary/20">{badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Screen>

      {/* ═══ SCREEN 14: CLOSING ═══ */}
      <Screen>
        <div className="max-w-lg mx-auto text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(43,74%,55%), hsl(43,65%,38%))',
              boxShadow: '0 8px 32px -8px hsl(43 74% 52% / 0.3)',
            }}>
            <span className="text-lg font-bold" style={{ color: 'hsl(220,20%,6%)', letterSpacing: '0.06em' }}>LS</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            Own the moments that shape real human progress.
          </h2>

          <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
            LifeStack curated placements are not advertising. They are context-aligned visibility inside the most trusted moments of personal evolution.
          </p>

          <div className="space-y-3">
            <Button variant="gold" size="lg" className="px-8">
              <ArrowRight className="w-4 h-4 mr-2" />
              Begin Partnership Discussion
            </Button>
            <p className="text-xs text-muted-foreground/70">
              partnerships@lifestack.app
            </p>
          </div>

          <div className="pt-8 flex items-center justify-center gap-2">
            <span className="section-label text-primary/40">LifeStack</span>
            <span className="text-[10px] text-muted-foreground/70">|</span>
            <span className="text-[10px] text-muted-foreground/70">Curated Placements</span>
          </div>
        </div>
      </Screen>
    </div>
  );
}
