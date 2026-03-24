import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { engagementEventService } from '@/services/engagementEventService';

interface GeneratedTask {
  title: string;
  description: string;
  effort_minutes: number;
}

interface PlaybookResult {
  playbook_title: string;
  tasks: GeneratedTask[];
}

interface GoalInput {
  id: string;
  title: string;
  category?: string | null;
  success_metric?: string | null;
  why?: string | null;
  constraints?: string | null;
  target_date?: string | null;
}

export function usePlaybookGenerator() {
  const { user, profile } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<PlaybookResult | null>(null);

  const generateFromGoal = async (goal: GoalInput) => {
    if (!user) return null;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-playbook', {
        body: { source_type: 'goal', goal, profile },
      });
      if (error) throw new Error(error?.message || 'Edge function call failed');
      if (data?.error) throw new Error(data.error);
      if (!data?.playbook_title || !Array.isArray(data?.tasks)) throw new Error('Invalid playbook response');
      setPreview(data);
      engagementEventService.log('playbook_generation_completed', 'broadcast', { source: 'goal' });
      return data as PlaybookResult;
    } catch (e: any) {
      console.error('Playbook generation error:', e);
      const msg = e?.message?.includes('Rate limit') ? 'Too many requests — please try again shortly.' 
        : e?.message?.includes('credits') ? 'AI credits exhausted. Please try again later.'
        : "Couldn't create your playbook just now. Please try again."
      toast.error(msg);
      engagementEventService.log('playbook_generation_failed', 'broadcast', { source: 'goal' });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const generateFromMentor = async (messageContent: string, conversationId?: string) => {
    if (!user) return null;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-playbook', {
        body: { source_type: 'mentor', mentor_message: messageContent, profile },
      });
      if (error) throw new Error(error?.message || 'Edge function call failed');
      if (data?.error) throw new Error(data.error);
      if (!data?.playbook_title || !Array.isArray(data?.tasks)) throw new Error('Invalid playbook response');
      setPreview(data);
      engagementEventService.log('playbook_generation_completed', 'broadcast', { source: 'mentor' });
      return data as PlaybookResult;
    } catch (e: any) {
      console.error('Playbook generation error:', e);
      const msg = e?.message?.includes('Rate limit') ? 'Too many requests — please try again shortly.'
        : e?.message?.includes('credits') ? 'AI credits exhausted. Please try again later.'
        : "Couldn't create your mentor plan just now. Please try again."
      toast.error(msg);
      engagementEventService.log('playbook_generation_failed', 'broadcast', { source: 'mentor' });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const savePlaybook = async (
    result: PlaybookResult,
    opts: {
      goalId?: string;
      conversationId?: string;
      sourceType: 'goal' | 'mentor';
      sourceMessageContent?: string;
    }
  ) => {
    if (!user) return false;
    try {
      // Create playbook record
      const { data: playbook, error: pbError } = await supabase
        .from('playbooks' as any)
        .insert({
          user_id: user.id,
          title: result.playbook_title,
          source_type: opts.sourceType,
          source_goal_id: opts.goalId || null,
          source_conversation_id: opts.conversationId || null,
          source_message_content: opts.sourceMessageContent || null,
        })
        .select()
        .single();

      if (pbError) throw pbError;

      // Create tasks linked to playbook
      const tasks = result.tasks.map((t, i) => ({
        user_id: user.id,
        title: t.title,
        description: t.description,
        effort_minutes: t.effort_minutes,
        status: 'today' as const,
        goal_id: opts.goalId || null,
        playbook_id: (playbook as any).id,
        created_by: 'ai_mentor',
        source_type: opts.sourceType,
        source_conversation_id: opts.conversationId || null,
        sequence_order: i + 1,
        is_one_thing: false,
      }));

      const { error: taskError } = await supabase.from('tasks').insert(tasks as any);
      if (taskError) throw taskError;

      toast.success(`Playbook "${result.playbook_title}" created with ${result.tasks.length} moves!`);
      engagementEventService.log('playbook_accepted', 'broadcast', {
        source: opts.sourceType,
        task_count: result.tasks.length,
      });
      setPreview(null);
      return true;
    } catch (e) {
      console.error('Save playbook error:', e);
      toast.error('Failed to save playbook');
      return false;
    }
  };

  const dismiss = () => {
    setPreview(null);
    engagementEventService.log('playbook_dismissed', 'broadcast', {});
  };

  return { generating, preview, generateFromGoal, generateFromMentor, savePlaybook, dismiss, setPreview };
}
