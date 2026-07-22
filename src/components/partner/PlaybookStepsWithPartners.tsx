import { useMemo } from 'react';
import { usePartnerPlacements } from '@/hooks/usePartnerPlacements';
import { PartnerRecommendationCard } from './PartnerRecommendationCard';
import type { MatchStepInput } from '@/services/partnerPlacementService';

interface Step {
  title: string;
  description?: string;
  partner_categories?: string[];
  category_tags?: string[];
}

interface Props {
  playbookId?: string | null;
  playbookTitle: string;
  playbookTags?: string[];
  steps: Step[];
  country?: string | null;
  layout?: 'single' | 'carousel' | 'comparison';
  /** render function returning the step body; partner card is injected after the step */
  renderStep: (step: Step, index: number) => React.ReactNode;
}

/** Wraps a rendered step list and injects partner recommendation cards under steps
 *  whose `partner_categories` overlap with an active partner's `supported_categories`. */
export function PlaybookStepsWithPartners({
  playbookId,
  playbookTitle,
  playbookTags,
  steps,
  country,
  layout = 'single',
  renderStep,
}: Props) {
  const matchSteps: MatchStepInput[] = useMemo(
    () =>
      steps.map((s, i) => ({
        step_index: i,
        step_title: s.title,
        step_description: s.description,
        partner_categories: s.partner_categories || [],
        category_tags: s.category_tags || [],
      })),
    [steps],
  );

  const { data } = usePartnerPlacements({
    playbook_id: playbookId,
    playbook_title: playbookTitle,
    playbook_tags: playbookTags,
    country,
    steps: matchSteps,
    layout,
  });

  const byIndex = new Map<number, typeof data extends null ? never : NonNullable<typeof data>['results'][number]>();
  data?.results.forEach((r) => byIndex.set(r.step_index, r));

  return (
    <>
      {steps.map((step, i) => {
        const placement = byIndex.get(i);
        return (
          <div key={i} className="space-y-2">
            {renderStep(step, i)}
            {placement && placement.partners.length > 0 && (
              <div className="pl-6 sm:pl-8 animate-fade-in">
                <PartnerRecommendationCard
                  placements={placement.partners}
                  layout={data?.layout || 'single'}
                  playbookId={playbookId}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
