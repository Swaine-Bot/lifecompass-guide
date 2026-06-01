import { useState, useCallback, useEffect, useMemo } from 'react';
import { Bot, User, ChevronDown, ChevronUp, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ShareButton } from '@/components/share/ShareButton';
import { KeepInsightAction } from '@/components/viral/KeepInsightAction';
import { MentorSpeakButton } from '@/components/mentor/MentorVoiceDock';
import { MentorDocumentMenu } from '@/components/mentor/MentorDocumentMenu';
import { MentorImageLightbox } from './MentorImageLightbox';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';
import { supabase } from '@/integrations/supabase/client';
import { usePlaybookGenerator } from '@/hooks/usePlaybookGenerator';
import { PlaybookPreviewModal } from '@/components/playbook/PlaybookPreviewModal';
import { analyzeForActions } from '@/services/contextualActionEngine';
import { ContextualActions } from '@/components/ds/ContextualActions';
import { useAuth } from '@/contexts/AuthContext';

interface MentorMessageProps {
  role: 'user' | 'assistant';
  content: string;
  conversationId?: string;
  imageUrl?: string | null;
}

function hasActionableContent(content: string): boolean {
  if (content.length < 100) return false;
  const indicators = [
    /\d+\.\s/, /[-•]\s/, /\bstep\b/i, /\bfirst\b.*\bthen\b/i,
    /\brecommend\b/i, /\bstart\sby\b/i, /\btry\b.*\bnext\b/i,
    /\bconsider\b/i, /\baction\b/i, /\bplan\b/i,
  ];
  return indicators.filter(r => r.test(content)).length >= 2;
}

export function MentorMessage({ role, content, conversationId, imageUrl }: MentorMessageProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(!!imageUrl);
  const [savingPlaybook, setSavingPlaybook] = useState(false);
  const { profile } = useAuth();

  const { generating, preview, generateFromMentor, savePlaybook, dismiss } = usePlaybookGenerator();

  // Contextual cross-feature actions for assistant messages
  const suggestedActions = useMemo(() => {
    if (role !== 'assistant' || content.length < 60) return [];
    return analyzeForActions({
      text: content,
      lifePhase: profile?.life_phase,
      source: 'mentor',
    });
  }, [role, content, profile?.life_phase]);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const load = async () => {
      setImageLoading(true);
      const { data } = await supabase.storage
        .from('mentor-images')
        .createSignedUrl(imageUrl, 3600);
      if (!cancelled && data?.signedUrl) setSignedUrl(data.signedUrl);
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
                className="max-h-48 max-w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/[0.08] shadow-sm"
                onClick={() => setLightboxOpen(true)}
              />
            </div>
          )}
          {imageLoading && !signedUrl && (
            <div className="mb-2 flex justify-end">
              <div className="h-32 w-32 rounded-xl bg-secondary/50 flex items-center justify-center border border-white/[0.06]">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          {content && <div className="chat-bubble-user text-sm leading-relaxed whitespace-pre-wrap">{content}</div>}
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center shrink-0 ring-1 ring-white/[0.08]">
          <User className="w-3.5 h-3.5 text-foreground/80" />
        </div>
        {lightboxOpen && signedUrl && (
          <MentorImageLightbox src={signedUrl} onClose={() => setLightboxOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/15 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-primary/90" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="chat-bubble-assistant">
          {isHidden ? (
            <p className="text-foreground/50 text-sm italic">Response hidden</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words text-foreground/90">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {/* ── Action row ── */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <AiContentLabel label="Mentor AI" variant="inline" />
          <Button
            variant="ghost"
            size="sm"
            className="action-btn h-6 px-2 text-[11px]"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? (
              <><ChevronDown className="w-3 h-3 mr-1" /> Show</>
            ) : (
              <><ChevronUp className="w-3 h-3 mr-1" /> Hide</>
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
                  quote: content,
                  contextTag: 'Life Strategy',
                }}
              />
              <MentorSpeakButton text={content} />
              <MentorDocumentMenu
                title="Mentor Insight"
                content={content}
                subtitle="Generated with LifeStack AI Mentor"
              />
              {showPlaybookAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-primary/70 hover:text-primary gap-1"
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
              {suggestedActions.length > 0 && (
                <ContextualActions actions={suggestedActions} compact />
              )}
            </>
          )}
        </div>

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
