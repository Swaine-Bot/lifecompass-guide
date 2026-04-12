import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────

export interface PartnerShareEvent {
  id: string;
  user_id: string;
  partner_id: string;
  partner_asset_id: string | null;
  campaign_name: string | null;
  platform: string | null;
  share_card_type: string | null;
  source_type: string | null;
  tracking_token: string;
  destination_url: string | null;
  created_at: string;
}

export interface PartnerAnalyticsSummary {
  totalShareUses: number;
  uniqueUsers: number;
  totalClicks: number;
  ctr: number; // clicks / share uses
  platformBreakdown: { platform: string; count: number }[];
  assetBreakdown: { assetId: string; title: string; uses: number; clicks: number }[];
  campaignBreakdown: { campaign: string; uses: number; clicks: number }[];
  dailyTrend: { date: string; uses: number; clicks: number }[];
}

// ─── Generate Tracking Token ──────────────────────────────────────────

function generateTrackingToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ─── Build Tracked CTA URL ───────────────────────────────────────────

export function buildTrackedCtaUrl(params: {
  destinationUrl: string;
  trackingToken: string;
  partnerSlug: string;
  campaignName?: string;
  platform?: string;
}): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  // Use the edge function as the redirect endpoint
  const redirectBase = `https://${projectId}.supabase.co/functions/v1/partner-click`;
  return `${redirectBase}?t=${params.trackingToken}`;
}

// ─── Record Partner Share Event ──────────────────────────────────────

export async function recordPartnerShareEvent(params: {
  userId: string;
  partnerId: string;
  partnerAssetId?: string;
  campaignName?: string;
  platform: string;
  shareCardType?: string;
  sourceType?: string;
  destinationUrl?: string;
}): Promise<{ trackingToken: string; trackedUrl: string | null } | null> {
  const trackingToken = generateTrackingToken();

  const { error } = await supabase
    .from('partner_share_events' as any)
    .insert({
      user_id: params.userId,
      partner_id: params.partnerId,
      partner_asset_id: params.partnerAssetId || null,
      campaign_name: params.campaignName || null,
      platform: params.platform,
      share_card_type: params.shareCardType || null,
      source_type: params.sourceType || null,
      tracking_token: trackingToken,
      destination_url: params.destinationUrl || null,
    });

  if (error) {
    console.error('[PartnerAnalytics] Failed to record share event:', error.message);
    return null;
  }

  const trackedUrl = params.destinationUrl
    ? buildTrackedCtaUrl({
        destinationUrl: params.destinationUrl,
        trackingToken,
        partnerSlug: '',
        campaignName: params.campaignName,
        platform: params.platform,
      })
    : null;

  return { trackingToken, trackedUrl };
}

// ─── Fetch Partner Analytics (Admin only) ────────────────────────────

