import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, BookOpen, ChevronRight, Archive, Trophy, Zap, PenLine, Calendar } from 'lucide-react';
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
            !report.is_read && 'ring-1 ring-primary/20'
          )}
          onClick={handleExpand}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-primary/60 font-medium mb-1">
                  {reportTypeLabels[report.report_type] || report.report_type}
                </p>
                <h3 className="font-serif text-xl font-semibold leading-tight">{report.title}</h3>
              </div>
              <ChevronRight className={cn(
                'w-5 h-5 text-muted-foreground transition-transform shrink-0 mt-1',
                expanded && 'rotate-90'
              )} />
            </div>

            {/* Period */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(report.period_start), 'MMM d')} — {format(new Date(report.period_end), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Narrative */}
            <p className={cn(
              'text-sm text-muted-foreground leading-relaxed',
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
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="text-center p-3 rounded-lg bg-secondary/50 border border-border/20">
                        <div className="text-lg font-bold text-primary">{value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Major Wins */}
                {report.major_wins.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-primary/70 font-semibold flex items-center gap-1.5 mb-2">
                      <Trophy className="w-3.5 h-3.5" /> Major Wins
                    </h4>
                    <ul className="space-y-1.5">
                      {report.major_wins.map((win, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lessons */}
                {report.lessons.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3.5 h-3.5" /> Key Lessons
                    </h4>
                    <ul className="space-y-1.5">
                      {report.lessons.map((lesson, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                          <span className="text-muted-foreground mt-0.5">—</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Turning Points */}
                {report.turning_points.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-2">
                      <Zap className="w-3.5 h-3.5" /> Turning Points
                    </h4>
                    <ul className="space-y-1.5">
                      {report.turning_points.map((tp, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                          <span className="text-warning mt-0.5">⚡</span>
                          {tp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/20">
                  <Button variant="ghost" size="sm" onClick={() => onFavorite(report.id, report.is_favorite)}>
                    <Heart className={cn('w-4 h-4 mr-1', report.is_favorite && 'fill-primary text-primary')} />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowShare(true)}>
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  {onArchive && (
                    <Button variant="ghost" size="sm" onClick={() => onArchive(report.id)} className="ml-auto">
                      <Archive className="w-4 h-4" />
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
