/**
 * Insurer Service — manages insurer_connections + insurer_sharing_prefs.
 * All write paths also record consent and write audit events.
 */
import { supabase } from '@/integrations/supabase/client';
import { recordConsent, type ConsentPurpose } from './consentService';

export type InsurerProvider =
  | 'discovery'
  | 'momentum'
  | 'profmed'
  | 'bonitas'
  | 'other'
  | 'none'
  | 'prefer_not_say';

export type ConnectionStatus = 'demo' | 'pending' | 'connected' | 'revoked' | 'error';

export interface InsurerConnection {
  id: string;
  user_id: string;
  provider: InsurerProvider;
  status: ConnectionStatus;
  scopes: string[];
  connected_at: string | null;
  revoked_at: string | null;
  last_sync_at: string | null;
}

export interface SharingPrefs {
  share_wellness: boolean;
  share_activity: boolean;
  share_nutrition: boolean;
  share_sleep: boolean;
  share_rewards: boolean;
  share_wearable: boolean;
  share_insights: boolean;
  allow_personalized_rewards: boolean;
  allow_ai_recommendations: boolean;
  allow_anonymized_analytics: boolean;
  allow_research: boolean;
  allow_sponsor_recommendations: boolean;
}

export const SHARING_PREF_KEYS = [
  'share_wellness',
  'share_activity',
  'share_nutrition',
  'share_sleep',
  'share_rewards',
  'share_wearable',
  'share_insights',
  'allow_personalized_rewards',
  'allow_ai_recommendations',
  'allow_anonymized_analytics',
  'allow_research',
  'allow_sponsor_recommendations',
] as const;

export type SharingPrefKey = (typeof SHARING_PREF_KEYS)[number];

const PREF_TO_CONSENT: Record<SharingPrefKey, ConsentPurpose> = {
  share_wellness: 'insurer_share_wellness',
  share_activity: 'insurer_share_activity',
  share_nutrition: 'insurer_share_nutrition',
  share_sleep: 'insurer_share_sleep',
  share_rewards: 'insurer_share_rewards',
  share_wearable: 'insurer_share_wearable',
  share_insights: 'insurer_share_insights',
  allow_personalized_rewards: 'insurer_personalized_rewards',
  allow_ai_recommendations: 'insurer_ai_recs',
  allow_anonymized_analytics: 'insurer_anon_analytics',
  allow_research: 'insurer_research',
  allow_sponsor_recommendations: 'insurer_sponsor_recs',
};

const PROVIDER_TO_CONSENT: Partial<Record<InsurerProvider, ConsentPurpose>> = {
  discovery: 'insurer_connection_discovery',
  momentum: 'insurer_connection_momentum',
  profmed: 'insurer_connection_profmed',
  bonitas: 'insurer_connection_bonitas',
  other: 'insurer_connection_other',
};

async function logAudit(eventType: string, details: Record<string, unknown> = {}, resourceType?: string, resourceId?: string) {
  await supabase.rpc('log_audit_event' as never, {
    _event_type: eventType,
    _resource_type: resourceType ?? null,
    _resource_id: resourceId ?? null,
    _details: details,
  } as never);
}

export async function listConnections(userId: string): Promise<InsurerConnection[]> {
  const { data, error } = await supabase
    .from('insurer_connections' as never)
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data as unknown as InsurerConnection[];
}

export async function connectInsurer(
  userId: string,
  provider: InsurerProvider,
  demoMode = true
): Promise<{ error: Error | null }> {
  const status: ConnectionStatus = demoMode ? 'demo' : 'pending';
  const { error } = await supabase.from('insurer_connections' as never).upsert(
    {
      user_id: userId,
      provider,
      status,
      connected_at: new Date().toISOString(),
      revoked_at: null,
    } as never,
    { onConflict: 'user_id,provider' } as never
  );

  if (!error) {
    const consentPurpose = PROVIDER_TO_CONSENT[provider];
    if (consentPurpose) await recordConsent(userId, consentPurpose, true, { demo_mode: demoMode });
    await logAudit('insurer.connect', { provider, status }, 'insurer_connection');
  }

  return { error: (error as Error) ?? null };
}

export async function revokeInsurer(userId: string, provider: InsurerProvider): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('insurer_connections' as never)
    .update({ status: 'revoked' as ConnectionStatus, revoked_at: new Date().toISOString() } as never)
    .eq('user_id', userId)
    .eq('provider', provider);

  if (!error) {
    const consentPurpose = PROVIDER_TO_CONSENT[provider];
    if (consentPurpose) await recordConsent(userId, consentPurpose, false);
    await logAudit('insurer.revoke', { provider }, 'insurer_connection');
  }

  return { error: (error as Error) ?? null };
}

export async function getSharingPrefs(userId: string): Promise<SharingPrefs | null> {
  const { data, error } = await supabase
    .from('insurer_sharing_prefs' as never)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as SharingPrefs;
}

export async function ensureSharingPrefs(userId: string): Promise<SharingPrefs> {
  const existing = await getSharingPrefs(userId);
  if (existing) return existing;
  const defaults = SHARING_PREF_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: false }),
    {} as SharingPrefs
  );
  await supabase.from('insurer_sharing_prefs' as never).insert({ user_id: userId, ...defaults } as never);
  return defaults;
}

export async function setSharingPref(
  userId: string,
  key: SharingPrefKey,
  value: boolean
): Promise<{ error: Error | null }> {
  await ensureSharingPrefs(userId);
  const { error } = await supabase
    .from('insurer_sharing_prefs' as never)
    .update({ [key]: value } as never)
    .eq('user_id', userId);

  if (!error) {
    await recordConsent(userId, PREF_TO_CONSENT[key], value);
    await logAudit('insurer.pref.change', { key, value }, 'insurer_sharing_prefs');
  }
  return { error: (error as Error) ?? null };
}

/** Emergency kill switch: revoke ALL insurer connections and flip ALL toggles off. */
export async function disableAllInsurerIntegrations(userId: string): Promise<{ error: Error | null }> {
  const offPrefs = SHARING_PREF_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {} as SharingPrefs);

  const { error: prefErr } = await supabase
    .from('insurer_sharing_prefs' as never)
    .upsert({ user_id: userId, ...offPrefs } as never, { onConflict: 'user_id' } as never);

  if (prefErr) return { error: prefErr as Error };

  const { error: connErr } = await supabase
    .from('insurer_connections' as never)
    .update({ status: 'revoked' as ConnectionStatus, revoked_at: new Date().toISOString() } as never)
    .eq('user_id', userId)
    .neq('status', 'revoked');

  if (connErr) return { error: connErr as Error };

  for (const k of SHARING_PREF_KEYS) await recordConsent(userId, PREF_TO_CONSENT[k], false);
  await logAudit('insurer.kill_switch', { scope: 'all' });

  return { error: null };
}
