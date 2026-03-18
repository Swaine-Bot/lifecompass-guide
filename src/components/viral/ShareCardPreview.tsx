import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Download, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ShareCardPreviewProps {
  cardType: string;
  title: string;
  subtitle?: string;
  statValue?: string;
  statLabel?: string;
  sourceType?: string;
  sourceId?: string;
  onClose?: () => void;
}

const signaturePhrases = [
  'Built, not wished for',
  'Discipline logged',
  'Momentum earned',
  'Chapter complete',
  'Becoming visible',
  'Growth has evidence',
  'Progress recorded',
  'Standards elevated',
];

const themes = {
  executive: {
    bg: 'bg-gradient-to-br from-[hsl(220,20%,8%)] to-[hsl(220,18%,14%)]',
    accent: 'text-primary',
    border: 'border-primary/20',
  },
  warrior: {
    bg: 'bg-gradient-to-br from-[hsl(0,10%,8%)] to-[hsl(220,15%,12%)]',
    accent: 'text-red-400',
    border: 'border-red-500/20',
  },
  minimal: {
    bg: 'bg-[hsl(220,18%,6%)]',
    accent: 'text-foreground',
    border: 'border-border/30',
  },
  cinematic: {
    bg: 'bg-gradient-to-br from-[hsl(260,15%,10%)] via-[hsl(220,18%,8%)] to-[hsl(200,15%,10%)]',
    accent: 'text-primary',
    border: 'border-primary/10',
  },
};

export function ShareCardPreview({
  cardType, title, subtitle, statValue, statLabel, sourceType, sourceId, onClose,
}: ShareCardPreviewProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<keyof typeof themes>('executive');
  const [privacyLevel, setPrivacyLevel] = useState('public');
  const [showNumbers, setShowNumbers] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const phrase = signaturePhrases[Math.floor(Math.random() * signaturePhrases.length)];
  const t = themes[theme];

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from('share_cards').insert({
      user_id: user.id,
      card_type: cardType,
      title,
      subtitle,
      stat_value: showNumbers ? statValue : '•••',
      stat_label: statLabel,
      signature_phrase: phrase,
      theme,
      privacy_level: privacyLevel,
      source_type: sourceType,
      source_id: sourceId,
    });
    if (error) {
      toast.error('Failed to save share card');
    } else {
      toast.success('Share card saved to your Vault');
      onClose?.();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LifeStack — ${title}`,
          text: `${title}${subtitle ? '\n' + subtitle : ''}\n\n${phrase}\n\nlifestack.app`,
        });
        await handleSave();
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${title}${subtitle ? '\n' + subtitle : ''}\n\n${phrase}\n\nlifestack.app`);
      toast.success('Copied to clipboard');
      await handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        {/* Preview Card */}
        <div
          ref={cardRef}
          className={cn(
            'rounded-2xl border p-8 space-y-6 relative overflow-hidden',
            t.bg, t.border
          )}
        >
          {/* Subtle LifeStack watermark */}
          <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/30 font-medium">
            LifeStack
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
              {cardType.replace(/_/g, ' ')}
            </p>
          </div>

          {statValue && (
            <div className="space-y-1">
              <div className={cn(
                'font-bold font-serif break-words',
                t.accent,
                statValue.length > 6 ? 'text-xl' : 'text-4xl'
              )}>
                {showNumbers ? statValue : '•••'}
              </div>
              {statLabel && (
                <p className="text-sm text-muted-foreground">{statLabel}</p>
              )}
            </div>
          )}

          <div className="space-y-2 min-w-0">
            <h2 className="text-xl font-serif font-semibold break-words">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed break-words line-clamp-4">{subtitle}</p>
            )}
          </div>

          <div className="pt-4 border-t border-border/20">
            <p className={cn('text-xs tracking-[0.1em] uppercase font-medium italic', t.accent)}>
              {phrase}
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card variant="glass" className="p-4 space-y-3">
          <div className="flex gap-2">
            <Select value={theme} onValueChange={(v) => setTheme(v as keyof typeof themes)}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="warrior">Warrior</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="cinematic">Cinematic</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNumbers(!showNumbers)}
              className="h-9"
            >
              {showNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1" variant="gold">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSave} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Save to Vault
            </Button>
          </div>

          {onClose && (
            <Button onClick={onClose} variant="ghost" size="sm" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
