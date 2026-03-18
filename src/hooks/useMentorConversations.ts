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

export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
}

export function useMentorConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) { console.error('Error fetching conversations:', error); return; }
    setConversations(data || []);
  }, [user]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('mentor_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) { console.error('Error fetching messages:', error); return; }
    setMessages(
      (data || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        imageUrl: msg.image_url || null,
      }))
    );
  }, []);

  const createConversation = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('mentor_conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();
    if (error) { console.error('Error creating conversation:', error); toast.error('Failed to create conversation'); return null; }
    await fetchConversations();
    return data.id;
  }, [user, fetchConversations]);

  const saveMessage = useCallback(
    async (conversationId: string, role: 'user' | 'assistant', content: string, imageUrl?: string | null, moderationStatus?: string | null) => {
      const insertData: any = { conversation_id: conversationId, role, content };
      if (imageUrl) insertData.image_url = imageUrl;
      if (moderationStatus) insertData.moderation_status = moderationStatus;

      const { error } = await supabase.from('mentor_messages').insert(insertData);
      if (error) console.error('Error saving message:', error);

      if (role === 'user' && messages.length === 0) {
        const title = content ? (content.slice(0, 50) + (content.length > 50 ? '...' : '')) : '📷 Image';
        await supabase.from('mentor_conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', conversationId);
      } else {
        await supabase.from('mentor_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      }
      await fetchConversations();
    },
    [messages.length, fetchConversations]
  );

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('mentor-images').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) { console.error('Upload error:', error); toast.error('Failed to upload image'); return null; }
    return path;
  }, [user]);

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('mentor-images')
      .createSignedUrl(storagePath, 3600);
    if (error) { console.error('Signed URL error:', error); return null; }
    return data?.signedUrl || null;
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await supabase.from('mentor_messages').delete().eq('conversation_id', conversationId);
      const { error } = await supabase.from('mentor_conversations').delete().eq('id', conversationId);
      if (error) { console.error('Error deleting conversation:', error); toast.error('Failed to delete conversation'); return; }
      toast.success('Conversation deleted');
      if (activeConversationId === conversationId) { setActiveConversationId(null); setMessages([]); }
      await fetchConversations();
    },
    [activeConversationId, fetchConversations]
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      await fetchMessages(conversationId);
    },
    [fetchMessages]
  );

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loading,
    setLoading,
    createConversation,
    saveMessage,
    uploadImage,
    getSignedUrl,
    deleteConversation,
    selectConversation,
    startNewConversation,
  };
}
