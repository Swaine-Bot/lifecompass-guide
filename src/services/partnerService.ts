import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  name: string;
  slug: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  industry: string | null;
  status: 'active' | 'inactive';
  brand_description: string | null;
  brand_color: string | null;
  logo_url: string | null;
  disclosure_label: string;
  default_cta_label: string | null;
  default_cta_url: string | null;
  billing_entity: string | null;
  country: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerAsset {
  id: string;
  partner_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  campaign_name: string | null;
  placement_type: string;
  asset_status: 'draft' | 'approved' | 'active' | 'archived';
  is_latest_active: boolean;
  approval_status: string;
  disclosure_override: string | null;
  cta_label_override: string | null;
  cta_url_override: string | null;
  target_surfaces: string[] | null;
  version_number: number;
  uploaded_by: string | null;
  notes: string | null;
  archived_at: string | null;
  replaced_by_asset_id: string | null;
  replaced_campaign_name: string | null;
  created_at: string;
  updated_at: string;
}

export type PartnerCreateInput = {
  name: string;
  slug: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  industry?: string;
  status?: 'active' | 'inactive';
  brand_description?: string;
  brand_color?: string;
  logo_url?: string;
  disclosure_label?: string;
  default_cta_label?: string;
  default_cta_url?: string;
  billing_entity?: string;
  country?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  internal_notes?: string;
};

// ─── Partner CRUD ─────────────────────────────────────────────────────

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Partner[];
}

export async function fetchActivePartners(): Promise<Partner[]> {
  const { data, error } = await supabase.rpc('get_active_partners');
  if (error) throw error;
  return (data || []) as unknown as Partner[];
}

export async function fetchPartnerById(id: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Partner | null;
}

export async function createPartner(input: PartnerCreateInput): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .insert(input as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Partner;
}

export async function updatePartner(id: string, updates: Partial<PartnerCreateInput>): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Partner;
}

// ─── Partner Assets ───────────────────────────────────────────────────

export async function fetchPartnerAssets(partnerId: string): Promise<PartnerAsset[]> {
  const { data, error } = await supabase
    .from('partner_assets')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as PartnerAsset[];
}

export async function fetchActiveAssetForPartner(
  partnerId: string,
  placement: string = 'share_card'
): Promise<PartnerAsset | null> {
  const { data, error } = await supabase.rpc('get_active_partner_asset', {
    _partner_id: partnerId,
    _placement: placement,
  });
  if (error) throw error;
  const rows = data as unknown as PartnerAsset[];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function uploadPartnerAsset(
  partnerId: string,
  partnerSlug: string,
  file: File,
  meta: {
    title: string;
    campaign_name?: string;
    placement_type?: string;
    disclosure_override?: string;
    cta_label_override?: string;
    cta_url_override?: string;
    notes?: string;
    activate_now?: boolean;
  }
): Promise<PartnerAsset> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${partnerSlug}/assets/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('partner-media')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('partner-media').getPublicUrl(path);
  const fileUrl = urlData.publicUrl;

  const { data: user } = await supabase.auth.getUser();

  const insertPayload: Record<string, any> = {
    partner_id: partnerId,
    title: meta.title,
    file_url: fileUrl,
    file_type: file.type,
    campaign_name: meta.campaign_name || null,
    placement_type: meta.placement_type || 'share_card',
    asset_status: meta.activate_now ? 'active' : 'draft',
    is_latest_active: false,
    approval_status: meta.activate_now ? 'approved' : 'pending',
    disclosure_override: meta.disclosure_override || null,
    cta_label_override: meta.cta_label_override || null,
    cta_url_override: meta.cta_url_override || null,
    uploaded_by: user?.user?.id || null,
    notes: meta.notes || null,
  };

  const { data, error } = await supabase
    .from('partner_assets')
    .insert(insertPayload as any)
    .select()
    .single();
  if (error) throw error;

  const asset = data as unknown as PartnerAsset;

  // If activate now, call the activation function
  if (meta.activate_now) {
    await activatePartnerAsset(asset.id);
    // Re-fetch to get updated state
    const { data: refreshed } = await supabase
      .from('partner_assets')
      .select('*')
      .eq('id', asset.id)
      .single();
    return (refreshed as unknown as PartnerAsset) || asset;
  }

  return asset;
}

export async function activatePartnerAsset(assetId: string): Promise<void> {
  const { error } = await supabase.rpc('activate_partner_asset', { _asset_id: assetId });
  if (error) throw error;
}
