import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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

export default function Library() {
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
    // The RLS policy handles user context
    const { error } = await supabase.from('playbook_installs').insert({ playbook_id: playbookId } as any);
    if (!error) {
      setInstalled(prev => [...prev, playbookId]);
      toast.success('Playbook added to your workspace!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1">Library</h1>
        <p className="text-muted-foreground">Curated playbooks for every life phase</p>
      </div>

      <div className="grid gap-4">
        {playbooks.map((playbook) => {
          const isInstalled = installed.includes(playbook.id);
          return (
            <Card key={playbook.id} variant="glass" className="hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {playbook.phase && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {phaseLabels[playbook.phase] || playbook.phase}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-lg">{playbook.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{playbook.description}</p>
                  </div>
                  <Button
                    variant={isInstalled ? "outline" : "gold"}
                    size="sm"
                    onClick={() => !isInstalled && installPlaybook(playbook.id)}
                    disabled={isInstalled}
                  >
                    {isInstalled ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
