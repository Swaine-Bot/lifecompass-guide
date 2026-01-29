import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type LocationPermission = 'always' | 'while_using' | 'never';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: LocationPermission;
}

interface UseLocationReturn extends LocationState {
  requestLocation: () => Promise<void>;
  updatePermission: (permission: LocationPermission) => Promise<void>;
  getMapsSearchUrl: (query: string) => string;
}

export function useLocation(): UseLocationReturn {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permission: 'never',
  });

  // Fetch user's location permission preference
  useEffect(() => {
    async function fetchPermission() {
      if (!user) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { data, error } = await supabase
          .from('privacy_settings')
          .select('location_permission')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const permission = (data?.location_permission as LocationPermission) || 'never';
        setState(prev => ({ ...prev, permission, loading: false }));

        // If permission is 'always', request location immediately
        if (permission === 'always') {
          requestLocationInternal();
        }
      } catch (error) {
        console.error('Error fetching location permission:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    fetchPermission();
  }, [user]);

  const requestLocationInternal = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState(prev => ({
          ...prev,
          latitude,
          longitude,
          error: null,
        }));

        // Save location to profile if user is logged in
        if (user) {
          await supabase
            .from('profiles')
            .update({
              last_latitude: latitude,
              last_longitude: longitude,
              location_updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied by browser';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setState(prev => ({ ...prev, error: errorMessage }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [user]);

  const requestLocation = useCallback(async () => {
    if (state.permission === 'never') {
      setState(prev => ({ ...prev, error: 'Location tracking is disabled in settings' }));
      return;
    }
    requestLocationInternal();
  }, [state.permission, requestLocationInternal]);

  const updatePermission = useCallback(async (permission: LocationPermission) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update({ location_permission: permission })
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({ ...prev, permission }));

      // If turning off location, clear stored location
      if (permission === 'never') {
        await supabase
          .from('profiles')
          .update({
            last_latitude: null,
            last_longitude: null,
            location_updated_at: null,
          })
          .eq('user_id', user.id);
        
        setState(prev => ({ ...prev, latitude: null, longitude: null }));
      } else if (permission === 'always') {
        // If enabling always, request location immediately
        requestLocationInternal();
      }
    } catch (error) {
      console.error('Error updating location permission:', error);
    }
  }, [user, requestLocationInternal]);

  const getMapsSearchUrl = useCallback((query: string) => {
    const baseUrl = 'https://www.google.com/maps/search/';
    const encodedQuery = encodeURIComponent(query);
    
    if (state.latitude && state.longitude) {
      return `${baseUrl}${encodedQuery}/@${state.latitude},${state.longitude},14z`;
    }
    return `${baseUrl}${encodedQuery}`;
  }, [state.latitude, state.longitude]);

  return {
    ...state,
    requestLocation,
    updatePermission,
    getMapsSearchUrl,
  };
}
