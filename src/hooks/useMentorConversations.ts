import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useMentorConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    setConversations(data || []);
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('mentor_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(
      (data || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    );
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('mentor_conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }

    await fetchConversations();
    return data.id;
  }, [user, fetchConversations]);

  // Save a message to the database
  const saveMessage = useCallback(
    async (conversationId: string, role: 'user' | 'assistant', content: string) => {
      const { error } = await supabase.from('mentor_messages').insert({
        conversation_id: conversationId,
        role,
        content,
      });

      if (error) {
        console.error('Error saving message:', error);
      }

      // Update conversation title based on first user message
      if (role === 'user' && messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('mentor_conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        await supabase
          .from('mentor_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      await fetchConversations();
    },
    [messages.length, fetchConversations]
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      // First delete all messages
      await supabase.from('mentor_messages').delete().eq('conversation_id', conversationId);

      // Then delete the conversation
      const { error } = await supabase
        .from('mentor_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
        return;
      }

      toast.success('Conversation deleted');

      // If we deleted the active conversation, clear it
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }

      await fetchConversations();
    },
    [activeConversationId, fetchConversations]
  );

  // Select a conversation
  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      await fetchMessages(conversationId);
    },
    [fetchMessages]
  );

  // Start a new conversation (clears current state)
  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  // Initialize
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loading,
    setLoading,
    createConversation,
    saveMessage,
    deleteConversation,
    selectConversation,
    startNewConversation,
  };
}
