import { Link } from 'react-router-dom';
import { 
  CalendarDays, Gift, Film, Archive, Lightbulb, BookOpen, 
  ChevronRight, Layers
} from 'lucide-react';
import { useEnvironment } from '@/contexts/SensoryContext';
import { PageHeader } from '@/components/ds';

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
  {
    path: '/library',
    icon: BookOpen,
    title: 'Playbooks',
    subtitle: 'Structured action systems built for your goals',
    isPlaybooks: true,
  },
];

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
          // Playbooks links to the same page — render as a non-link card 
          // that scrolls down, or we can simply skip self-link.
          // For simplicity, playbooks section is inline below.
          if (mod.isPlaybooks) return null;

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

        {/* Playbooks inline */}
        <PlaybooksSection />
      </div>
    </div>
  );
}

// ─── Playbooks Section (inline) ────────────────────────────────────
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Playbook {
  id: string;
  title: string;
  description: string | null;
  phase: string | null;
  category: string | null;
}

const phaseLabels: Record<string, string> = {
  student_early_career: 'Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy',
};

function PlaybooksSection() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: playbooksData } = await supabase
      .from('library_playbooks')
      .select('id, title, description, phase, category')
      .eq('published', true);

    const { data: installsData } = await supabase
      .from('playbook_installs')
      .select('playbook_id');

    setPlaybooks(playbooksData || []);
    setInstalled(installsData?.map(i => i.playbook_id) || []);
    setLoading(false);
  };

  const installPlaybook = async (playbookId: string) => {
    const { error } = await supabase.from('playbook_installs').insert({ playbook_id: playbookId } as any);
    if (!error) {
      setInstalled(prev => [...prev, playbookId]);
      toast.success('Playbook added to your workspace!');
    }
  };

  if (loading || playbooks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1 pt-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-[15px]">Playbooks</h3>
          <p className="text-xs text-muted-foreground/70">Structured action systems built for your goals</p>
        </div>
      </div>

      {playbooks.map((playbook) => {
        const isInstalled = installed.includes(playbook.id);
        return (
          <div
            key={playbook.id}
            className="flex items-center gap-4 p-4 rounded-[22px] bg-card/60 backdrop-blur-xl border border-white/[0.06] shadow-[0_2px_20px_-4px_hsl(220_20%_0%/0.4)]"
          >
            <div className="flex-1 min-w-0">
              {playbook.phase && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/70 uppercase tracking-wider">
                  {phaseLabels[playbook.phase] || playbook.phase}
                </span>
              )}
              <h4 className="font-medium text-sm mt-1">{playbook.title}</h4>
              <p className="text-xs text-muted-foreground/60 line-clamp-2 mt-0.5">{playbook.description}</p>
            </div>
            <Button
              variant={isInstalled ? "outline" : "gold"}
              size="sm"
              onClick={() => !isInstalled && installPlaybook(playbook.id)}
              disabled={isInstalled}
              className="shrink-0 rounded-full"
            >
              {isInstalled ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
