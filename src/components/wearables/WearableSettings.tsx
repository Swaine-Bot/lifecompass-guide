import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Watch, RefreshCw, Unplug, Plus, Footprints, 
  Activity, Moon, Heart, Flame, Clock, ShieldCheck, Loader2
} from 'lucide-react';
import { useWearables } from '@/hooks/useWearables';
import { WEARABLE_PROVIDERS, type WearableProviderInfo, type WearableProvider } from '@/services/wearables/types';
import { format } from 'date-fns';

function ProviderCard({ provider, isConnected, lastSync, onConnect, onDisconnect }: {
  provider: WearableProviderInfo;
  isConnected: boolean;
  lastSync?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const isAvailable = provider.status === 'available';
  const isNativeOnly = provider.status === 'native_only';
  const isComingSoon = provider.status === 'coming_soon';

  return (
    <Card variant="glass" className="relative overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="text-3xl shrink-0">{provider.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{provider.name}</span>
            {isConnected && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                Connected
              </Badge>
            )}
            {isNativeOnly && !isConnected && (
              <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                Native App
              </Badge>
            )}
            {isComingSoon && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{provider.description}</p>
          {isConnected && lastSync && (
            <p className="text-[10px] text-muted-foreground mt-1">
              <Clock className="inline w-3 h-3 mr-0.5" />
              Last sync: {format(new Date(lastSync), 'MMM d, h:mm a')}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={onDisconnect} className="text-xs">
              <Unplug className="w-3 h-3 mr-1" /> Disconnect
            </Button>
          ) : isAvailable ? (
            <Button size="sm" onClick={onConnect} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Connect
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="text-xs opacity-50">
              {isNativeOnly ? 'Native Only' : 'Soon'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function WearableSettings() {
  const { 
    connections, todaySteps, todayActivity, notifPrefs, loading,
    connect, disconnect, logManualSteps, updateNotifPrefs, refresh, hasConnectedDevice
  } = useWearables();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleManualLog = async () => {
    const steps = parseInt(manualSteps);
    if (!steps || steps < 0) return;
    await logManualSteps(steps);
    setManualSteps('');
    setShowManualEntry(false);
  };

  const handleResync = async () => {
    setSyncing(true);
    await refresh();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const connectedProviders = new Set(connections.filter(c => c.connection_status === 'connected').map(c => c.provider));

  return (
    <div className="space-y-6">
      {/* Today's Activity Summary */}
      <Card variant="glass" className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Footprints className="w-5 h-5 text-primary" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{todaySteps.steps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Steps</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayActivity?.distance_km.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-muted-foreground">km</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayActivity?.active_calories || 0}</p>
              <p className="text-xs text-muted-foreground">cal</p>
            </div>
          </div>
          {todaySteps.provider && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Synced from {todaySteps.provider.replace('_', ' ')}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowManualEntry(true)}>
              <Plus className="w-3 h-3 mr-1" /> Log Steps
            </Button>
            {hasConnectedDevice && (
              <Button variant="outline" size="sm" className="text-xs" onClick={handleResync} disabled={syncing}>
                {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Watch className="w-4 h-4" />
          Wearable Devices
        </h3>
        <div className="space-y-3">
          {WEARABLE_PROVIDERS.map(provider => {
            const conn = connections.find(c => c.provider === provider.id);
            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isConnected={connectedProviders.has(provider.id)}
                lastSync={conn?.last_sync_at || undefined}
                onConnect={() => connect(provider.id)}
                onDisconnect={() => disconnect(provider.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Privacy Notice */}
      <Card variant="glass" className="border-border/20">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">Your health data stays private</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Activity data is only used to power your personal goals, habits, and mentor insights. 
              It is never shared publicly or with third parties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wearable Notification Preferences */}
      {notifPrefs && (
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'step_reminders' as const, label: 'Step reminders', icon: Footprints },
              { key: 'step_milestones' as const, label: 'Step milestones', icon: Flame },
              { key: 'inactivity_nudges' as const, label: 'Inactivity nudges', icon: Moon },
              { key: 'streak_alerts' as const, label: 'Streak alerts', icon: Heart },
              { key: 'weekly_summary' as const, label: 'Weekly summary', icon: Activity },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{label}</span>
                </div>
                <Switch
                  checked={notifPrefs[key]}
                  onCheckedChange={(checked) => updateNotifPrefs({ [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Manual Step Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Steps Manually</DialogTitle>
            <DialogDescription>
              Enter your step count for today. Wearable data takes priority when connected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="number"
              placeholder="e.g. 8500"
              value={manualSteps}
              onChange={e => setManualSteps(e.target.value)}
              min={0}
              max={100000}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowManualEntry(false)}>Cancel</Button>
              <Button onClick={handleManualLog} disabled={!manualSteps || parseInt(manualSteps) <= 0}>
                Log Steps
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
