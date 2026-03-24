import { useState, useEffect } from 'react';
import { ShieldAlert, Flag, Ban, CheckCircle, AlertTriangle, Eye, Gavel, Clock, UserX, MessageSquareWarning } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '../StatCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentReport {
  id: string;
  reporter_user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  notes: string | null;
  status: string;
  action_taken: string | null;
  created_at: string;
}

interface ModerationAction {
  id: string;
  admin_user_id: string;
  target_type: string;
  target_id: string;
  action_type: string;
  reason: string | null;
  notes: string | null;
  created_at: string;
}

const ACTION_OPTIONS = [
  { value: 'dismissed', label: 'No Action — Dismiss' },
  { value: 'warning', label: 'Warn User' },
  { value: 'content_hidden', label: 'Hide Content' },
  { value: 'content_removed', label: 'Remove Content' },
  { value: 'temporary_restriction', label: 'Temporary Restriction' },
  { value: 'suspension', label: 'Suspend Account' },
  { value: 'ban', label: 'Permanent Ban' },
];

export function TrustSafety() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<ContentReport | null>(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: reps }, { data: acts }] = await Promise.all([
      supabase.from('content_reports' as any).select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('moderation_actions' as any).select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    setReports((reps as any) || []);
    setActions((acts as any) || []);
    setLoading(false);
  };

  const handleResolve = async () => {
    if (!actionDialog || !selectedAction) return;

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    // Update report status
    await supabase.from('content_reports' as any).update({
      status: 'resolved',
      action_taken: selectedAction,
      reviewed_by_admin_id: session.session.user.id,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', actionDialog.id);

    // Log moderation action
    await supabase.from('moderation_actions' as any).insert({
      admin_user_id: session.session.user.id,
      target_type: actionDialog.target_type,
      target_id: actionDialog.target_id,
      action_type: selectedAction,
      reason: actionDialog.reason,
      notes: actionNotes.trim() || null,
    } as any);

    toast.success(`Report resolved: ${ACTION_OPTIONS.find(a => a.value === selectedAction)?.label}`);
    setActionDialog(null);
    setSelectedAction('');
    setActionNotes('');
    loadData();
  };

  // Compute violation history per target
  const violationHistory = actions.reduce<Record<string, ModerationAction[]>>((acc, a) => {
    if (a.action_type !== 'dismissed') {
      const key = a.target_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
    }
    return acc;
  }, {});

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const warningCount = actions.filter(a => a.action_type === 'warning').length;
  const banCount = actions.filter(a => ['suspension', 'ban'].includes(a.action_type)).length;

  const filteredReports = filter === 'all' ? reports
    : reports.filter(r => r.status === (filter === 'pending' ? 'pending' : 'resolved'));

  // Group reports by target for repeat signal
  const reportsByTarget = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.target_id] = (acc[r.target_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Trust & Safety"
        description="Content moderation, reports queue, violation history, and enforcement"
        icon={ShieldAlert}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Reports" value={pendingCount} icon={AlertTriangle} />
        <StatCard title="Resolved" value={resolvedCount} icon={Eye} />
        <StatCard title="Warnings Issued" value={warningCount} icon={MessageSquareWarning} />
        <StatCard title="Suspensions/Bans" value={banCount} icon={UserX} />
      </div>

      {/* Reports Queue */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flag className="h-4 w-4" />
              REPORTS QUEUE
            </CardTitle>
            <div className="flex gap-1">
              {(['pending', 'resolved', 'all'] as const).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7 capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 text-[hsl(var(--success))] mx-auto mb-3 opacity-60" />
              <p className="text-sm text-muted-foreground">
                {filter === 'pending' ? 'No pending reports' : 'No reports found'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">All clear — community is healthy</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/20">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{report.target_type}</Badge>
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {report.status}
                        </Badge>
                        {reportsByTarget[report.target_id] > 1 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {reportsByTarget[report.target_id]}× reported
                          </Badge>
                        )}
                        {report.action_taken && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {report.action_taken}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{report.reason}</p>
                      {report.notes && (
                        <p className="text-[10px] text-muted-foreground/70 truncate italic">"{report.notes}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => {
                          setActionDialog(report);
                          setSelectedAction('');
                          setActionNotes('');
                        }}>
                          <Gavel className="w-3 h-3 mr-1" />Review
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Moderation Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Gavel className="w-4 h-4" />
              Review Report
            </DialogTitle>
            <DialogDescription className="text-xs">
              Choose an enforcement action for this report.
            </DialogDescription>
          </DialogHeader>
          {actionDialog && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{actionDialog.target_type}</Badge>
                  {reportsByTarget[actionDialog.target_id] > 1 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {reportsByTarget[actionDialog.target_id]}× reported
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">{actionDialog.reason}</p>
                {actionDialog.notes && (
                  <p className="text-xs text-muted-foreground italic">"{actionDialog.notes}"</p>
                )}
              </div>

              {/* Prior violations for this target */}
              {violationHistory[actionDialog.target_id] && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-destructive mb-1">
                    ⚠ Prior violations: {violationHistory[actionDialog.target_id].length}
                  </p>
                  {violationHistory[actionDialog.target_id].slice(0, 3).map((v, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground">
                      {v.action_type} — {v.reason || 'No reason'} ({new Date(v.created_at).toLocaleDateString()})
                    </p>
                  ))}
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-2">Action</p>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs font-medium mb-1">Internal notes (optional)</p>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value.slice(0, 500))}
                  placeholder="Add context for audit log..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setActionDialog(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedAction}
                  onClick={handleResolve}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log */}
      {actions.length > 0 && (
        <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              MODERATION AUDIT LOG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs">{a.target_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={['ban', 'suspension'].includes(a.action_type) ? 'destructive' : 'outline'}
                          className="text-[10px]"
                        >
                          {a.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{a.reason || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{a.notes || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Safety Policy */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">ENFORCEMENT LADDER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            '1. Content removed / hidden',
            '2. User warning issued',
            '3. Temporary posting restriction',
            '4. Temporary account suspension',
            '5. Permanent ban',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{rule}</span>
            </div>
          ))}
          <div className="border-t border-border/30 pt-3 mt-3 space-y-1.5">
            {[
              'Reporter identity is never exposed',
              'All actions are audit-logged',
              'AI content is labeled across the platform',
              'Terms acceptance is version-tracked',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--success))] mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
