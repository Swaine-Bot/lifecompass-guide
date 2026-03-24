import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Film } from 'lucide-react';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { CinematicChapterCard } from '@/components/viral/CinematicChapterCard';
import { EmptyStatePanel } from '@/components/viral/EmptyStatePanel';
import { toast } from 'sonner';
import { useEnvironment } from '@/contexts/SensoryContext';

export default function Cinematics() {
  useEnvironment('cinematics');
  const navigate = useNavigate();
  const {
    cinematicReports, cinematicLoading,
    generateCinematicReport, toggleFavorite, markRead, archiveItem,
  } = useViralEngagement();
  const [activeType, setActiveType] = useState('weekly');

  const handleGenerate = async (type: string) => {
    const result = await generateCinematicReport(type);
    if (!result) {
      toast.info('Need more data to generate this chapter. Keep building your story.');
    }
  };

  const filtered = cinematicReports.filter(r =>
    activeType === 'all' || r.report_type === activeType
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header — Cinematic, aspirational */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <Film className="w-4 h-4 text-primary/70" />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">Life Cinematics</h1>
        </div>
        <p className="text-muted-foreground/50 text-xs uppercase tracking-wider ml-[38px]">
          Your life story, told in chapters
        </p>
      </div>

      {/* Generate Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {['weekly', 'monthly', 'quarterly'].map((type) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(type)}
            disabled={cinematicLoading}
            className="capitalize"
          >
            {cinematicLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              type
            )}
          </Button>
        ))}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeType} onValueChange={setActiveType}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly" className="flex-1">Quarterly</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading */}
      {cinematicLoading && cinematicReports.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Crafting your chapter...</p>
        </div>
      )}

      {/* Reports */}
      <div className="space-y-4">
        {filtered.map((report, idx) => (
          <CinematicChapterCard
            key={report.id}
            report={report}
            onFavorite={(id, cur) => toggleFavorite('cinematic_reports', id, cur)}
            onArchive={(id) => archiveItem('cinematic_reports', id)}
            onRead={(id) => markRead('cinematic_reports', id)}
            expanded={idx === 0}
          />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !cinematicLoading && (
        <EmptyStatePanel
          icon={Film}
          title="No chapter yet"
          description="When your activity forms a meaningful pattern, LifeStack will turn it into a story. Generate your first chapter above to begin."
          primaryCta={{ label: 'Start Journaling', onClick: () => navigate('/journal') }}
        />
      )}
    </div>
  );
}
