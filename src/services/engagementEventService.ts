import { supabase } from '@/integrations/supabase/client';

type SourceEngine = 'mirror' | 'cinematics' | 'broadcast' | 'vault' | 'settings';

/**
 * Fire-and-forget engagement event logger.
 * Never throws — failures are silently logged to console.
 */
export const engagementEventService = {
  async log(
    eventType: string,
    sourceEngine: SourceEngine,
    metadata: Record<string, unknown> = {}
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('engagement_events' as any).insert({
        user_id: user.id,
        event_type: eventType,
        source_engine: sourceEngine,
        metadata,
      });
    } catch (e) {
      console.warn('[engagement] event log failed:', e);
    }
  },
};
