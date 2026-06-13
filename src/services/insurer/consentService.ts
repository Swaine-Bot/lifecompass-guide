/**
 * Consent Service — POPIA/GDPR append-only consent ledger.
 * Every grant or revoke creates a new immutable row in `consent_records`.
 */
import { supabase } from '@/integrations/supabase/client';

export type ConsentPurpose =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'marketing'
  | 'analytics'
  | 'research'
  | 'insurer_share_wellness'
  | 'insurer_share_activity'
  | 'insurer_share_nutrition'
  | 'insurer_share_sleep'
  | 'insurer_share_rewards'
  | 'insurer_share_wearable'
  | 'insurer_share_insights'
  | 'insurer_personalized_rewards'
  | 'insurer_ai_recs'
  | 'insurer_anon_analytics'
  | 'insurer_research'
  | 'insurer_sponsor_recs'
  | 'insurer_connection_discovery'
  | 'insurer_connection_momentum'
  | 'insurer_connection_profmed'
  | 'insurer_connection_bonitas'
  | 'insurer_connection_other';

const CONSENT_VERSION = '1.0';

async function hashString(input: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  } catch {
    return '';
  }
}

export async function recordConsent(
  userId: string,
  purpose: ConsentPurpose,
  granted: boolean,
  metadata: Record<string, unknown> = {}
): Promise<{ error: Error | null }> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const ua_hash = await hashString(ua);

  const { error } = await supabase.from('consent_records' as never).insert({
    user_id: userId,
    purpose,
    granted,
    version: CONSENT_VERSION,
    ua_hash,
    metadata,
    revoked_at: granted ? null : new Date().toISOString(),
  } as never);

  return { error: (error as Error) ?? null };
}

/** Returns the most recent grant/revoke state for each purpose. */
export async function getActiveConsents(userId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('consent_records' as never)
    .select('purpose, granted, granted_at')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false });

  if (error || !data) return {};

  const latest: Record<string, boolean> = {};
  for (const row of data as Array<{ purpose: string; granted: boolean }>) {
    if (!(row.purpose in latest)) latest[row.purpose] = row.granted;
  }
  return latest;
}
