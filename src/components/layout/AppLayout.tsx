import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Loader2 } from 'lucide-react';
import { useSessionTracking } from '@/hooks/useSessionTracking';

export const AppLayout = () => {
  const { user, loading, profile } = useAuth();
  
  // Track user session for screen time analytics
  useSessionTracking();

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
        <div className="flex-1 container max-w-5xl mx-auto py-6 px-4 lg:px-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
