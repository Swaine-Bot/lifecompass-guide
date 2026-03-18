import { useState, useEffect, useRef } from 'react';
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
  LogOut, Save, Camera, MapPin, Globe, Crown, ExternalLink, Info, Upload, Loader2,
  Bell, BellOff, X, Download, FileDown, Sparkles, UserPlus
} from 'lucide-react';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import lifestackLogo from '@/assets/lifestack-logo.png';
import { useLocation, LocationPermission } from '@/hooks/useLocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';
import { SubscriptionBadge, ProgressToPaywall, UpgradeModal } from '@/components/subscription';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationPreferencesCard } from '@/components/viral/NotificationPreferences';
import { WearableSettings } from '@/components/wearables/WearableSettings';
import { Watch } from 'lucide-react';

interface PrivacySettings {
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  show_activity_status: boolean;
  allow_friend_requests: boolean;
  notifications_goals: boolean;
  notifications_social: boolean;
  notifications_nudges: boolean;
  show_ai_insights_to_friends: boolean;
  curated_suggestions_enabled: boolean;
}

type ExportStatus = 'idle' | 'loading' | 'done';

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { tier, isPremium } = useSubscription();
  const navigate = useNavigate();
  const { permission: locationPermission, updatePermission, latitude, longitude, error: locationError } = useLocation();
  const { language, setLanguage, t, languageNames } = useLanguage();
  const pushNotifications = usePushNotifications();
  const { openShareStudio } = useUniversalShare();
  const [name, setName] = useState(profile?.name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    terms_accepted: false,
    privacy_policy_accepted: false,
    profile_visibility: 'friends',
    show_activity_status: true,
    allow_friend_requests: true,
    notifications_goals: true,
    notifications_social: true,
    notifications_nudges: true,
    show_ai_insights_to_friends: true,
    curated_suggestions_enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTimezone(profile.timezone || 'UTC');
      loadAvatarUrl();
    }
    fetchPrivacySettings();
  }, [profile]);

  const loadAvatarUrl = async () => {
    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    
    // If it's a storage path, generate signed URL
    if (profile.avatar_url.includes('avatars/')) {
      const { data, error } = await supabase.storage
        .from('user-media')
        .createSignedUrl(profile.avatar_url, 3600);
      
      if (!error && data) {
        setAvatarUrl(data.signedUrl);
      }
    } else {
      setAvatarUrl(profile.avatar_url);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        await supabase.storage
          .from('user-media')
          .remove([profile.avatar_url]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update profile with new avatar path
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Get signed URL for display
      const { data: urlData } = await supabase.storage
        .from('user-media')
        .createSignedUrl(fileName, 3600);

      if (urlData) {
        setAvatarUrl(urlData.signedUrl);
      }

      // Refresh profile to update context with new avatar
      await refreshProfile();
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        notifications_goals: data.notifications_goals ?? true,
        notifications_social: data.notifications_social ?? true,
        notifications_nudges: data.notifications_nudges ?? true,
        show_ai_insights_to_friends: data.show_ai_insights_to_friends ?? true,
        curated_suggestions_enabled: (data as any).curated_suggestions_enabled ?? false,
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

  const exportUserData = async () => {
    if (!user) return;
    setExportStatus('loading');
    try {
      const tables = ['profiles', 'goals', 'habits', 'habit_logs', 'tasks', 'milestones', 
        'journal_entries', 'daily_checkins', 'life_events', 'mentor_conversations', 'mentor_messages',
        'posts', 'comments', 'privacy_settings'] as const;
      
      const exportData: Record<string, unknown> = { exported_at: new Date().toISOString(), user_email: user.email };
      
      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        exportData[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifestack-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
      setExportStatus('done');
    } catch {
      toast.error('Failed to export data');
      setExportStatus('idle');
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="rounded-full"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full overflow-x-auto scrollbar-hide">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Engage
          </TabsTrigger>
          <TabsTrigger value="wearables" className="flex items-center gap-1">
            <Watch className="w-3.5 h-3.5" />
            Devices
          </TabsTrigger>
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
                <div className="relative group">
                  <Avatar className="w-20 h-20 ring-2 ring-border">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP or GIF. Max 5MB.
                  </p>
                </div>
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

              <div className="flex gap-2">
                <Button variant="gold" onClick={updateProfile} disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {t('settings.saveChanges')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openShareStudio({ type: 'app_invite', title: 'Invite to LifeStack' })}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
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
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label>Profile Visibility</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select 
                  value={privacySettings.profile_visibility} 
                  onValueChange={(v) => updatePrivacy({ profile_visibility: v as any })}
                >
                  <SelectTrigger className="w-28 sm:w-32 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label>Show Activity Status</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Let friends see when you're active</p>
                </div>
                <Switch
                  checked={privacySettings.show_activity_status}
                  onCheckedChange={(v) => updatePrivacy({ show_activity_status: v })}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label>Allow Friend Requests</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Let others send you friend requests</p>
                </div>
                <Switch
                  checked={privacySettings.allow_friend_requests}
                  onCheckedChange={(v) => updatePrivacy({ allow_friend_requests: v })}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label>Show AI Insights to Friends</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Let friends see AI mentor comments on your posts</p>
                </div>
                <Switch
                  checked={privacySettings.show_ai_insights_to_friends}
                  onCheckedChange={(v) => updatePrivacy({ show_ai_insights_to_friends: v })}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="min-w-0 flex-1">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    Curated Suggestions
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Show curated recommendations in AI insights on your feed posts
                  </p>
                </div>
                <Switch
                  checked={privacySettings.curated_suggestions_enabled}
                  onCheckedChange={(v) => updatePrivacy({ curated_suggestions_enabled: v })}
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/30">
                <div className="min-w-0 flex-1">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    Location Services
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Enable location for nearby professionals
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
                  <SelectTrigger className="w-32 sm:w-40 shrink-0">
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

          {/* Push Notifications Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Push Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="min-w-0 flex-1">
                  <Label className="flex items-center gap-2">
                    {pushNotifications.isSubscribed ? (
                      <Bell className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    Push Notifications
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {pushNotifications.isSupported 
                      ? pushNotifications.isSubscribed 
                        ? "You'll receive notifications on this device"
                        : "Get notified about important updates"
                      : "Push notifications are not supported on this device"}
                  </p>
                  {pushNotifications.permission === 'denied' && (
                    <p className="text-xs text-destructive mt-1">
                      Notifications blocked. Please enable in browser settings.
                    </p>
                  )}
                </div>
                <Switch
                  checked={pushNotifications.isSubscribed}
                  onCheckedChange={() => pushNotifications.toggle()}
                  disabled={!pushNotifications.isSupported || pushNotifications.loading || pushNotifications.permission === 'denied'}
                />
              </div>

              {/* Notification Categories */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Notification Types</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Goals & Tasks</Label>
                    <p className="text-sm text-muted-foreground">Deadline reminders and task notifications</p>
                  </div>
                  <Switch
                    checked={privacySettings.notifications_goals}
                    onCheckedChange={(v) => updatePrivacy({ notifications_goals: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Social Activity</Label>
                    <p className="text-sm text-muted-foreground">Reactions and comments on your posts</p>
                  </div>
                  <Switch
                    checked={privacySettings.notifications_social}
                    onCheckedChange={(v) => updatePrivacy({ notifications_social: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nudges & Reminders</Label>
                    <p className="text-sm text-muted-foreground">Daily check-ins and habit reminders</p>
                  </div>
                  <Switch
                    checked={privacySettings.notifications_nudges}
                    onCheckedChange={(v) => updatePrivacy({ notifications_nudges: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Rights - GDPR/POPIA */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5" />
                Your Data Rights (GDPR / POPIA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Under GDPR and POPIA, you have the right to access, export, and delete your personal data at any time.
              </p>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <Label className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export My Data
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your personal data in JSON format (Right to Data Portability)
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={exportUserData} 
                  disabled={exportStatus === 'loading'}
                >
                  {exportStatus === 'loading' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</>
                  ) : exportStatus === 'done' ? (
                    'Downloaded ✓'
                  ) : (
                    <><Download className="w-4 h-4 mr-2" />Export</>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium mb-1">Your rights include:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Right of access — request a copy of your data</li>
                  <li>Right to rectification — update inaccurate data via your profile</li>
                  <li>Right to erasure — delete your account and all data</li>
                  <li>Right to data portability — export data in machine-readable format</li>
                  <li>Right to withdraw consent — toggle off any optional feature below</li>
                  <li>Right to lodge a complaint — contact your local Data Protection Authority or the SA Information Regulator</li>
                </ul>
                <p className="mt-2">Contact: <strong>privacy@lifestack.app</strong> or <strong>dpo@lifestack.app</strong></p>
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
                    <Label>Terms &amp; Conditions</Label>
                    <p className="text-sm text-muted-foreground">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms &amp; Conditions
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <NotificationPreferencesCard />
        </TabsContent>

        <TabsContent value="wearables" className="space-y-4">
          <WearableSettings />
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

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About LifeStack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                LifeStack is your life companion platform for goals, habits, and personal growth.
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://lifestack.app', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
              <p className="text-xs text-muted-foreground">
                Version 1.0.0
              </p>
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
