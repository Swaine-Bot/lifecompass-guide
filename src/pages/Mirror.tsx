import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { MirrorMomentCard } from '@/components/viral/MirrorMomentCard';
import { toast } from 'sonner';

export default function Mirror() {
  const navigate = useNavigate();
  const {
    mirrorMoments, latestMirror, mirrorLoading,
    generateMirrorMoment, toggleFavorite, markRead, archiveItem,
  } = useViralEngagement();

  const handleReflect = (content: string) => {
    navigate('/journal', { state: { prefill: `Reflecting on: "${content}"\n\n` } });
  };

  const handleGenerate = async () => {
    const result = await generateMirrorMoment();
    if (!result) {
      toast.info('Not enough data yet for a new Mirror Moment. Keep logging your journey.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold">Mirror</h1>
        <p className="text-muted-foreground text-sm">
          AI-powered reflections drawn from your journey
        </p>
      </div>

      {/* Generate Button */}
      <Button
        variant="gold"
        onClick={handleGenerate}
        disabled={mirrorLoading}
        className="w-full"
      >
        {mirrorLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing your patterns...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Mirror Moment
          </>
        )}
      </Button>

      {/* Latest Mirror Moment */}
      {latestMirror && (
        <MirrorMomentCard
          moment={latestMirror}
          onFavorite={(id, cur) => toggleFavorite('mirror_moments', id, cur)}
          onReflect={handleReflect}
          onArchive={(id) => archiveItem('mirror_moments', id)}
          onRead={(id) => markRead('mirror_moments', id)}
        />
      )}

      {/* History */}
      {mirrorMoments.length > 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-muted-foreground">Previous Moments</h2>
          {mirrorMoments.slice(1).map((moment) => (
            <MirrorMomentCard
              key={moment.id}
              moment={moment}
              onFavorite={(id, cur) => toggleFavorite('mirror_moments', id, cur)}
              onReflect={handleReflect}
              onArchive={(id) => archiveItem('mirror_moments', id)}
              compact
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {mirrorMoments.length === 0 && !mirrorLoading && (
        <div className="text-center py-12">
          <Sparkles className="w-10 h-10 text-primary/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Your Mirror Moments will appear here as you build your LifeStack journey.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Keep journaling, tracking habits, and setting goals.
          </p>
        </div>
      )}
    </div>
  );
}
