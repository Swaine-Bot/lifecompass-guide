import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, PenLine, Eye, ChevronDown, Sparkles, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareCardPreview } from '@/components/viral/ShareCardPreview';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';

interface MirrorMomentCardProps {
  moment: {
    id: string;
    category: string;
    content: string;
    confidence_score: number;
    source_categories: string[];
    is_read: boolean;
    is_favorite: boolean;
  };
  onFavorite: (id: string, current: boolean) => void;
  onReflect?: (content: string) => void;
  onArchive?: (id: string) => void;
  onRead?: (id: string) => void;
  compact?: boolean;
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  progress_recognition: { label: 'Progress', icon: '📈' },
  identity_shift: { label: 'Identity Shift', icon: '🦋' },
  behaviour_contradiction: { label: 'Contradiction', icon: '⚡' },
  pattern_recognition: { label: 'Pattern', icon: '🔄' },
  resilience_recognition: { label: 'Resilience', icon: '🛡️' },
  drift_warning: { label: 'Drift Warning', icon: '⚠️' },
  hidden_strength: { label: 'Hidden Strength', icon: '💎' },
  alignment_insight: { label: 'Alignment', icon: '🎯' },
  past_self_comparison: { label: 'Past vs Present', icon: '🪞' },
  emerging_archetype: { label: 'Emerging Identity', icon: '👤' },
};

export function MirrorMomentCard({ moment, onFavorite, onReflect, onArchive, onRead, compact }: MirrorMomentCardProps) {
  const [revealed, setRevealed] = useState(moment.is_read);
  const [showSources, setShowSources] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const cat = categoryLabels[moment.category] || { label: moment.category, icon: '✨' };

  const handleReveal = () => {
    setRevealed(true);
    onRead?.(moment.id);
  };

  if (compact) {
    return (
      <Card variant="glass" className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-base mt-0.5">{cat.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary/60 font-medium uppercase tracking-[0.12em] mb-1">{cat.label}</p>
            <p className="text-sm leading-relaxed text-foreground/80">{moment.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onFavorite(moment.id, moment.is_favorite)}
            className="shrink-0"
          >
            <Heart className={cn('w-3.5 h-3.5', moment.is_favorite && 'fill-primary text-primary')} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card variant="glass-elevated" className="overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{cat.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-primary/60 font-semibold">Mirror Moment</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground/50">{cat.label}</p>
                  <AiContentLabel variant="inline" />
                </div>
              </div>
            </div>
            {/* Confidence dots */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i <= Math.round(moment.confidence_score * 5) ? 'bg-primary' : 'bg-muted-foreground/15'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          {!revealed ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-primary/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/50 mb-4">A new insight has emerged from your data</p>
              <Button variant="gold" onClick={handleReveal} className="px-8">
                <Eye className="w-4 h-4 mr-2" />
                Reveal Mirror Moment
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="space-y-4"
              >
                <p className="text-base sm:text-lg font-serif leading-relaxed italic text-foreground/85">
                  "{moment.content}"
                </p>

                {/* Source explanation */}
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 flex items-center gap-1 transition-colors"
                >
                  Why am I seeing this?
                  <ChevronDown className={cn('w-3 h-3 transition-transform', showSources && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">Generated from</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(moment.source_categories || []).map((src: string) => (
                            <span key={src} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/[0.06] text-primary/60 border border-primary/10">
                              {src.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-white/[0.06]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground"
                    onClick={() => onFavorite(moment.id, moment.is_favorite)}
                  >
                    <Heart className={cn('w-3.5 h-3.5 mr-1', moment.is_favorite && 'fill-primary text-primary')} />
                    Save
                  </Button>
                  {onReflect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground"
                      onClick={() => onReflect(moment.content)}
                    >
                      <PenLine className="w-3.5 h-3.5 mr-1" />
                      Reflect
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground"
                    onClick={() => setShowShare(true)}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Share
                  </Button>
                  {onArchive && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ml-auto text-muted-foreground/30 hover:text-muted-foreground"
                      onClick={() => onArchive(moment.id)}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </Card>

      {showShare && (
        <ShareCardPreview
          cardType="mirror_moment"
          title={moment.content}
          subtitle={cat.label}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
