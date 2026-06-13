import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Sparkles, Heart, Activity, Apple, Moon, Award, Watch, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  listConnections,
  getSharingPrefs,
  ensureSharingPrefs,
  setSharingPref,
  connectInsurer,
  revokeInsurer,
  disableAllInsurerIntegrations,
  type InsurerConnection,
  type SharingPrefs,
  type SharingPrefKey,
  type InsurerProvider,
} from '@/services/insurer/insurerService';

const PROVIDERS: { id: InsurerProvider; label: string }[] = [
  { id: 'discovery', label: 'Discovery Health' },
  { id: 'momentum', label: 'Momentum' },
  { id: 'profmed', label: 'ProfMed' },
  { id: 'bonitas', label: 'Bonitas' },
];

const PREFS: { key: SharingPrefKey; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'share_wellness', label: 'Wellness data', description: 'Overall wellness score and pillar progress.', icon: Heart },
  { key: 'share_activity', label: 'Activity metrics', description: 'Steps, workouts, active minutes.', icon: Activity },
  { key: 'share_nutrition', label: 'Nutrition metrics', description: 'Logged meals, hydration.', icon: Apple },
  { key: 'share_sleep', label: 'Sleep metrics', description: 'Sleep duration and quality.', icon: Moon },
  { key: 'share_rewards', label: 'Reward progress', description: 'Streaks, XP, milestone completions.', icon: Award },
  { key: 'share_wearable', label: 'Wearable data', description: 'Heart rate, recovery, biosignals.', icon: Watch },
  { key: 'share_insights', label: 'Curated insights', description: 'Saved reflections and mentor moments.', icon: Lightbulb },
  { key: 'allow_personalized_rewards', label: 'Personalized partner rewards', description: 'Tailored incentives from your insurer.', icon: Sparkles },
  { key: 'allow_ai_recommendations', label: 'AI recommendations', description: 'Mentor suggestions informed by your insurer profile.', icon: Sparkles },
  { key: 'allow_anonymized_analytics', label: 'Anonymized analytics', description: 'Aggregate patterns, never linked to you.', icon: Shield },
  { key: 'allow_research', label: 'Research participation', description: 'Anonymized contribution to wellness research.', icon: Shield },
  { key: 'allow_sponsor_recommendations', label: 'Sponsor recommendations', description: 'Approved partner offers in-app.', icon: Sparkles },
];

export function InsurerWellnessPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<InsurerConnection[]>([]);
  const [prefs, setPrefs] = useState<SharingPrefs | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [c, p] = await Promise.all([listConnections(user.id), ensureSharingPrefs(user.id)]);
      setConnections(c);
      setPrefs(p);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;

  const connectionFor = (provider: InsurerProvider) => connections.find(c => c.provider === provider);

  const handleConnect = async (provider: InsurerProvider) => {
    setBusy(provider);
    const { error } = await connectInsurer(user.id, provider, true);
    if (error) toast.error('Could not connect. Try again.');
    else {
      toast.success(`${provider} connected (Demo Mode)`);
      setConnections(await listConnections(user.id));
    }
    setBusy(null);
  };

  const handleRevoke = async (provider: InsurerProvider) => {
    setBusy(provider);
    const { error } = await revokeInsurer(user.id, provider);
    if (error) toast.error('Could not revoke.');
    else {
      toast.success(`${provider} disconnected`);
      setConnections(await listConnections(user.id));
    }
    setBusy(null);
  };

  const handleToggle = async (key: SharingPrefKey, value: boolean) => {
    setPrefs(prev => (prev ? { ...prev, [key]: value } : prev)); // optimistic
    const { error } = await setSharingPref(user.id, key, value);
    if (error) {
      toast.error('Could not save preference');
      setPrefs(prev => (prev ? { ...prev, [key]: !value } : prev));
    }
  };

  const handleKillSwitch = async () => {
    if (!confirm('Disable ALL insurer integrations? All toggles will switch off and all connections will be revoked.')) return;
    setBusy('kill');
    const { error } = await disableAllInsurerIntegrations(user.id);
    if (error) toast.error('Could not disable. Try again.');
    else {
      toast.success('All insurer integrations disabled.');
      const [c, p] = await Promise.all([listConnections(user.id), ensureSharingPrefs(user.id)]);
      setConnections(c);
      setPrefs(p);
    }
    setBusy(null);
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* Connections */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="settings-icon"><Shield /></span>
            <span className="min-w-0 break-words">Connected Providers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-white/60">
            All connections currently run in <strong>Demo Mode</strong>. Live insurer APIs activate once your provider is approved.
          </p>
          {loading ? (
            <p className="text-sm text-white/60">Loading…</p>
          ) : (
            PROVIDERS.map(p => {
              const conn = connectionFor(p.id);
              const active = conn && conn.status !== 'revoked';
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{p.label}</p>
                    {active && <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-widest">{conn?.status}</Badge>}
                  </div>
                  {active ? (
                    <Button size="sm" variant="ghost" disabled={busy === p.id} onClick={() => handleRevoke(p.id)}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled={busy === p.id} onClick={() => handleConnect(p.id)}>
                      Connect
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Sharing prefs */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="settings-icon"><Sparkles /></span>
            <span className="min-w-0 break-words">Data Sharing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-white/60">
            Every change is recorded in your consent ledger and can be revoked at any time.
          </p>
          {prefs &&
            PREFS.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <Label className="flex items-center gap-2 text-white">
                    <Icon className="w-4 h-4 shrink-0 text-white/70" />
                    <span className="break-words">{label}</span>
                  </Label>
                  <p className="text-xs text-white/55 mt-1 break-words">{description}</p>
                </div>
                <Switch checked={prefs[key]} onCheckedChange={v => handleToggle(key, v)} />
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Kill switch */}
      <Card variant="glass" className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-200">
            <span className="settings-icon"><ShieldOff /></span>
            <span className="min-w-0 break-words">Emergency Disable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-white/60 mb-3">
            Instantly revokes every insurer connection, switches every sharing toggle off, and writes an audit entry.
          </p>
          <Button variant="destructive" disabled={busy === 'kill'} onClick={handleKillSwitch} className="w-full">
            Disable all insurer integrations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
