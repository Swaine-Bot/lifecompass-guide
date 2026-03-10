import { supabase } from '@/integrations/supabase/client';

// ─── Constants ──────────────────────────────────────────────────────
const LIFESTACK_DOMAIN = 'https://lifecompass-guide.lovable.app';

const IOS_APP_STORE_URL = 'https://apps.apple.com/app/lifestack/id0000000000'; // Replace with real ID
const ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.lifestack'; // Replace with real ID

export { LIFESTACK_DOMAIN, IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL };

// ─── Source type → URL path prefix mapping ──────────────────────────
const SOURCE_PREFIX: Record<string, string> = {
  mentor_insight: 'insight',
  goal_created: 'goal',
  goal_progress: 'goal',
  micro_move_completed: 'achievement',
  journal_reflection: 'reflection',
  achievement: 'achievement',
  weekly_recap: 'recap',
  app_invite: 'invite',
};

// ─── Slug Generation ────────────────────────────────────────────────
function generateSlug(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// ─── Create Share Link ──────────────────────────────────────────────
export interface CreateShareLinkParams {
  userId: string;
  sourceType: string;
  sourceId?: string;
  shareCardId?: string;
  title?: string;
  subtitle?: string;
  cardType?: string;
  landingPageType?: string;
  visibilityMode?: string;
}

export interface ShareLinkResult {
  id: string;
  slug: string;
  smartUrl: string;
  error?: string;
}

export async function createShareLink(params: CreateShareLinkParams): Promise<ShareLinkResult> {
  const slug = generateSlug();
  const prefix = SOURCE_PREFIX[params.sourceType] || 's';

  const { data, error } = await supabase
    .from('share_links' as any)
    .insert({
      user_id: params.userId,
      source_type: params.sourceType,
      source_id: params.sourceId || null,
      share_card_id: params.shareCardId || null,
      slug,
      title: params.title || null,
      subtitle: params.subtitle || null,
      card_type: params.cardType || null,
      landing_page_type: params.landingPageType || 'generic',
      visibility_mode: params.visibilityMode || 'public',
    })
    .select('id, slug')
    .single();

  if (error || !data) {
    return { id: '', slug: '', smartUrl: `${LIFESTACK_DOMAIN}`, error: error?.message || 'Failed to create link' };
  }

  const smartUrl = `${LIFESTACK_DOMAIN}/s/${(data as any).slug}`;
  return { id: (data as any).id, slug: (data as any).slug, smartUrl };
}

// ─── Resolve Share Link ─────────────────────────────────────────────
export interface ResolvedShareLink {
  id: string;
  sourceType: string;
  sourceId?: string;
  title?: string;
  subtitle?: string;
  cardType?: string;
  landingPageType: string;
  visibilityMode: string;
}

export async function resolveShareLink(slug: string): Promise<ResolvedShareLink | null> {
  const { data, error } = await supabase
    .from('share_links' as any)
    .select('id, source_type, source_id, title, subtitle, card_type, landing_page_type, visibility_mode, is_revoked, expires_at')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  const d = data as any;
  if (d.is_revoked) return null;
  if (d.expires_at && new Date(d.expires_at) < new Date()) return null;

  return {
    id: d.id,
    sourceType: d.source_type,
    sourceId: d.source_id,
    title: d.title,
    subtitle: d.subtitle,
    cardType: d.card_type,
    landingPageType: d.landing_page_type,
    visibilityMode: d.visibility_mode,
  };
}

// ─── Log Share Link Event ───────────────────────────────────────────
export async function logShareLinkEvent(
  shareLinkId: string,
  eventType: string,
  platformDetected?: string
) {
  await supabase.from('share_link_events' as any).insert({
    share_link_id: shareLinkId,
    event_type: eventType,
    platform_detected: platformDetected || null,
  });
}

// ─── Platform Detection ─────────────────────────────────────────────
export type DetectedPlatform = 'ios' | 'android' | 'desktop';

export function detectPlatform(): DetectedPlatform {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

// ─── Get Store URL ──────────────────────────────────────────────────
export function getStoreUrl(platform: DetectedPlatform): string {
  if (platform === 'ios') return IOS_APP_STORE_URL;
  if (platform === 'android') return ANDROID_PLAY_STORE_URL;
  return LIFESTACK_DOMAIN;
}

// ─── Build full share URL for a source type ─────────────────────────
export function buildSmartUrl(slug: string): string {
  return `${LIFESTACK_DOMAIN}/s/${slug}`;
}