export async function fetchPartnerAnalytics(partnerId: string): Promise<PartnerAnalyticsSummary> {
  // Fetch share events
  const { data: shareEvents } = await supabase
    .from('partner_share_events' as any)
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  // Fetch click events
  const { data: clickEvents } = await supabase
    .from('partner_click_events' as any)
    .select('*')
    .eq('partner_id', partnerId)
    .order('clicked_at', { ascending: false });

  const events = (shareEvents || []) as any[];
  const clicks = (clickEvents || []) as any[];

  const totalShareUses = events.length;
  const uniqueUsers = new Set(events.map((e: any) => e.user_id)).size;
  const totalClicks = clicks.length;
  const ctr = totalShareUses > 0 ? totalClicks / totalShareUses : 0;

  // Platform breakdown
  const platformMap = new Map<string, number>();
  events.forEach((e: any) => {
    const p = e.platform || 'unknown';
    platformMap.set(p, (platformMap.get(p) || 0) + 1);
  });
  const platformBreakdown = Array.from(platformMap.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  // Asset breakdown
  const assetUseMap = new Map<string, number>();
  const assetClickMap = new Map<string, number>();
  events.forEach((e: any) => {
    const aid = e.partner_asset_id || 'none';
    assetUseMap.set(aid, (assetUseMap.get(aid) || 0) + 1);
  });
  clicks.forEach((c: any) => {
    const aid = c.partner_asset_id || 'none';
    assetClickMap.set(aid, (assetClickMap.get(aid) || 0) + 1);
  });
  const assetBreakdown = Array.from(assetUseMap.entries()).map(([assetId, uses]) => ({
    assetId,
    title: assetId === 'none' ? 'No asset' : assetId.slice(0, 8),
    uses,
    clicks: assetClickMap.get(assetId) || 0,
  }));

  // Campaign breakdown
  const campUseMap = new Map<string, number>();
  const campClickMap = new Map<string, number>();
  events.forEach((e: any) => {
    const c = e.campaign_name || 'Uncategorized';
    campUseMap.set(c, (campUseMap.get(c) || 0) + 1);
  });
  clicks.forEach((c: any) => {
    const camp = c.campaign_name || 'Uncategorized';
    campClickMap.set(camp, (campClickMap.get(camp) || 0) + 1);
  });
  const campaignBreakdown = Array.from(campUseMap.entries()).map(([campaign, uses]) => ({
    campaign,
    uses,
    clicks: campClickMap.get(campaign) || 0,
  }));

  // Daily trend (last 30 days)
  const dailyMap = new Map<string, { uses: number; clicks: number }>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { uses: 0, clicks: 0 });
  }
  events.forEach((e: any) => {
    const key = (e.created_at || '').slice(0, 10);
    if (dailyMap.has(key)) dailyMap.get(key)!.uses++;
  });
  clicks.forEach((c: any) => {
    const key = (c.clicked_at || '').slice(0, 10);
    if (dailyMap.has(key)) dailyMap.get(key)!.clicks++;
  });
  const dailyTrend = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    uses: v.uses,
    clicks: v.clicks,
  }));

  return {
    totalShareUses,
    uniqueUsers,
    totalClicks,
    ctr,
    platformBreakdown,
    assetBreakdown,
    campaignBreakdown,
    dailyTrend,
  };
}

// ─── Fetch Aggregate Analytics (all partners) ────────────────────────

export async function fetchAggregatePartnerAnalytics(): Promise<{
  totalShares: number;
  totalClicks: number;
  totalPartners: number;
  topPlatforms: { platform: string; count: number }[];
  topCampaigns: { campaign: string; uses: number; clicks: number }[];
}> {
  const { data: shareEvents } = await supabase
    .from('partner_share_events' as any)
    .select('*')
    .order('created_at', { ascending: false });

  const { data: clickEvents } = await supabase
    .from('partner_click_events' as any)
    .select('*')
    .order('clicked_at', { ascending: false });

  const events = (shareEvents || []) as any[];
  const clicks = (clickEvents || []) as any[];

  const partnerIds = new Set(events.map((e: any) => e.partner_id));

  const platformMap = new Map<string, number>();
  events.forEach((e: any) => {
    const p = e.platform || 'unknown';
    platformMap.set(p, (platformMap.get(p) || 0) + 1);
  });

  const campUseMap = new Map<string, number>();
  const campClickMap = new Map<string, number>();
  events.forEach((e: any) => {
    const c = e.campaign_name || 'Uncategorized';
    campUseMap.set(c, (campUseMap.get(c) || 0) + 1);
  });
  clicks.forEach((c: any) => {
    const camp = c.campaign_name || 'Uncategorized';
    campClickMap.set(camp, (campClickMap.get(camp) || 0) + 1);
  });

  return {
    totalShares: events.length,
    totalClicks: clicks.length,
    totalPartners: partnerIds.size,
    topPlatforms: Array.from(platformMap.entries())
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topCampaigns: Array.from(campUseMap.entries())
      .map(([campaign, uses]) => ({ campaign, uses, clicks: campClickMap.get(campaign) || 0 }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 5),
  };
}
