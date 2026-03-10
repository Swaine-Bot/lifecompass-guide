import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  mirror_moments: boolean;
  cinematic_reports: boolean;
  milestone_alerts: boolean;
  weekly_recap: boolean;
  drift_warnings: boolean;
  frequency: 'minimal' | 'normal' | 'all';
}

const defaults: NotificationPreferences = {
  mirror_moments: true,
  cinematic_reports: true,
  milestone_alerts: true,
  weekly_recap: true,
  drift_warnings: false,
  frequency: 'normal',
};

export const notificationPrefService = {
  async get(userId: string): Promise<NotificationPreferences> {
    const { data } = await supabase
      .from('notification_preferences' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      return {
        mirror_moments: (data as any).mirror_moments ?? defaults.mirror_moments,
        cinematic_reports: (data as any).cinematic_reports ?? defaults.cinematic_reports,
        milestone_alerts: (data as any).milestone_alerts ?? defaults.milestone_alerts,
        weekly_recap: (data as any).weekly_recap ?? defaults.weekly_recap,
        drift_warnings: (data as any).drift_warnings ?? defaults.drift_warnings,
        frequency: (data as any).frequency ?? defaults.frequency,
      };
    }

    // Lazy create defaults
    await supabase.from('notification_preferences' as any).insert({
      user_id: userId,
      ...defaults,
    });

    return { ...defaults };
  },

  async update(userId: string, updates: Partial<NotificationPreferences>) {
    const { error } = await supabase
      .from('notification_preferences' as any)
      .upsert({
        user_id: userId,
        ...updates,
      }, { onConflict: 'user_id' });

    if (error) throw error;
  },
};
