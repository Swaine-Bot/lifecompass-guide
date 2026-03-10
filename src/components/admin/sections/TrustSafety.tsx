import { useState, useEffect } from 'react';
import { ShieldAlert, Flag, Ban, CheckCircle, AlertTriangle, Eye, Gavel, Clock } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '../StatCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  action_type: string;
  reason: string | null;
  created_at: string;
}

export function TrustSafety() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: reps }, { data: acts }] = await Promise.all([
      supabase.from('content_reports' as any).select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('moderation_actions' as any).select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setReports((reps as any) || []);
    setActions((acts as any) || []);
    setLoading(false);
  };

  const handleResolve = async (reportId: string, action: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    await supabase.from('content_reports' as any).update({
      status: 'resolved',
      action_taken: action,
      reviewed_by_admin_id: session.session.user.id,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', reportId);

    const report = reports.find(r => r.id === reportId);
    if (report) {
      await supabase.from('moderation_actions' as any).insert({
        admin_user_id: session.session.user.id,
        target_type: report.target_type,
        target_id: report.target_id,
        action_type: action,
        reason: report.reason,
      } as any);
    }

    toast.success(`Report ${action}`);
    loadData();
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Trust & Safety"
        description="Content moderation, reports queue, and community safety controls"
        icon={ShieldAlert}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Reports" value={pendingCount} icon={AlertTriangle} />
        <StatCard title="Resolved" value={resolvedCount} icon={Eye} />
        <StatCard title="Actions Taken" value={actions.length} icon={Gavel} />
        <StatCard title="Total Reports" value={reports.length} icon={Flag} />
      </div>

      {/* Reports Queue */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flag className="h-4 w-4" />
            REPORTS QUEUE
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-10 w-10 text-[hsl(var(--success))] mx-auto mb-3 opacity-60" />
              <p className="text-sm text-muted-foreground">No reports</p>
              <p className="text-xs text-muted-foreground/60 mt-1">All clear — community is healthy</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/20">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{report.target_type}</Badge>
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{report.reason}</p>
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleResolve(report.id, 'dismissed')}>
                          <CheckCircle className="w-3 h-3 mr-1" />Dismiss
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => handleResolve(report.id, 'actioned')}>
                          <Ban className="w-3 h-3 mr-1" />Action
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
            <ScrollArea className="h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs">{a.target_type}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{a.action_type}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{a.reason || '—'}</TableCell>
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
          <CardTitle className="text-sm font-medium text-muted-foreground">MODERATION POLICY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            'User-initiated sharing only — no auto-posting',
            'All shared content is user-generated from their own activity',
            'Mentor chat contents never shared without explicit user consent',
            'Share cards include optional privacy controls',
            'Aggregate analytics only — no individual tracking',
            'Admin can ban or remove users at any time',
            'All moderation actions are audit logged',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--success))] mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{rule}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
