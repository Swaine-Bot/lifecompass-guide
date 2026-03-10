import { useState } from 'react';
import { Lightbulb, Check, Share2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { engagementEventService } from '@/services/engagementEventService';
import { toast } from 'sonner';

interface KeepInsightActionProps {
  quote: string;
  contextTag?: string;
  conversationId?: string;
}

export function KeepInsightAction({ quote, contextTag = 'Life Strategy', conversationId }: KeepInsightActionProps) {
  const { user } = useAuth();
  const { openShareStudio } = useUniversalShare();
  const [saved, setSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Truncate to 20 words max for share card
  const truncatedQuote = quote.split(/\s+/).slice(0, 20).join(' ');
  const displayQuote = truncatedQuote.length < quote.length ? truncatedQuote + '…' : truncatedQuote;

  const saveInsight = async () => {
    if (!user) return;
    const { error } = await supabase.from('saved_insights').insert({
      user_id: user.id,
      quote: displayQuote,
      context_tag: contextTag,
      source_conversation_id: conversationId || null,
    });

    if (!error) {
      setSaved(true);
      setShowOptions(true);
      engagementEventService.log('insight_saved', 'broadcast', { context_tag: contextTag });
      toast.success('Insight saved to your library');
    }
  };

  const handleKeepPrivate = () => {
    setShowOptions(false);
  };

  const handleCreateShareCard = () => {
    setShowOptions(false);
    openShareStudio({
      type: 'mentor_insight',
      title: 'Mentor Insight',
      quote: displayQuote,
      contextTag,
    });
    engagementEventService.log('insight_shared', 'broadcast', { context_tag: contextTag });
  };

  if (showOptions) {
    return (
      <div className="flex items-center gap-1.5 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleKeepPrivate}
        >
          <Lock className="w-3 h-3" />
          Keep Private
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 text-primary hover:text-primary"
          onClick={handleCreateShareCard}
        >
          <Share2 className="w-3 h-3" />
          Create Share Card
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
      onClick={saved ? undefined : saveInsight}
      disabled={saved && !showOptions}
    >
      {saved ? (
        <>
          <Check className="w-3 h-3 text-primary" />
          Saved
        </>
      ) : (
        <>
          <Lightbulb className="w-3 h-3" />
          Keep Insight
        </>
      )}
    </Button>
  );
}
