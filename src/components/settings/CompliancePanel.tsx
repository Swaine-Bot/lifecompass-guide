import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Trash2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  requestDataExport,
  requestErasure,
  cancelErasure,
  listExportRequests,
  listErasureRequests,
} from '@/services/insurer/complianceService';

export function CompliancePanel() {
  const { user } = useAuth();
  const [exports, setExports] = useState<Awaited<ReturnType<typeof listExportRequests>>>([]);
  const [erasures, setErasures] = useState<Awaited<ReturnType<typeof listErasureRequests>>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) return;
    const [e, r] = await Promise.all([listExportRequests(user.id), listErasureRequests(user.id)]);
    setExports(e);
    setErasures(r);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  if (!user) return null;

  const handleExport = async () => {
    setBusy('export');
    const { error } = await requestDataExport(user.id);
    if (error) toast.error('Could not request export.');
    else { toast.success('Export requested. You will be notified when ready.'); await refresh(); }
    setBusy(null);
  };

  const handleErase = async () => {
    const reason = prompt('Tell us why (optional). Your account will be permanently deleted after a 30-day grace period — you can cancel anytime within that window.') ?? '';
    if (!confirm('Request deletion of your account and all associated data?')) return;
    setBusy('erase');
    const { error } = await requestErasure(user.id, reason);
    if (error) toast.error('Could not request deletion.');
    else { toast.success('Deletion requested. 30-day grace period active.'); await refresh(); }
    setBusy(null);
  };

  const handleCancelErasure = async (id: string) => {
    setBusy(id);
    const { error } = await cancelErasure(user.id, id);
    if (error) toast.error('Could not cancel.');
    else { toast.success('Deletion cancelled'); await refresh(); }
    setBusy(null);
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="settings-icon"><Scale /></span>
          <span className="min-w-0 break-words">Your Data Rights (POPIA & GDPR)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button variant="outline" disabled={busy === 'export'} onClick={handleExport} className="w-full justify-start">
            <FileDown className="w-4 h-4 mr-2" /> Export my data
          </Button>
          <p className="text-xs text-white/55">
            Receive a copy of your profile, journals, goals, habits, mentor history, share cards, and consent ledger.
          </p>
        </div>

        {exports.length > 0 && (
          <div className="space-y-2">
            {exports.map(e => (
              <div key={e.id} className="flex items-center justify-between gap-2 text-xs text-white/70 p-2 rounded-lg bg-white/[0.03] min-w-0">
                <span className="truncate min-w-0">{new Date(e.requested_at).toLocaleDateString()}</span>
                <Badge variant="outline" className="shrink-0">{e.status}</Badge>
                {e.download_url && (
                  <a href={e.download_url} className="text-primary underline shrink-0">Download</a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-white/10 space-y-2">
          <Button variant="destructive" disabled={busy === 'erase'} onClick={handleErase} className="w-full justify-start">
            <Trash2 className="w-4 h-4 mr-2" /> Delete my account
          </Button>
          <p className="text-xs text-white/55">
            30-day grace window. You can cancel within the window to restore your account.
          </p>
        </div>

        {erasures.length > 0 && (
          <div className="space-y-2">
            {erasures.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-xs text-white/70 p-2 rounded-lg bg-white/[0.03] min-w-0">
                <div className="min-w-0">
                  <p className="truncate">Requested {new Date(r.requested_at).toLocaleDateString()}</p>
                  {r.status === 'pending' && <p className="text-[10px] text-white/40">Scheduled {new Date(r.scheduled_for).toLocaleDateString()}</p>}
                </div>
                <Badge variant="outline" className="shrink-0">{r.status}</Badge>
                {r.status === 'pending' && (
                  <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => handleCancelErasure(r.id)}>Cancel</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
