import { supabase } from '@/integrations/supabase/client';

export interface PartnerPlacement {
  partner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  brand_description: string | null;
  cta_text: string | null;
  default_cta_label: string | null;
  default_cta_url: string | null;
  deep_link: string | null;
  website_url: string | null;
  disclosure_label: string;
  partner_tier: string;
  priority_weight: number;
  score: number;
  matched_category: string;
  campaign_id: string | null;
  explanation: string;
  headline: string;
}

export interface PlacementStepResult {
  step_index: number;
  task_id: string | null;
  matched_category: string | null;
  partners: PartnerPlacement[];
}

export interface PlacementResponse {
  layout: 'single' | 'carousel' | 'comparison';
  results: PlacementStepResult[];
}

export interface MatchStepInput {
  task_id?: string | null;
  step_index?: number | null;
  step_title: string;
  step_description?: string | null;
  partner_categories: string[];
  category_tags?: string[];
}

export async function matchPartnersForPlaybook(params: {
  playbook_id?: string | null;
  playbook_title: string;
  playbook_tags?: string[];
  country?: string | null;
  language?: string | null;
  steps: MatchStepInput[];
  layout?: 'single' | 'carousel' | 'comparison';
  max_per_step?: number;
}): Promise<PlacementResponse | null> {
  const activeSteps = params.steps.filter((s) => (s.partner_categories || []).length > 0);
  if (!activeSteps.length) return { layout: params.layout || 'single', results: [] };

  const { data, error } = await supabase.functions.invoke('partner-match', { body: params });
  if (error) {
    console.warn('[partner-match] invoke failed', error);
    return null;
  }
  return data as PlacementResponse;
}

export async function logPlacementEvent(params: {
  partner_id: string;
  event_type: 'view' | 'click' | 'save' | 'share' | 'dismiss' | 'feedback' | 'conversion';
  task_id?: string | null;
  playbook_id?: string | null;
  partner_category?: string | null;
  step_category?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('partner_placement_events' as any).insert({
      user_id: user.id,
      partner_id: params.partner_id,
      event_type: params.event_type,
      task_id: params.task_id ?? null,
      playbook_id: params.playbook_id ?? null,
      partner_category: params.partner_category ?? null,
      step_category: params.step_category ?? null,
      surface: 'playbook_step',
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    console.warn('[placement-event] failed', e);
  }
}

export async function hidePartnerForUser(partnerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from('user_partner_preferences' as any)
    .select('hidden_partner_ids')
    .eq('user_id', user.id)
    .maybeSingle();
  const current: string[] = ((existing as any)?.hidden_partner_ids as string[]) || [];
  if (current.includes(partnerId)) return;
  const next = [...current, partnerId];
  await supabase.from('user_partner_preferences' as any).upsert(
    { user_id: user.id, hidden_partner_ids: next },
    { onConflict: 'user_id' },
  );
}
