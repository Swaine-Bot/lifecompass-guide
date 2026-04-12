import { Link } from 'react-router-dom';
import { 
  CalendarDays, Gift, Film, Archive, Lightbulb, BookOpen, 
  ChevronRight, Layers, Sparkles, Filter
} from 'lucide-react';
import { useEnvironment } from '@/contexts/SensoryContext';
import { PageHeader } from '@/components/ds';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const modules = [
  {
    path: '/calendar',
    icon: CalendarDays,
    title: 'Calendar',
    subtitle: 'Plan and reschedule your life rhythm',
  },
  {
    path: '/life-events',
    icon: Gift,
    title: 'Life Events',
    subtitle: 'Track meaningful dates and future reminders',
  },
  {
    path: '/cinematics',
    icon: Film,
    title: 'Cinematics',
    subtitle: 'Experience your life in evolving chapters',
  },
  {
    path: '/vault',
    icon: Archive,
    title: 'Vault',
    subtitle: 'Your saved moments, cards, and artifacts',
  },
  {
    path: '/insights',
    icon: Lightbulb,
    title: 'Insight Library',
    subtitle: 'Revisit saved insights and reflections',
  },
];

const phaseLabels: Record<string, string> = {
  student_early_career: 'Student / Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

const phaseOrder = ['student_early_career', 'builder', 'family_home', 'explorer', 'legacy_impact'];

interface PlaybookContent {
  purpose?: string;
  why?: string;
  action_types?: string[];
  tasks?: { title: string; description: string; effort_minutes: number }[];
  moves?: { title: string; description: string; effort_minutes: number }[];
}

interface Playbook {
  id: string;
  title: string;
  description: string | null;
  phase: string | null;
  category: string | null;
  content_json: PlaybookContent | null;
}

export default function Library() {
  useEnvironment('library');

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        icon={Layers}
        title="Library"
        subtitle="Your deeper LifeStack world"
        back="/home"
      />

      <div className="grid gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.path}
              to={mod.path}
              className="group flex items-center gap-4 p-4 rounded-[22px] bg-card/60 backdrop-blur-xl border border-white/[0.06] shadow-[0_2px_20px_-4px_hsl(220_20%_0%/0.4)] hover:border-primary/20 hover:bg-card/75 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-[15px] leading-tight">{mod.title}</h3>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">{mod.subtitle}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Playbooks Section */}
      <PlaybooksSection />
    </div>
  );
}

// ─── Playbooks Section ────────────────────────────────────────

function PlaybooksSection() {
  const { profile } = useAuth();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const userPhase = profile?.life_phase || 'builder';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: playbooksData } = await supabase
      .from('library_playbooks')
      .select('id, title, description, phase, category, content_json')
      .eq('published', true);

    const { data: installsData } = await supabase
      .from('playbook_installs')
      .select('playbook_id');

    setPlaybooks((playbooksData || []) as Playbook[]);
    setInstalled(installsData?.map(i => i.playbook_id) || []);
    setLoading(false);
  };

  // Group playbooks by phase
  const grouped = useMemo(() => {
    const map: Record<string, Playbook[]> = {};
    for (const pb of playbooks) {
      const phase = pb.phase || 'other';
      if (!map[phase]) map[phase] = [];
      map[phase].push(pb);
    }
    return map;
  }, [playbooks]);

  // Determine which phases to show
  const visiblePhases = useMemo(() => {
    if (selectedPhase) return [selectedPhase];
    // Show user's phase first, then the rest
    const ordered = [userPhase, ...phaseOrder.filter(p => p !== userPhase)];
    return ordered.filter(p => grouped[p]?.length);
  }, [selectedPhase, userPhase, grouped]);

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-[22px] bg-card/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (playbooks.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-[15px]">Playbooks</h3>
          <p className="text-xs text-muted-foreground/70">Phase-aware action systems for your goals</p>
        </div>
      </div>

      {/* Phase Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedPhase(null)}
          className={cn(
            "text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all border",
            !selectedPhase
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/60 text-muted-foreground/70 border-white/[0.06] hover:border-primary/20"
          )}
        >
          All Phases
        </button>
        {phaseOrder.filter(p => grouped[p]?.length).map(phase => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(selectedPhase === phase ? null : phase)}
            className={cn(
              "text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all border",
              selectedPhase === phase
                ? "bg-primary text-primary-foreground border-primary"
                : phase === userPhase && !selectedPhase
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-card/60 text-muted-foreground/70 border-white/[0.06] hover:border-primary/20"
            )}
          >
            {phaseLabels[phase]}
            {phase === userPhase && <Sparkles className="w-3 h-3 inline ml-1" />}
          </button>
        ))}
      </div>

      {/* Grouped Playbooks */}
      {visiblePhases.map(phase => {
        const phasePlaybooks = grouped[phase] || [];
        if (phasePlaybooks.length === 0) return null;

        return (
          <div key={phase} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-foreground/85 font-medium">
                {phaseLabels[phase] || phase}
              </p>
              {phase === userPhase && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 uppercase tracking-wider">
                  Your Phase
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40">{phasePlaybooks.length} playbooks</span>
            </div>

            {phasePlaybooks.map((playbook) => {
              const isInstalled = installed.includes(playbook.id);
              const content = playbook.content_json;
              const actionTypes = content?.action_types || [];
              const moveCount = (content?.moves || content?.tasks || []).length;

              return (
                <Link
                  key={playbook.id}
                  to={`/playbook/${playbook.id}`}
                  className="group flex items-center gap-4 p-4 rounded-[22px] bg-card/60 backdrop-blur-xl border border-white/[0.06] shadow-[0_2px_20px_-4px_hsl(220_20%_0%/0.4)] hover:border-primary/20 hover:bg-card/75 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {playbook.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/70 uppercase tracking-wider">
                          {playbook.category}
                        </span>
                      )}
                      {isInstalled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Installed
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{playbook.title}</h4>
                    <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5">
                      {content?.purpose || playbook.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {actionTypes.map(at => (
                        <span key={at} className="text-[9px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground/60 capitalize">
                          {at === 'moves' ? 'Micro Moves' : at === 'goal' ? 'Goal' : 'Habit'}
                        </span>
                      ))}
                      {moveCount > 0 && (
                        <span className="text-[10px] text-muted-foreground/40">{moveCount} actions</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
