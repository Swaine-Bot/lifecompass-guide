import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!user) {
      // End any existing session when user logs out
      if (sessionIdRef.current && startTimeRef.current) {
        endSession();
      }
      return;
    }

    // Start a new session when user is authenticated
    startSession();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - end session
        endSession();
      } else {
        // Page is visible - start new session
        startSession();
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [user]);

  const startSession = async () => {
    if (!user || sessionIdRef.current) return;

    try {
      const { data, error } = await supabase
        .from('app_sessions')
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!error && data) {
        sessionIdRef.current = data.id;
        startTimeRef.current = new Date();
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const endSession = async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;

    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);

    try {
      await supabase
        .from('app_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('id', sessionIdRef.current);
    } catch (err) {
      console.error('Error ending session:', err);
    }

    sessionIdRef.current = null;
    startTimeRef.current = null;
  };
};
