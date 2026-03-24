import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Layer 3 — Progressive Profiling
 * Fires contextual prompts after session milestones to capture
 * deeper data without burdening onboarding.
 */
export function useProgressiveProfiling() {
  const { user, profile } = useAuth();

  const checkAndPrompt = useCallback(async () => {
    if (!user || !profile) return;

    // Count sessions
    const { count } = await supabase
      .from('app_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const sessions = count ?? 0;

    // After 3 sessions — ask productivity time preference
    if (sessions >= 3 && !(profile as any).age_range) {
      // Could dispatch a soft prompt event for the UI to pick up
      window.dispatchEvent(new CustomEvent('progressive-profile-prompt', {
        detail: {
          type: 'productivity_time',
          question: 'What time of day are you most productive?',
          options: ['Morning', 'Afternoon', 'Evening', 'Night'],
        },
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    // Delay check to avoid competing with page load
    const timer = setTimeout(checkAndPrompt, 10_000);
    return () => clearTimeout(timer);
  }, [checkAndPrompt]);
}
