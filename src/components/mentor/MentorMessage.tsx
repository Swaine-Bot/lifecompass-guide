import { useState, useCallback, useEffect } from 'react';
import { Bot, User, ChevronDown, ChevronUp, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ShareButton } from '@/components/share/ShareButton';
import { KeepInsightAction } from '@/components/viral/KeepInsightAction';
import { MentorImageLightbox } from './MentorImageLightbox';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';
import { supabase } from '@/integrations/supabase/client';
import { usePlaybookGenerator } from '@/hooks/usePlaybookGenerator';
import { PlaybookPreviewModal } from '@/components/playbook/PlaybookPreviewModal';

interface MentorMessageProps {
  role: 'user' | 'assistant';
  content: string;
  conversationId?: string;
  imageUrl?: string | null;
}

// Heuristic: show playbook action when response has actionable content
function hasActionableContent(content: string): boolean {
  if (content.length < 100) return false;
  const indicators = [
    /\d+\.\s/,               // numbered list
    /[-•]\s/,                 // bullet list
    /\bstep\b/i,
    /\bfirst\b.*\bthen\b/i,
    /\brecommend\b/i,
    /\bstart\sby\b/i,
    /\btry\b.*\bnext\b/i,
    /\bconsider\b/i,
    /\baction\b/i,
    /\bplan\b/i,
  ];
  const matches = indicators.filter(r => r.test(content)).length;
  return matches >= 2;
}

export function MentorMessage({ role, content, conversationId, imageUrl }: MentorMessageProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(!!imageUrl);
  const [savingPlaybook, setSavingPlaybook] = useState(false);

  const { generating, preview, generateFromMentor, savePlaybook, dismiss } = usePlaybookGenerator();

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const load = async () => {
      setImageLoading(true);
      const { data } = await supabase.storage
        .from('mentor-images')
        .createSignedUrl(imageUrl, 3600);
      if (!cancelled && data?.signedUrl) {
        setSignedUrl(data.signedUrl);
      }
      if (!cancelled) setImageLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [imageUrl]);

  const handleCreatePlaybook = () => {
    generateFromMentor(content, conversationId);
  };

  const handleSavePlaybook = async (tasks: { title: string; description: string; effort_minutes: number }[]) => {
    if (!preview) return;
    setSavingPlaybook(true);
    await savePlaybook(
      { ...preview, tasks },
      { conversationId, sourceType: 'mentor', sourceMessageContent: content.slice(0, 500) }
    );
    setSavingPlaybook(false);
  };

  const showPlaybookAction = role === 'assistant' && hasActionableContent(content);

  if (role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%]">
          {signedUrl && (
            <div className="mb-2 flex justify-end">
              <img
                src={signedUrl}
                alt="Shared image"
                className="max-h-48 max-w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border/20"
                onClick={() => setLightboxOpen(true)}
              />
            </div>
          )}
          {imageLoading && !signedUrl && (
            <div className="mb-2 flex justify-end">
              <div className="h-32 w-32 rounded-xl bg-secondary/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          {content && <div className="chat-bubble-user">{content}</div>}
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
        {lightboxOpen && signedUrl && (
          <MentorImageLightbox src={signedUrl} onClose={() => setLightboxOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="chat-bubble-assistant">
          {isHidden ? (
            <p className="text-muted-foreground text-sm italic">Response hidden</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <AiContentLabel label="Mentor AI" variant="inline" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show response
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Hide response
              </>
            )}
          </Button>
          {!isHidden && (
            <>
              <KeepInsightAction
                quote={content}
                contextTag="Life Strategy"
                conversationId={conversationId}
              />
              <ShareButton
                source={{
                  type: 'mentor_insight',
                  title: 'Mentor Insight',
                  quote: content.length > 120 ? content.slice(0, 117) + '...' : content,
                  contextTag: 'Life Strategy',
                }}
              />
              {showPlaybookAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary/80 hover:text-primary gap-1"
                  onClick={handleCreatePlaybook}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  Turn into Moves
                </Button>
              )}
            </>
          )}
        </div>

        {/* Playbook Preview Modal */}
        {preview && (
          <PlaybookPreviewModal
            open={!!preview}
            title={preview.playbook_title}
            tasks={preview.tasks}
            saving={savingPlaybook}
            onSave={handleSavePlaybook}
            onDismiss={dismiss}
          />
        )}
      </div>
    </div>
  );
}
