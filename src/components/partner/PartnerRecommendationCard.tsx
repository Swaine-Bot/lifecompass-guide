import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logPlacementEvent, hidePartnerForUser, type PartnerPlacement } from '@/services/partnerPlacementService';
import { toast } from 'sonner';

interface Props {
  placements: PartnerPlacement[];
  layout?: 'single' | 'carousel' | 'comparison';
  playbookId?: string | null;
  taskId?: string | null;
}

export function PartnerRecommendationCard({ placements, layout = 'single', playbookId, taskId }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);

  const visible = placements.filter((p) => !dismissed.has(p.partner_id));
  if (!visible.length) return null;

  const handleClick = (p: PartnerPlacement) => {
    logPlacementEvent({
      partner_id: p.partner_id,
      event_type: 'click',
      task_id: taskId,
      playbook_id: playbookId,
      partner_category: p.matched_category,
    });
    const url = p.deep_link || p.default_cta_url || p.website_url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = async (p: PartnerPlacement) => {
    setDismissed((prev) => new Set(prev).add(p.partner_id));
    await Promise.all([
      logPlacementEvent({
        partner_id: p.partner_id,
        event_type: 'dismiss',
        task_id: taskId,
        playbook_id: playbookId,
        partner_category: p.matched_category,
      }),
      hidePartnerForUser(p.partner_id),
    ]);
    toast('We\u2019ll show fewer like this.', { duration: 2200 });
  };

  const renderCard = (p: PartnerPlacement, opts?: { compact?: boolean }) => {
    const ctaLabel = p.cta_text || p.default_cta_label || 'Learn more';
    const initials = p.name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <Card
        key={p.partner_id}
        variant="glass"
        className={cn(
          'relative overflow-hidden group border-white/[0.06]',
          opts?.compact ? 'min-w-[260px]' : 'w-full',
        )}
        style={
          p.brand_color
            ? {
                boxShadow: `0 0 0 1px ${p.brand_color}18, 0 22px 60px -30px ${p.brand_color}55`,
              }
            : undefined
        }
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-white/[0.05] border border-white/[0.08]"
              style={p.brand_color ? { backgroundColor: `${p.brand_color}22` } : undefined}
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={`${p.name} logo`}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs font-semibold text-foreground/80">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70 font-medium">
                  Recommended partner
                </p>
                <BadgeCheck className="w-3 h-3 text-primary/70" aria-label="Verified" />
              </div>
              <h4 className="text-sm font-semibold mt-0.5 leading-snug">{p.name}</h4>
              <p className="text-[11px] text-primary/60 mt-0.5 font-medium">{p.headline}</p>
            </div>
            <button
              onClick={() => handleDismiss(p)}
              aria-label="Hide"
              className="w-7 h-7 -mr-1 -mt-1 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] shrink-0 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-foreground/75 mt-3 leading-relaxed">{p.explanation}</p>

          <div className="flex items-center justify-between gap-3 mt-4">
            <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-medium">
              {p.disclosure_label}
            </Badge>
            <Button
              variant="gold-outline"
              size="sm"
              className="rounded-full text-[11px] h-8 gap-1.5"
              onClick={() => handleClick(p)}
            >
              {ctaLabel}
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (layout === 'carousel' && visible.length > 1) {
    const p = visible[index % visible.length];
    return (
      <div className="space-y-2">
        {renderCard(p)}
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIndex((i) => (i - 1 + visible.length) % visible.length)}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-[10px] text-muted-foreground/70 tabular-nums">
            {(index % visible.length) + 1} / {visible.length}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIndex((i) => (i + 1) % visible.length)}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (layout === 'comparison' && visible.length > 1) {
    return (
      <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-2 snap-x snap-mandatory">
        {visible.map((p) => (
          <div key={p.partner_id} className="snap-start">
            {renderCard(p, { compact: true })}
          </div>
        ))}
      </div>
    );
  }

  return <>{visible.slice(0, 1).map((p) => renderCard(p))}</>;
}
