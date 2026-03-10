import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Film, BookOpen } from 'lucide-react';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { CinematicChapterCard } from '@/components/viral/CinematicChapterCard';
import { toast } from 'sonner';

export default function Cinematics() {
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold">Life Cinematics</h1>
        <p className="text-muted-foreground text-sm">
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

      {/* Reports */}
      {cinematicLoading && cinematicReports.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Crafting your chapter...</p>
        </div>
      )}

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
        <div className="text-center py-12">
          <Film className="w-10 h-10 text-primary/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Your life chapters will unfold here.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Generate your first chapter above to begin your narrative.
          </p>
        </div>
      )}
    </div>
  );
}
