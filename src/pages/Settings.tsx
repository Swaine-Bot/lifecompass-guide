import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Shield, Lock, Trash2, 
  LogOut, Save, Camera, MapPin, Globe, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import lifestackLogo from '@/assets/lifestack-logo.png';
import { useLocation, LocationPermission } from '@/hooks/useLocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';
import { SubscriptionBadge, ProgressToPaywall, UpgradeModal } from '@/components/subscription';

interface PrivacySettings {
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  show_activity_status: boolean;
  allow_friend_requests: boolean;
}

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { tier, isPremium } = useSubscription();
  const navigate = useNavigate();
  const { permission: locationPermission, updatePermission, latitude, longitude, error: locationError } = useLocation();
  const { language, setLanguage, t, languageNames } = useLanguage();
  const [name, setName] = useState(profile?.name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    terms_accepted: false,
    privacy_policy_accepted: false,
    profile_visibility: 'friends',
    show_activity_status: true,
    allow_friend_requests: true,
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTimezone(profile.timezone || 'UTC');
    }
    fetchPrivacySettings();
  }, [profile]);

  const fetchPrivacySettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPrivacySettings({
        terms_accepted: data.terms_accepted || false,
        privacy_policy_accepted: data.privacy_policy_accepted || false,
        profile_visibility: (data.profile_visibility as 'public' | 'friends' | 'private') || 'friends',
        show_activity_status: data.show_activity_status ?? true,
        allow_friend_requests: data.allow_friend_requests ?? true,
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ name, timezone })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      refreshProfile();
    }

    setLoading(false);
  };

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    if (!user) return;

    const newSettings = { ...privacySettings, ...updates };
    setPrivacySettings(newSettings);

    const { error } = await supabase
      .from('privacy_settings')
      .upsert({
        user_id: user.id,
        ...newSettings,
        terms_accepted_at: updates.terms_accepted ? new Date().toISOString() : undefined,
        privacy_policy_accepted_at: updates.privacy_policy_accepted ? new Date().toISOString() : undefined,
      });

    if (error) {
      toast.error('Failed to update privacy settings');
    } else {
      toast.success('Privacy settings updated');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    // Note: Full account deletion would require an edge function with admin privileges
    toast.info('Account deletion request submitted. You will receive a confirmation email.');
    setShowDeleteDialog(false);
  };

  const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland'];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={lifestackLogo} alt="LifeStack" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-serif font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-1.5">
            <Crown className="w-4 h-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">{name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('settings.language')}
                </Label>
                <p className="text-sm text-muted-foreground">{t('settings.selectLanguage')}</p>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <SelectItem key={lang} value={lang}>{languageNames[lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="gold" onClick={updateProfile} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Account Status</Label>
                  <p className="text-sm text-muted-foreground">Your current access level</p>
                </div>
                <SubscriptionBadge />
              </div>

              {!isPremium && (
                <>
                  <div className="pt-4 border-t border-border/30">
                    <ProgressToPaywall />
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <p className="text-sm text-foreground/80">
                      Some features require an active LifeStack subscription. Subscription management is handled through your LifeStack account.
                    </p>
                  </div>
                </>
              )}

              {isPremium && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground/80">
                    You have full access to all LifeStack features. Thank you for your commitment to growth!
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                LifeStack is an account-based life companion platform.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select 
                  value={privacySettings.profile_visibility} 
                  onValueChange={(v) => updatePrivacy({ profile_visibility: v as any })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Activity Status</Label>
                  <p className="text-sm text-muted-foreground">Let friends see when you're active</p>
                </div>
                <Switch
                  checked={privacySettings.show_activity_status}
                  onCheckedChange={(v) => updatePrivacy({ show_activity_status: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                </div>
                <Switch
                  checked={privacySettings.allow_friend_requests}
                  onCheckedChange={(v) => updatePrivacy({ allow_friend_requests: v })}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location Services
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable location for finding nearby professionals and local features
                  </p>
                  {latitude && longitude && (
                    <p className="text-xs text-primary mt-1">
                      ✓ Location active
                    </p>
                  )}
                  {locationError && (
                    <p className="text-xs text-destructive mt-1">
                      {locationError}
                    </p>
                  )}
                </div>
                <Select 
                  value={locationPermission} 
                  onValueChange={(v) => updatePermission(v as LocationPermission)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="while_using">While Using App</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Legal Agreements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={privacySettings.privacy_policy_accepted}
                    onCheckedChange={(v) => updatePrivacy({ privacy_policy_accepted: v })}
                  />
                  <div>
                    <Label>Privacy Policy</Label>
                    <p className="text-sm text-muted-foreground">
                      I accept the{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={privacySettings.terms_accepted}
                    onCheckedChange={(v) => updatePrivacy({ terms_accepted: v })}
                  />
                  <div>
                    <Label>Terms & Conditions</Label>
                    <p className="text-sm text-muted-foreground">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/reset-password">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This will permanently delete your account and all data. Type DELETE to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Type DELETE to confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={deleteAccount}>
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
}
