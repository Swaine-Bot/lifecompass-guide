import { useEffect, useState } from 'react';
import { matchPartnersForPlaybook, type PlacementResponse, type MatchStepInput } from '@/services/partnerPlacementService';

export function usePartnerPlacements(params: {
  playbook_id?: string | null;
  playbook_title: string;
  playbook_tags?: string[];
  country?: string | null;
  steps: MatchStepInput[];
  layout?: 'single' | 'carousel' | 'comparison';
  enabled?: boolean;
}) {
  const [data, setData] = useState<PlacementResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const activeSteps = params.steps.filter((s) => (s.partner_categories || []).length > 0);
  const key = JSON.stringify({
    id: params.playbook_id,
    t: params.playbook_title,
    tags: params.playbook_tags,
    country: params.country,
    layout: params.layout,
    steps: activeSteps.map((s) => ({ i: s.step_index, c: s.partner_categories })),
  });

  useEffect(() => {
    if (params.enabled === false) return;
    if (!activeSteps.length) {
      setData({ layout: params.layout || 'single', results: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    matchPartnersForPlaybook({
      playbook_id: params.playbook_id,
      playbook_title: params.playbook_title,
      playbook_tags: params.playbook_tags,
      country: params.country,
      steps: params.steps,
      layout: params.layout,
    })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, params.enabled]);

  return { data, loading };
}
