import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MirrorMoment {
  id: string;
  category: string;
  content: string;
  confidence_score: number;
  source_categories: string[];
  is_read: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  moment_date: string;
}

interface CinematicReport {
  id: string;
  report_type: string;
  title: string;
  narrative: string;
  key_stats: Record<string, number>;
  major_wins: string[];
  lessons: string[];
  turning_points: string[];
  period_start: string;
  period_end: string;
  is_read: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
}

interface ShareCard {
  id: string;
  card_type: string;
  title: string;
  subtitle: string | null;
  stat_value: string | null;
  stat_label: string | null;
  signature_phrase: string | null;
  theme: string;
  privacy_level: string;
  is_shared: boolean;
  is_archived: boolean;
  created_at: string;
}

export function useViralEngagement() {
  const { user } = useAuth();
  const [mirrorMoments, setMirrorMoments] = useState<MirrorMoment[]>([]);
  const [latestMirror, setLatestMirror] = useState<MirrorMoment | null>(null);
  const [cinematicReports, setCinematicReports] = useState<CinematicReport[]>([]);
  const [shareCards, setShareCards] = useState<ShareCard[]>([]);
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [cinematicLoading, setCinematicLoading] = useState(false);

  const fetchMirrorMoments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mirror_moments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setMirrorMoments(data as MirrorMoment[]);
      if (data.length > 0) setLatestMirror(data[0] as MirrorMoment);
    }
  }, [user]);

  const fetchCinematicReports = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cinematic_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setCinematicReports(data as CinematicReport[]);
  }, [user]);

  const fetchShareCards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('share_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setShareCards(data as ShareCard[]);
  }, [user]);

  const generateMirrorMoment = useCallback(async () => {
    if (!user) return null;
    setMirrorLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-mirror-moment');
      if (error) throw error;
      if (data?.moment) {
        setLatestMirror(data.moment);
        await fetchMirrorMoments();
        return data.moment;
      }
      return null;
    } catch (e) {
      console.error('Mirror moment error:', e);
      return null;
    } finally {
      setMirrorLoading(false);
    }
  }, [user, fetchMirrorMoments]);

  const generateCinematicReport = useCallback(async (reportType: string = 'weekly') => {
    if (!user) return null;
    setCinematicLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cinematic-report', {
        body: { report_type: reportType },
      });
      if (error) throw error;
      if (data?.report) {
        await fetchCinematicReports();
        return data.report;
      }
      return null;
    } catch (e) {
      console.error('Cinematic report error:', e);
      return null;
    } finally {
      setCinematicLoading(false);
    }
  }, [user, fetchCinematicReports]);

  const toggleFavorite = useCallback(async (table: 'mirror_moments' | 'cinematic_reports', id: string, current: boolean) => {
    await supabase.from(table).update({ is_favorite: !current }).eq('id', id);
    if (table === 'mirror_moments') await fetchMirrorMoments();
    else await fetchCinematicReports();
  }, [fetchMirrorMoments, fetchCinematicReports]);

  const markRead = useCallback(async (table: 'mirror_moments' | 'cinematic_reports', id: string) => {
    await supabase.from(table).update({ is_read: true }).eq('id', id);
  }, []);

  const archiveItem = useCallback(async (table: 'mirror_moments' | 'cinematic_reports' | 'share_cards', id: string) => {
    await supabase.from(table).update({ is_archived: true }).eq('id', id);
    if (table === 'mirror_moments') await fetchMirrorMoments();
    else if (table === 'cinematic_reports') await fetchCinematicReports();
    else await fetchShareCards();
  }, [fetchMirrorMoments, fetchCinematicReports, fetchShareCards]);

  useEffect(() => {
    if (!user) return;
    fetchMirrorMoments();
    fetchCinematicReports();
    fetchShareCards();
  }, [user, fetchMirrorMoments, fetchCinematicReports, fetchShareCards]);

  return {
    mirrorMoments,
    latestMirror,
    cinematicReports,
    shareCards,
    mirrorLoading,
    cinematicLoading,
    generateMirrorMoment,
    generateCinematicReport,
    toggleFavorite,
    markRead,
    archiveItem,
    fetchShareCards,
  };
}
