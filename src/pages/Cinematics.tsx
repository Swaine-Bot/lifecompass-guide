import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Film } from 'lucide-react';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { CinematicChapterCard } from '@/components/viral/CinematicChapterCard';
import { PageHeader, EmptyStatePanel } from '@/components/ds';
import { toast } from 'sonner';
import { useEnvironment } from '@/contexts/SensoryContext';
import { ShareButton } from '@/components/share/ShareButton';

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
      <PageHeader
        icon={Film}
        title="Life Cinematics"
        subtitle="Your life story, told in chapters"
      />

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
