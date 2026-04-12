import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, MousePointerClick, TrendingUp, Share2, Globe } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchPartnerAnalytics, type PartnerAnalyticsSummary } from '@/services/partnerAnalyticsService';
import type { PartnerAsset } from '@/services/partnerService';

const COLORS = ['hsl(45, 80%, 55%)', 'hsl(200, 65%, 55%)', 'hsl(150, 60%, 45%)', 'hsl(280, 55%, 55%)', 'hsl(20, 70%, 55%)', 'hsl(340, 60%, 55%)'];

interface PartnerAnalystProps {
  partnerId: string;
  partnerName: string;
  assets: PartnerAsset[];
}

export function PartnerAnalyst({ partnerId, partnerName, assets }: PartnerAnalystProps) {
  const [analytics, setAnalytics] = useState<PartnerAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPartnerAnalytics(partnerId);
      // Enrich asset breakdown with real titles
      data.assetBreakdown = data.assetBreakdown.map(ab => {
        const asset = assets.find(a => a.id === ab.assetId);
        return { ...ab, title: asset?.title || ab.title };
      });
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [partnerId, assets]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No analytics data available</p>
      </div>
    );
  }

  const { totalShareUses, uniqueUsers, totalClicks, ctr, platformBreakdown, assetBreakdown, campaignBreakdown, dailyTrend } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Share2} label="Share Card Uses" value={totalShareUses} />
        <KpiCard icon={Users} label="Unique Users" value={uniqueUsers} />
        <KpiCard icon={MousePointerClick} label="Total Clicks" value={totalClicks} />
        <KpiCard icon={TrendingUp} label="Click-Through Rate" value={`${(ctr * 100).toFixed(1)}%`} />
      </div>

      {/* Usage & Clicks Over Time */}
      {dailyTrend.some(d => d.uses > 0 || d.clicks > 0) && (
        <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity · Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="uses" stroke="hsl(45, 80%, 55%)" strokeWidth={2} dot={false} name="Share Uses" />
                <Line type="monotone" dataKey="clicks" stroke="hsl(200, 65%, 55%)" strokeWidth={2} dot={false} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Platform Distribution */}
        {platformBreakdown.length > 0 && (
          <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={platformBreakdown} dataKey="count" nameKey="platform" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                      {platformBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {platformBreakdown.map((p, i) => (
                    <div key={p.platform} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 truncate capitalize">{p.platform.replace(/_/g, ' ')}</span>
                      <span className="font-medium tabular-nums">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Performance */}
        {campaignBreakdown.length > 0 && (
          <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={campaignBreakdown} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="campaign" tick={{ fontSize: 9 }} width={80} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="uses" fill="hsl(45, 80%, 55%)" radius={[0, 4, 4, 0]} name="Uses" />
                  <Bar dataKey="clicks" fill="hsl(200, 65%, 55%)" radius={[0, 4, 4, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Asset Performance Table */}
      {assetBreakdown.length > 0 && (
        <Card className="border-border/50 bg-card/70 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asset Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Asset</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Uses</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Clicks</th>
                    <th className="text-right py-2 pl-2 font-medium text-muted-foreground">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {assetBreakdown.map(ab => {
                    const assetObj = assets.find(a => a.id === ab.assetId);
                    const isArchived = assetObj?.asset_status === 'archived';
                    return (
                      <tr key={ab.assetId} className="border-b border-border/10">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[200px]">{ab.title}</span>
                            {isArchived && <Badge variant="secondary" className="text-[8px]">Archived</Badge>}
                          </div>
                        </td>
                        <td className="text-right py-2 px-2 tabular-nums">{ab.uses}</td>
                        <td className="text-right py-2 px-2 tabular-nums">{ab.clicks}</td>
                        <td className="text-right py-2 pl-2 tabular-nums">
                          {ab.uses > 0 ? `${((ab.clicks / ab.uses) * 100).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {totalShareUses === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No share activity recorded yet for {partnerName}</p>
          <p className="text-[10px] mt-1">Analytics will populate as users share cards with this partner's assets</p>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-4 transition-all hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold font-serif text-foreground">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
