import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'pro' | 'founder';

interface SubscriptionConfig {
  monthlyPrice: number;
  yearlyPrice: number;
  founderPrice: number;
  microMovesThreshold: number;
  gumroadLinks: {
    monthly: string;
    yearly: string;
    founder: string;
  };
}

interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  microMovesCount: number;
  hasReachedThreshold: boolean;
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  config: SubscriptionConfig;
  isPremium: boolean;
  isFounder: boolean;
  incrementMicroMoves: () => Promise<number>;
  refreshSubscription: () => Promise<void>;
  openCheckout: (plan: 'monthly' | 'yearly' | 'founder') => void;
  canAccessFeature: (feature: PremiumFeature) => boolean;
}

// Define which features require premium
export type PremiumFeature = 
  | 'multi_phase' 
  | 'deep_ai_mentorship' 
  | 'long_range_planning' 
  | 'historical_memory' 
  | 'community_features'
  | 'advanced_analytics';

const PREMIUM_FEATURES: PremiumFeature[] = [
  'multi_phase',
  'deep_ai_mentorship', 
  'long_range_planning',
  'historical_memory',
  'community_features',
  'advanced_analytics'
];

// Configuration
const SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  monthlyPrice: 9.99,
  yearlyPrice: 79,
  founderPrice: 79, // Locked forever at this price
  microMovesThreshold: 30,
  gumroadLinks: {
    // These are placeholder links - user will set up their Gumroad products
    monthly: 'https://lifestack.gumroad.com/l/pro-monthly',
    yearly: 'https://lifestack.gumroad.com/l/pro-yearly',
    founder: 'https://lifestack.gumroad.com/l/founder'
  }
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    isActive: false,
    microMovesCount: 0,
    hasReachedThreshold: false,
    isLoading: true,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Fetch subscription status
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get micro moves count from profile
      const microMovesCount = (profile as any)?.micro_moves_count || 0;

      setState({
        tier: (subscription?.tier as SubscriptionTier) || 'free',
        isActive: subscription?.is_active || false,
        microMovesCount,
        hasReachedThreshold: microMovesCount >= SUBSCRIPTION_CONFIG.microMovesThreshold,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, profile]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const incrementMicroMoves = async (): Promise<number> => {
    if (!user) return 0;

    try {
      // No parameter needed - function uses auth.uid() server-side for security
      const { data, error } = await supabase.rpc('increment_micro_moves');

      if (error) throw error;

      const newCount = data || state.microMovesCount + 1;
      setState(prev => ({
        ...prev,
        microMovesCount: newCount,
        hasReachedThreshold: newCount >= SUBSCRIPTION_CONFIG.microMovesThreshold,
      }));

      return newCount;
    } catch (error) {
      console.error('Error incrementing micro moves:', error);
      return state.microMovesCount;
    }
  };

  const openCheckout = (plan: 'monthly' | 'yearly' | 'founder') => {
    const url = SUBSCRIPTION_CONFIG.gumroadLinks[plan];
    // Append user email for Gumroad pre-fill
    const checkoutUrl = user?.email 
      ? `${url}?email=${encodeURIComponent(user.email)}`
      : url;
    window.open(checkoutUrl, '_blank');
  };

  const canAccessFeature = (feature: PremiumFeature): boolean => {
    if (state.tier === 'pro' || state.tier === 'founder') {
      return true;
    }
    return !PREMIUM_FEATURES.includes(feature);
  };

  const value: SubscriptionContextType = {
    ...state,
    config: SUBSCRIPTION_CONFIG,
    isPremium: state.tier === 'pro' || state.tier === 'founder',
    isFounder: state.tier === 'founder',
    incrementMicroMoves,
    refreshSubscription: fetchSubscription,
    openCheckout,
    canAccessFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
