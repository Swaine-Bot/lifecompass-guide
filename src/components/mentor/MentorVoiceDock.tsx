/**
 * Voice dock for the AI Mentor. Uses Web Speech API (no key, no server).
 *  - Tap mic → start dictation (shows live interim text).
 *  - Auto-submits on final transcript via onTranscript.
 *  - Tap speaker on a reply → speak it aloud / stop.
 *
 * Behaves gracefully when the browser doesn't support speech APIs.
 */
import { useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceMentor } from '@/hooks/useVoiceMentor';
import { toast } from 'sonner';

interface Props {
  /** Called when speech finalizes — caller should send to mentor + (optionally) call speak() on the reply. */
  onTranscript: (text: string) => void;
  /** Imperative speak helper exposed for parent (assistant message playback). */
  registerSpeak?: (fn: (text: string) => void) => void;
  /** Optional dock placement (default inline). */
  className?: string;
}

export function MentorVoiceDock({ onTranscript, registerSpeak, className }: Props) {
  const { supported, listening, speaking, interim, error, start, stop, speak, stopSpeaking } =
    useVoiceMentor({ onTranscript });

  useEffect(() => { registerSpeak?.(speak); }, [registerSpeak, speak]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!supported) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Button
        type="button"
        variant={listening ? 'cta' : 'ghost'}
        size="icon-sm"
        onClick={listening ? stop : start}
        aria-label={listening ? 'Stop listening' : 'Speak to mentor'}
        className={cn(
          'h-9 w-9 rounded-full',
          listening && 'animate-pulse'
        )}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
      {speaking && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={stopSpeaking}
          aria-label="Stop speaking"
          className="h-9 w-9 rounded-full"
        >
          <VolumeX className="w-4 h-4" />
        </Button>
      )}
      {interim && (
        <span className="text-[11px] text-muted-foreground italic truncate max-w-[140px]" aria-live="polite">
          {interim}
        </span>
      )}
    </div>
  );
}

/**
 * Compact speaker button for a single assistant message.
 * Lives outside MentorVoiceDock so each bubble gets its own play/stop.
 */
export function MentorSpeakButton({ text }: { text: string }) {
  const { supported, speaking, speak, stopSpeaking } = useVoiceMentor();
  if (!supported) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
      onClick={() => (speaking ? stopSpeaking() : speak(text))}
      aria-label={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
      {speaking ? 'Stop' : 'Listen'}
    </Button>
  );
}
