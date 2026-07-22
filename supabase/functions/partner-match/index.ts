// Partner Placement Engine — matching + AI relevance explanation
// Scores active partners against a step's partner_categories & playbook tags,
// applies country/date/tier/priority/personalisation, and caches AI explanation.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface StepInput {
  task_id?: string | null;
  step_index?: number | null;
  step_title: string;
  step_description?: string | null;
  partner_categories: string[];
  category_tags?: string[];
}

interface MatchRequest {
  playbook_id?: string | null;
  playbook_title: string;
  playbook_tags?: string[];
  country?: string | null;
  language?: string | null;
  steps: StepInput[];
  layout?: 'single' | 'carousel' | 'comparison';
  max_per_step?: number;
}

interface RankedPartner {
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

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

async function generateExplanation(params: {
  partnerName: string;
  partnerDescription: string | null;
  partnerCategory: string;
  stepTitle: string;
  stepDescription: string | null;
  playbookTitle: string;
}): Promise<{ explanation: string; headline: string }> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    return {
      headline: `Recommended for ${params.stepTitle}`,
      explanation: `${params.partnerName} supports this step directly through their ${params.partnerCategory} offering.`,
    };
  }
  try {
    const res = await fetch(GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'google/gemini-3.6-flash',
        messages: [
          {
            role: 'system',
            content:
              'You write short, non-promotional relevance blurbs for partner recommendations inside a life-companion app. Never use marketing language, superlatives, or emojis. Return strict JSON: {"headline":"<max 40 chars>","explanation":"<1 sentence, max 180 chars, plain, warm, specific>"}. The explanation must state why this partner is relevant to the specific step, not describe the partner.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              playbook: params.playbookTitle,
              step: params.stepTitle,
              step_description: params.stepDescription,
              partner: params.partnerName,
              partner_offering: params.partnerDescription,
              category: params.partnerCategory,
            }),
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const j = await res.json();
    const raw = j?.choices?.[0]?.message?.content;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const headline = String(parsed?.headline || `Relevant to ${params.stepTitle}`).slice(0, 60);
    const explanation = String(parsed?.explanation || '').slice(0, 260) ||
      `${params.partnerName} directly supports "${params.stepTitle}" through their ${params.partnerCategory} offering.`;
    return { headline, explanation };
  } catch (_e) {
    return {
      headline: `Relevant to ${params.stepTitle}`,
      explanation: `${params.partnerName} directly supports "${params.stepTitle}" through their ${params.partnerCategory} offering.`,
    };
  }
}

