import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Heart, Sparkles, Film, Image } from 'lucide-react';
import { format } from 'date-fns';
import { useViralEngagement } from '@/hooks/useViralEngagement';
import { MirrorMomentCard } from '@/components/viral/MirrorMomentCard';
import { CinematicChapterCard } from '@/components/viral/CinematicChapterCard';
import { EmptyStatePanel } from '@/components/viral/EmptyStatePanel';
import { engagementEventService } from '@/services/engagementEventService';

export default function Vault() {
  const navigate = useNavigate();
  const {
    mirrorMoments, cinematicReports, shareCards,
    toggleFavorite, archiveItem,
  } = useViralEngagement();

  useEffect(() => {
    engagementEventService.log('vault_visited', 'vault');
  }, []);

  const favoriteMoments = mirrorMoments.filter(m => m.is_favorite);
  const favoriteReports = cinematicReports.filter(r => r.is_favorite);
  const hasFavorites = favoriteMoments.length > 0 || favoriteReports.length > 0;

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
          {!hasFavorites ? (
            <EmptyStatePanel
              icon={Heart}
              title="No favorites yet"
              description="Favorite reflections, save cinematic chapters, and create share cards to build your archive."
              primaryCta={{ label: 'Open Mirror', onClick: () => navigate('/mirror') }}
              secondaryCta={{ label: 'View Chapters', onClick: () => navigate('/cinematics') }}
            />
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
            <EmptyStatePanel
              icon={Sparkles}
              title="Your reflection is still forming"
              description="Mirror Moments will appear here as you build your LifeStack journey."
              primaryCta={{ label: 'Go to Mirror', onClick: () => navigate('/mirror') }}
            />
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
            <EmptyStatePanel
              icon={Film}
              title="No chapters yet"
              description="Your life chapters will unfold here once you've built enough momentum."
              primaryCta={{ label: 'Go to Cinematics', onClick: () => navigate('/cinematics') }}
            />
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
            <EmptyStatePanel
              icon={Image}
              title="Your Vault is empty"
              description="Share cards will appear here when you share your milestones and achievements."
            />
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
