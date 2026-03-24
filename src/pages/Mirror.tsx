import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, PenLine, Flame } from 'lucide-react';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { MirrorMomentCard } from '@/components/viral/MirrorMomentCard';
import { EmptyStatePanel } from '@/components/viral/EmptyStatePanel';
import { engagementEventService } from '@/services/engagementEventService';
import { toast } from 'sonner';
import { useEnvironment } from '@/contexts/SensoryContext';

export default function Mirror() {
  useEnvironment('mirror');
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
    <div className="space-y-5 animate-fade-in">
      {/* Header — Reflective, intimate */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <Sparkles className="w-4 h-4 text-primary/70" />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">Mirror</h1>
        </div>
        <p className="text-muted-foreground/50 text-xs uppercase tracking-wider ml-[42px]">
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
        <EmptyStatePanel
          icon={Sparkles}
          title="Your reflection is still forming"
          description="Keep journaling, tracking habits, and completing goals. Once LifeStack has enough signal, your first Mirror Moment will appear."
          primaryCta={{ label: 'Write in Journal', onClick: () => navigate('/journal') }}
          secondaryCta={{ label: 'Log a Habit', onClick: () => navigate('/habits') }}
        />
      )}
    </div>
  );
}
