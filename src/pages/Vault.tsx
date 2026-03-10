import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Sparkles, Film, Image, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { MirrorMomentCard } from '@/components/viral/MirrorMomentCard';
import { CinematicChapterCard } from '@/components/viral/CinematicChapterCard';
import { toast } from 'sonner';

export default function Vault() {
  const {
    mirrorMoments, cinematicReports, shareCards,
    toggleFavorite, archiveItem,
  } = useViralEngagement();

  const favoriteMoments = mirrorMoments.filter(m => m.is_favorite);
  const favoriteReports = cinematicReports.filter(r => r.is_favorite);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold">Vault</h1>
        <p className="text-muted-foreground text-sm">
          Your saved moments, chapters, and share cards
        </p>
      </div>

      <Tabs defaultValue="favorites">
        <TabsList className="w-full">
          <TabsTrigger value="favorites" className="flex-1">
            <Heart className="w-3.5 h-3.5 mr-1.5" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="moments" className="flex-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Moments
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex-1">
            <Film className="w-3.5 h-3.5 mr-1.5" /> Chapters
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex-1">
            <Image className="w-3.5 h-3.5 mr-1.5" /> Cards
          </TabsTrigger>
        </TabsList>

        {/* Favorites */}
        <TabsContent value="favorites" className="space-y-4 mt-4">
          {favoriteMoments.length === 0 && favoriteReports.length === 0 ? (
            <EmptyState icon={Heart} text="Save your favorite moments and chapters here" />
          ) : (
            <>
              {favoriteMoments.map(m => (
                <MirrorMomentCard
                  key={m.id}
                  moment={m}
                  onFavorite={(id, cur) => toggleFavorite('mirror_moments', id, cur)}
                  compact
                />
              ))}
              {favoriteReports.map(r => (
                <CinematicChapterCard
                  key={r.id}
                  report={r}
                  onFavorite={(id, cur) => toggleFavorite('cinematic_reports', id, cur)}
                />
              ))}
            </>
          )}
        </TabsContent>

        {/* All Moments */}
        <TabsContent value="moments" className="space-y-3 mt-4">
          {mirrorMoments.length === 0 ? (
            <EmptyState icon={Sparkles} text="Your Mirror Moments will appear here" />
          ) : (
            mirrorMoments.map(m => (
              <MirrorMomentCard
                key={m.id}
                moment={m}
                onFavorite={(id, cur) => toggleFavorite('mirror_moments', id, cur)}
                onArchive={(id) => archiveItem('mirror_moments', id)}
                compact
              />
            ))
          )}
        </TabsContent>

        {/* All Chapters */}
        <TabsContent value="chapters" className="space-y-4 mt-4">
          {cinematicReports.length === 0 ? (
            <EmptyState icon={Film} text="Your life chapters will appear here" />
          ) : (
            cinematicReports.map(r => (
              <CinematicChapterCard
                key={r.id}
                report={r}
                onFavorite={(id, cur) => toggleFavorite('cinematic_reports', id, cur)}
                onArchive={(id) => archiveItem('cinematic_reports', id)}
              />
            ))
          )}
        </TabsContent>

        {/* Share Cards */}
        <TabsContent value="cards" className="space-y-3 mt-4">
          {shareCards.length === 0 ? (
            <EmptyState icon={Image} text="Your share cards will appear here when you share progress" />
          ) : (
            shareCards.map(card => (
              <Card key={card.id} variant="glass" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-primary/60 font-medium">
                      {card.card_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm font-medium mt-1">{card.title}</p>
                    {card.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                        {card.theme}
                      </span>
                      {card.signature_phrase && (
                        <span className="text-[10px] text-primary/60 italic">
                          {card.signature_phrase}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(card.created_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-10 h-10 text-primary/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
