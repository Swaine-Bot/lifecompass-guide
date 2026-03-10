import { useState } from 'react';
import { ShieldAlert, Flag, Ban, CheckCircle, AlertTriangle, Eye, Gavel } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '../StatCard';

// Placeholder for future reported content system
interface ReportedItem {
  id: string;
  type: 'post' | 'share_card' | 'comment';
  reason: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'actioned';
}

export function TrustSafety() {
  const [reports] = useState<ReportedItem[]>([]);
  // In production, fetch from a reports table

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Trust & Safety"
        description="Content moderation, reports queue, and community safety controls"
        icon={ShieldAlert}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Reports" value={reports.filter(r => r.status === 'pending').length} icon={AlertTriangle} />
        <StatCard title="Reviewed Today" value={reports.filter(r => r.status === 'reviewed').length} icon={Eye} />
        <StatCard title="Actions Taken" value={reports.filter(r => r.status === 'actioned').length} icon={Gavel} />
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
              <p className="text-sm text-muted-foreground">No pending reports</p>
              <p className="text-xs text-muted-foreground/60 mt-1">All clear — community is healthy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
                      <span className="text-xs text-muted-foreground">{report.reason}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">{new Date(report.reportedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Dismiss
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive">
                      <Ban className="w-3 h-3 mr-1" />
                      Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
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
