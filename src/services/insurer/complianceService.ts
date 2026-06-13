/**
 * Compliance Service — POPIA/GDPR data export and right-to-erasure workflows.
 */
import { supabase } from '@/integrations/supabase/client';

export async function requestDataExport(userId: string): Promise<{ error: Error | null; id?: string }> {
  const { data, error } = await supabase
    .from('data_export_requests' as never)
    .insert({ user_id: userId } as never)
    .select('id')
    .single();
  if (error) return { error: error as Error };

  // Fire the edge function (fire-and-forget; user polls status)
  supabase.functions.invoke('compliance-export', { body: { request_id: (data as { id: string }).id } }).catch(() => {});
  await supabase.rpc('log_audit_event' as never, {
    _event_type: 'compliance.export.request',
    _resource_type: 'data_export_requests',
    _resource_id: (data as { id: string }).id,
    _details: {},
  } as never);

  return { error: null, id: (data as { id: string }).id };
}

export async function requestErasure(userId: string, reason: string): Promise<{ error: Error | null; id?: string }> {
  const { data, error } = await supabase
    .from('data_erasure_requests' as never)
    .insert({ user_id: userId, reason } as never)
    .select('id, scheduled_for')
    .single();
  if (error) return { error: error as Error };

  await supabase.rpc('log_audit_event' as never, {
    _event_type: 'compliance.erasure.request',
    _resource_type: 'data_erasure_requests',
    _resource_id: (data as { id: string }).id,
    _details: { reason },
  } as never);

  return { error: null, id: (data as { id: string }).id };
}

export async function cancelErasure(userId: string, requestId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('data_erasure_requests' as never)
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() } as never)
    .eq('id', requestId)
    .eq('user_id', userId)
    .eq('status', 'pending');
  if (!error) {
    await supabase.rpc('log_audit_event' as never, {
      _event_type: 'compliance.erasure.cancel',
      _resource_type: 'data_erasure_requests',
      _resource_id: requestId,
      _details: {},
    } as never);
  }
  return { error: (error as Error) ?? null };
}

export async function listExportRequests(userId: string) {
  const { data } = await supabase
    .from('data_export_requests' as never)
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
    .limit(10);
  return (data ?? []) as Array<{
    id: string;
    status: string;
    download_url: string | null;
    expires_at: string | null;
    requested_at: string;
    completed_at: string | null;
  }>;
}

export async function listErasureRequests(userId: string) {
  const { data } = await supabase
    .from('data_erasure_requests' as never)
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
    .limit(10);
  return (data ?? []) as Array<{
    id: string;
    status: string;
    scheduled_for: string;
    requested_at: string;
    cancelled_at: string | null;
  }>;
}
