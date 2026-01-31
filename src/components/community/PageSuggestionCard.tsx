import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, UserPlus, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PageSuggestion {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  page_category: string | null;
  is_verified: boolean;
}

interface PageSuggestionCardProps {
  page: PageSuggestion;
  onDismiss: (pageId: string) => void;
  onFollow: (pageId: string) => void;
}

export function PageSuggestionCard({ page, onDismiss, onFollow }: PageSuggestionCardProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [followed, setFollowed] = useState(false);

  const handleFollow = async () => {
    if (!user) return;
    setIsFollowing(true);

    try {
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: page.user_id,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Already following this page');
        } else {
          throw error;
        }
      } else {
        setFollowed(true);
        toast.success(`Following ${page.name}`);
        onFollow(page.user_id);
      }
    } catch (error) {
      console.error('Error following page:', error);
      toast.error('Failed to follow page');
    } finally {
      setIsFollowing(false);
    }
  };

  const handleDismiss = async () => {
    if (!user) return;
    setIsDismissing(true);

    try {
      await supabase.from('page_dismissals').insert({
        user_id: user.id,
        dismissed_page_id: page.user_id,
      });

      onDismiss(page.user_id);
    } catch (error) {
      console.error('Error dismissing page:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  if (followed) {
    return null;
  }

  const categoryLabel = page.page_category?.replace(/_/g, ' ') || 'Organization';

  return (
    <Card variant="glass" className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={page.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{page.name || 'Unknown'}</span>
              {page.is_verified && (
                <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
              )}
            </div>
            
            <Badge variant="secondary" className="text-xs capitalize mb-2">
              {categoryLabel}
            </Badge>

            {page.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{page.bio}</p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="gold"
                onClick={handleFollow}
                disabled={isFollowing}
                className="flex-1"
              >
                {isFollowing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isDismissing}
                className="px-2"
              >
                {isDismissing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/30 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3" />
          <span>Suggested for you on LifeStack</span>
        </div>
      </CardContent>
    </Card>
  );
}
