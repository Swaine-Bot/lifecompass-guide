import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Loader2 } from 'lucide-react';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useProgressiveProfiling } from '@/hooks/useProgressiveProfiling';
import { SensoryProvider } from '@/contexts/SensoryContext';
import { EnvironmentLayer } from '@/components/sensory/EnvironmentLayer';
import { ContextOverlay } from '@/components/sensory/ContextOverlay';
import { FeedbackPulse } from '@/components/sensory/FeedbackPulse';
import { useNativeKeyboard } from '@/hooks/useNativeKeyboard';
import { useDailyStreakPing } from '@/hooks/useDailyStreakPing';
import { MentorSpiritProvider } from '@/contexts/MentorSpiritContext';
import { MentorSpirit } from '@/components/spirit/MentorSpirit';

export const AppLayout = () => {
  const { user, loading, profileLoading, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isKeyboardOpen } = useNativeKeyboard();
  const isMentorKeyboardMode = location.pathname.startsWith('/mentor') && isKeyboardOpen;
  
  // Track user session for screen time analytics
  useSessionTracking();
  useProgressiveProfiling();
  useDailyStreakPing();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries(),
      refreshProfile(),
    ]);
    window.dispatchEvent(new CustomEvent('app-refresh'));
  }, [queryClient, refreshProfile]);

  // Wait for auth AND profile to be fully resolved before making routing decisions
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed — only when profile is definitely loaded
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // If profile is null (not yet created), also redirect to onboarding
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <SensoryProvider lifePhase={profile?.life_phase}>
      <MentorSpiritProvider>
        <div className="flex h-screen-safe bg-background relative overflow-hidden max-w-[100vw]">
          <EnvironmentLayer />
          <ContextOverlay />
          <FeedbackPulse />
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-0 min-w-0 lg:pb-0 overflow-x-hidden overflow-y-auto relative overscroll-safe" style={{ zIndex: 2, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: isMentorKeyboardMode ? 'env(safe-area-inset-bottom, 0px)' : 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 5.5rem)' }}>
            <PullToRefresh 
              onRefresh={handleRefresh}
              className="flex-1 min-w-0"
            >
              <div className="container max-w-5xl mx-auto py-6 px-4 lg:px-6 min-w-0 overflow-x-hidden">
                <Outlet />
              </div>
            </PullToRefresh>
          </main>
          {!isMentorKeyboardMode && <BottomNav />}
          <MentorSpirit />
        </div>
      </MentorSpiritProvider>
    </SensoryProvider>
  );
};
