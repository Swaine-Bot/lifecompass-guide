import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Film, Trophy, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationPrefService, NotificationPreferences as Prefs } from '@/services/notificationPrefService';
import { engagementEventService } from '@/services/engagementEventService';
import { toast } from 'sonner';

const categories = [
  { key: 'mirror_moments' as const, label: 'Mirror Moments', desc: 'AI-generated personal reflections', icon: Sparkles },
  { key: 'cinematic_reports' as const, label: 'Cinematic Reports', desc: 'New life chapters and recaps', icon: Film },
  { key: 'milestone_alerts' as const, label: 'Milestone Alerts', desc: 'Share-worthy achievements', icon: Trophy },
  { key: 'weekly_recap' as const, label: 'Weekly Recap', desc: 'Your week turned into a story', icon: Calendar },
  { key: 'drift_warnings' as const, label: 'Drift Warnings', desc: 'Gentle nudges when patterns shift', icon: AlertTriangle },
];

export function NotificationPreferencesCard() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    notificationPrefService.get(user.id).then((p) => {
      setPrefs(p);
      setLoading(false);
    });
  }, [user]);

  const handleToggle = async (key: keyof Prefs, value: boolean) => {
    if (!user || !prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await notificationPrefService.update(user.id, { [key]: value });
      engagementEventService.log('notification_pref_changed', 'settings', { key, value });
    } catch {
      setPrefs(prefs); // rollback
      toast.error('Failed to update preference');
    }
  };

  const handleFrequency = async (value: string) => {
    if (!user || !prefs) return;
    const freq = value as Prefs['frequency'];
    const updated = { ...prefs, frequency: freq };
    setPrefs(updated);
    try {
      await notificationPrefService.update(user.id, { frequency: freq });
      engagementEventService.log('notification_pref_changed', 'settings', { key: 'frequency', value: freq });
    } catch {
      setPrefs(prefs);
      toast.error('Failed to update frequency');
    }
  };

  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!prefs) return null;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Engagement Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(({ key, label, desc, icon: CatIcon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <CatIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <Label>{label}</Label>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
            <Switch
              checked={prefs[key] as boolean}
              onCheckedChange={(v) => handleToggle(key, v)}
            />
          </div>
        ))}

        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <Label>Frequency</Label>
              <p className="text-sm text-muted-foreground">How often you receive engagement notifications</p>
            </div>
            <Select value={prefs.frequency} onValueChange={handleFrequency}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
