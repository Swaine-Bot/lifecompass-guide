import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, BookOpen, ChevronRight, Archive, Trophy, Zap, Calendar } from 'lucide-react';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ShareCardPreview } from '@/components/viral/ShareCardPreview';

interface CinematicChapterCardProps {
  report: {
    id: string;
    report_type: string;
    title: string;
    narrative: string;
    key_stats: Record<string, number>;
    major_wins: string[];
    lessons: string[];
    turning_points: string[];
    period_start: string;
    period_end: string;
    is_favorite: boolean;
    is_read: boolean;
  };
  onFavorite: (id: string, current: boolean) => void;
  onArchive?: (id: string) => void;
  onRead?: (id: string) => void;
  expanded?: boolean;
}

const reportTypeLabels: Record<string, string> = {
  weekly: 'Weekly Chapter',
  monthly: 'Monthly Arc',
  quarterly: 'Quarterly Saga',
};

export function CinematicChapterCard({ report, onFavorite, onArchive, onRead, expanded: initialExpanded }: CinematicChapterCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded ?? false);
  const [showShare, setShowShare] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!report.is_read) onRead?.(report.id);
  };

  const stats = report.key_stats || {};

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          variant="glass-elevated"
          className={cn(
            'overflow-hidden cursor-pointer transition-all',
            !report.is_read && 'ring-1 ring-primary/15'
          )}
          onClick={handleExpand}
        >
          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-primary/50 font-medium">
                    {reportTypeLabels[report.report_type] || report.report_type}
                  </p>
                  <AiContentLabel label="AI-generated" variant="inline" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold leading-tight tracking-tight">{report.title}</h3>
              </div>
              <ChevronRight className={cn(
                'w-4 h-4 text-muted-foreground/30 transition-transform shrink-0 mt-1.5 ml-3',
                expanded && 'rotate-90'
              )} />
            </div>

            {/* Period */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 mb-3">
              <Calendar className="w-3 h-3" />
              <span className="tabular-nums">
                {format(new Date(report.period_start), 'MMM d')} — {format(new Date(report.period_end), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Narrative */}
            <p className={cn(
              'text-sm text-foreground/70 leading-relaxed',
              !expanded && 'line-clamp-2'
            )}>
              {report.narrative}
            </p>

            {/* Expanded content */}
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-5 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Key Stats */}
                {Object.keys(stats).length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="text-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-lg font-bold text-primary font-serif">{value}</div>
                        <div className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.12em] mt-0.5 leading-tight">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Major Wins */}
                {report.major_wins.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.15em] text-primary/50 font-semibold flex items-center gap-1.5 mb-2.5">
                      <Trophy className="w-3 h-3" /> Major Wins
                    </h4>
                    <ul className="space-y-2">
                      {report.major_wins.map((win, i) => (
                        <li key={i} className="text-sm text-foreground/75 flex items-start gap-2.5 leading-relaxed">
                          <span className="text-primary/60 mt-0.5 shrink-0">•</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lessons */}
                {report.lessons.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-semibold flex items-center gap-1.5 mb-2.5">
                      <BookOpen className="w-3 h-3" /> Key Lessons
                    </h4>
                    <ul className="space-y-2">
                      {report.lessons.map((lesson, i) => (
                        <li key={i} className="text-sm text-foreground/65 flex items-start gap-2.5 leading-relaxed">
                          <span className="text-muted-foreground/30 mt-0.5 shrink-0">—</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Turning Points */}
                {report.turning_points.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-semibold flex items-center gap-1.5 mb-2.5">
                      <Zap className="w-3 h-3" /> Turning Points
                    </h4>
                    <ul className="space-y-2">
                      {report.turning_points.map((tp, i) => (
                        <li key={i} className="text-sm text-foreground/65 flex items-start gap-2.5 leading-relaxed">
                          <span className="text-warning/60 mt-0.5 shrink-0">⚡</span>
                          {tp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-white/[0.06]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground/50 hover:text-foreground"
                    onClick={() => onFavorite(report.id, report.is_favorite)}
                  >
                    <Heart className={cn('w-3.5 h-3.5 mr-1', report.is_favorite && 'fill-primary text-primary')} />
                    Save
                  </Button>
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
                      onClick={() => onArchive(report.id)}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {showShare && (
        <ShareCardPreview
          cardType="chapter_complete"
          title={report.title}
          subtitle={report.narrative}
          statValue={`${stats.tasks_completed || 0}`}
          statLabel="tasks completed"
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
