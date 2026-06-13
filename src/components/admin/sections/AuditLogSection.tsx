import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Switch } from '@/components/ui/switch';

type AuditRow = {
  id: string;
  created_at: string;
  event_type: string;
  resource_type: string | null;
  resource_id: string | null;
  actor_id: string | null;
  user_id: string | null;
  details: any;
};

export function AuditLogSection() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode, toggle } = useDemoMode();

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('audit_log')
      .select('id, created_at, event_type, resource_type, resource_id, actor_id, user_id, details')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) setError(error.message);
    setRows((data as AuditRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="h-4 w-4 text-primary" /> Demo Mode
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Adds a banner across the app for screenshots and live presentations. Does not modify or hide real data.
            </CardDescription>
          </div>
          <Switch checked={isDemoMode} onCheckedChange={toggle} aria-label="Toggle demo mode" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Audit Log</CardTitle>
            <CardDescription className="text-xs">Most recent 200 admin & system events</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={load} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No audit events recorded yet.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {rows.map((r) => (
                <div key={r.id} className="py-2.5 flex items-start gap-3 text-xs">
                  <div className="shrink-0 w-28 text-muted-foreground tabular-nums">
                    {new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{r.event_type}</Badge>
                  <div className="flex-1 min-w-0">
                    {r.resource_type && (
                      <span className="text-muted-foreground">
                        {r.resource_type}{r.resource_id ? ` · ${r.resource_id.slice(0, 8)}…` : ''}
                      </span>
                    )}
                    {r.details && Object.keys(r.details).length > 0 && (
                      <pre className="mt-1 text-[10px] text-muted-foreground/70 truncate whitespace-pre-wrap break-all">
                        {JSON.stringify(r.details)}
                      </pre>
                    )}
                  </div>
                  {r.actor_id && (
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {r.actor_id.slice(0, 6)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