function scorePartner(p: any, step: StepInput, ctx: MatchRequest, affiliations: string[]): {
  score: number;
  matched: string | null;
} {
  const partnerCats: string[] = Array.isArray(p.supported_categories) ? p.supported_categories : [];
  const partnerTags: string[] = Array.isArray(p.supported_playbook_tags) ? p.supported_playbook_tags : [];

  // require category overlap
  const matched = step.partner_categories.find((c) => partnerCats.includes(c));
  if (!matched) return { score: 0, matched: null };

  let score = 1000; // baseline for eligibility

  // playbook tag overlap
  if (ctx.playbook_tags?.length) {
    const overlap = ctx.playbook_tags.filter((t) => partnerTags.includes(t)).length;
    score += overlap * 120;
  }

  // priority weight (0-100)
  score += (p.priority_weight ?? 50) * 6;

  // tier boost
  const tierBoost: Record<string, number> = { strategic: 400, preferred: 220, standard: 80, trial: 20 };
  score += tierBoost[p.partner_tier || 'standard'] ?? 80;

  // affiliation match — massive boost
  if (affiliations.some((a) => (p.slug || '').toLowerCase().includes(a) || (p.name || '').toLowerCase().includes(a))) {
    score += 1500;
  }

  // country match
  if (ctx.country && p.country && p.country.toLowerCase() === ctx.country.toLowerCase()) {
    score += 150;
  }

  // small randomisation to break ties
  score += Math.floor(Math.random() * 40);
  return { score, matched };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await supabaseUser.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claims.claims.sub;

    const body = (await req.json()) as MatchRequest;
    if (!body?.steps || !Array.isArray(body.steps) || !body.playbook_title) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── user context: affiliations + hidden partners ──
    const { data: prefsRow } = await admin
      .from('user_partner_preferences')
      .select('affiliations, hidden_partner_ids, hidden_categories')
      .eq('user_id', userId)
      .maybeSingle();
    const affiliations: string[] = ((prefsRow?.affiliations as string[]) || []).map((a) =>
      String(a).toLowerCase(),
    );
    const hiddenPartners = new Set<string>((prefsRow?.hidden_partner_ids as string[]) || []);
    const hiddenCategories = new Set<string>(
      ((prefsRow?.hidden_categories as string[]) || []).map((c) => c.toLowerCase()),
    );

    // ── load active, available partners inside campaign window ──
    const today = new Date().toISOString().slice(0, 10);
    const { data: partners, error: pErr } = await admin
      .from('partners')
      .select(
        'id,name,slug,logo_url,brand_color,brand_description,cta_text,default_cta_label,default_cta_url,deep_link,website_url,disclosure_label,partner_tier,priority_weight,supported_categories,supported_playbook_tags,country,campaign_start_date,campaign_end_date,availability,status',
      )
      .eq('status', 'active')
      .eq('availability', true);
    if (pErr) throw pErr;

    const eligible = (partners || []).filter((p: any) => {
      if (hiddenPartners.has(p.id)) return false;
      if (p.campaign_start_date && p.campaign_start_date > today) return false;
      if (p.campaign_end_date && p.campaign_end_date < today) return false;
      return true;
    });

    const layout = body.layout || 'single';
    const maxPerStep = Math.min(Math.max(body.max_per_step || (layout === 'single' ? 1 : 4), 1), 6);
    const usedPartnerIds = new Set<string>();

    const results: { step_index: number; task_id: string | null; matched_category: string | null; partners: RankedPartner[] }[] = [];

    for (let i = 0; i < body.steps.length; i++) {
      const step = body.steps[i];
      const cats = (step.partner_categories || []).filter(
        (c) => c && !hiddenCategories.has(c.toLowerCase()),
      );
      if (!cats.length) {
        results.push({ step_index: i, task_id: step.task_id || null, matched_category: null, partners: [] });
        continue;
      }
      const filteredStep = { ...step, partner_categories: cats };

      // score
      const scored = eligible
        .map((p: any) => {
          const { score, matched } = scorePartner(p, filteredStep, body, affiliations);
          return { p, score, matched };
        })
        .filter((s) => s.matched && s.score > 0);

      // variety: prefer partners not yet used in this playbook
      scored.sort((a, b) => {
        const aUsed = usedPartnerIds.has(a.p.id) ? 1 : 0;
        const bUsed = usedPartnerIds.has(b.p.id) ? 1 : 0;
        if (aUsed !== bUsed) return aUsed - bUsed;
        return b.score - a.score;
      });

      const top = scored.slice(0, maxPerStep);
      const partnersOut: RankedPartner[] = [];

      for (const s of top) {
        usedPartnerIds.add(s.p.id);
        // cache lookup
        const cacheKey = {
          partner_id: s.p.id,
          partner_category: s.matched!,
          step_category: (filteredStep.category_tags?.[0] || filteredStep.step_title).slice(0, 120),
          playbook_tag: (body.playbook_tags?.[0] || null) as string | null,
        };
        let explanation = '';
        let headline = '';
        const { data: cached } = await admin
          .from('partner_placement_cache')
          .select('explanation, headline, expires_at')
          .eq('partner_id', cacheKey.partner_id)
          .eq('partner_category', cacheKey.partner_category)
          .eq('step_category', cacheKey.step_category)
          .maybeSingle();

        if (cached && new Date(cached.expires_at) > new Date()) {
          explanation = cached.explanation;
          headline = cached.headline || `Relevant to ${filteredStep.step_title}`;
        } else {
          const gen = await generateExplanation({
            partnerName: s.p.name,
            partnerDescription: s.p.brand_description,
            partnerCategory: s.matched!,
            stepTitle: filteredStep.step_title,
            stepDescription: filteredStep.step_description || null,
            playbookTitle: body.playbook_title,
          });
          explanation = gen.explanation;
          headline = gen.headline;
          await admin
            .from('partner_placement_cache')
            .upsert(
              {
                partner_id: cacheKey.partner_id,
                partner_category: cacheKey.partner_category,
                step_category: cacheKey.step_category,
                playbook_tag: cacheKey.playbook_tag,
                explanation,
                headline,
                generated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
              },
              { onConflict: 'partner_id,partner_category,step_category,playbook_tag' },
            );
        }

        partnersOut.push({
          partner_id: s.p.id,
          name: s.p.name,
          slug: s.p.slug,
          logo_url: s.p.logo_url,
          brand_color: s.p.brand_color,
          brand_description: s.p.brand_description,
          cta_text: s.p.cta_text,
          default_cta_label: s.p.default_cta_label,
          default_cta_url: s.p.default_cta_url,
          deep_link: s.p.deep_link,
          website_url: s.p.website_url,
          disclosure_label: s.p.disclosure_label || 'Sponsored',
          partner_tier: s.p.partner_tier || 'standard',
          priority_weight: s.p.priority_weight ?? 50,
          score: s.score,
          matched_category: s.matched!,
          campaign_id: null,
          explanation,
          headline,
        });
      }

      // fire impressions (fire-and-forget)
      if (partnersOut.length) {
        await admin.from('partner_placement_events').insert(
          partnersOut.map((p) => ({
            user_id: userId,
            partner_id: p.partner_id,
            playbook_id: body.playbook_id || null,
            task_id: step.task_id || null,
            event_type: 'impression',
            step_category: filteredStep.category_tags?.[0] || null,
            partner_category: p.matched_category,
            surface: 'playbook_step',
            metadata: { step_index: i, layout },
          })),
        );
      }

      results.push({
        step_index: i,
        task_id: step.task_id || null,
        matched_category: partnersOut[0]?.matched_category || null,
        partners: partnersOut,
      });
    }

    return new Response(JSON.stringify({ layout, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[partner-match] error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
