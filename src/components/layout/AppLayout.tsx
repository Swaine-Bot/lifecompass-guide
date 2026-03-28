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

export const AppLayout = () => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isKeyboardOpen } = useNativeKeyboard();
  const isMentorKeyboardMode = location.pathname.startsWith('/mentor') && isKeyboardOpen;
  
  // Track user session for screen time analytics
  useSessionTracking();
  useProgressiveProfiling();

  const handleRefresh = useCallback(async () => {
    // Refresh all queries and profile data
    await Promise.all([
      queryClient.invalidateQueries(),
      refreshProfile(),
    ]);
    // Dispatch custom event for pages using local state
    window.dispatchEvent(new CustomEvent('app-refresh'));
  }, [queryClient, refreshProfile]);

  if (loading) {
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

  // Redirect to onboarding if not completed
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <SensoryProvider lifePhase={profile?.life_phase}>
      <div className="flex min-h-screen bg-background relative">
        <EnvironmentLayer />
        <ContextOverlay />
        <FeedbackPulse />
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen lg:pb-0 overflow-x-hidden relative" style={{ zIndex: 2, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: isMentorKeyboardMode ? 'env(safe-area-inset-bottom, 0px)' : 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' }}>
          <PullToRefresh 
            onRefresh={handleRefresh}
            className="flex-1 h-full"
          >
            <div className="container max-w-5xl mx-auto py-6 px-4 lg:px-6">
              <Outlet />
            </div>
          </PullToRefresh>
        </main>
        {!isMentorKeyboardMode && <BottomNav />}
      </div>
    </SensoryProvider>
  );
};
