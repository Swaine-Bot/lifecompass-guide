import { supabase } from '@/integrations/supabase/client';

const PRIVACY_THRESHOLD = 5; // Minimum cohort size to display

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    activeUsersMonth: number;
    avgSessionsPerUser: number;
    avgGoalsPerUser: number;
    avgHabitsPerUser: number;
    totalMentorChats: number;
    totalFeedPosts: number;
    conversionRate: number;
    monthlyRevenue: number;
  };
  userGrowth: { date: string; count: number }[];
  behavioral: {
    featureUsage: { feature: string; users: number; total: number }[];
    sessionDepth: { bucket: string; count: number }[];
    activeVsPassive: { active: number; passive: number };
    featureAdoption: Record<string, number>;
  };
  sentiment: {
    moodDistribution: { mood: number; count: number }[];
    avgMood: number;
    energyAvg: number;
    sampleSize: number;
  };
  goals: {
    categories: { name: string; count: number; completionRate: number }[];
    statusDistribution: { status: string; count: number }[];
    totalGoals: number;
  };
  mentorTopics: {
    topTopics: { topic: string; percentage: number; description: string }[];
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    keyThemes: string[];
    totalConversations: number;
    totalMessages: number;
  } | null;
  retention: {
    lifePhaseDistribution: { name: string; count: number }[];
    subscriptionBreakdown: { tier: string; count: number }[];
    countryDistribution: { name: string; count: number }[];
  };
  users: {
    details: {
      id: string;
      country: string;
      province: string;
      lifePhase: string;
      subscriptionTier: string;
      joinedAt: string;
      totalScreenTimeSeconds: number;
      habitsCount: number;
      goalsCount: number;
      journalCount: number;
      postsCount: number;
    }[];
  };
}

export function applyPrivacyThreshold<T>(data: T[], minSize: number = PRIVACY_THRESHOLD): T[] | null {
  if (data.length < minSize) return null;
  return data;
}

export function isAboveThreshold(count: number, minSize: number = PRIVACY_THRESHOLD): boolean {
  return count >= minSize;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('admin-analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) throw new Error(error.message || 'Failed to fetch analytics');
  if (data?.error) throw new Error(data.error);
  return data as AdminAnalytics;
}

export async function deleteUser(userId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    headers: { Authorization: `Bearer ${token}` },
    body: { userId },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
}
