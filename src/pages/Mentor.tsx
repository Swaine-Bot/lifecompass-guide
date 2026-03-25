import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, AlertTriangle, ExternalLink, MapPin, History, ImagePlus, ShieldCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocation } from '@/hooks/useLocation';
import { MAX_MESSAGE_LENGTH } from '@/lib/validation';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorMessage } from '@/components/mentor/MentorMessage';
import { MentorImagePreview } from '@/components/mentor/MentorImagePreview';
import { useMentorConversations } from '@/hooks/useMentorConversations';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/contexts/SensoryContext';
import { toast } from 'sonner';
import { choreographedDispatch } from '@/engines/choreographyEngine';
import mentorNightSky from '@/assets/environments/mentor-nightsky-bg.jpg';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function Mentor() {
  useEnvironment('mentor');
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const { getMapsSearchUrl, latitude, longitude, permission, requestLocation } = useLocation();

  const {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loading,
    setLoading,
    createConversation,
    saveMessage,
    uploadImage,
    deleteConversation,
    selectConversation,
    startNewConversation,
  } = useMentorConversations();

  useEffect(() => {
    if (permission === 'while_using') requestLocation();
  }, [permission, requestLocation]);

  const prevMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please select a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be under 10MB.');
      return;
    }
    setPendingImage(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && !pendingImage) || loading) return;
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    let storagePath: string | null = null;

    if (pendingImage) {
      setUploading(true);
      storagePath = await uploadImage(pendingImage);
      setUploading(false);
      if (!storagePath) {
        toast.error('Image upload failed. Please try again.');
        return;
      }
    }

    const userMessage = {
      role: 'user' as const,
      content: trimmedInput,
      imageUrl: storagePath,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    await saveMessage(conversationId, 'user', trimmedInput, storagePath);

    try {
      if (storagePath) {
        supabase.from('engagement_events').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'mentor_image_upload_completed',
          source_engine: 'mirror',
          metadata: {},
        }).then(() => {});
      }

      const response = await supabase.functions.invoke('mentor-chat', {
        body: {
          messages: [...messages, { role: 'user', content: trimmedInput }],
          profile,
          imageUrl: storagePath,
        },
      });

      if (response.error) throw response.error;

      const moderationStatus = response.data?.moderation_status;
      const assistantContent = response.data?.message || "I'm here to help you navigate your journey. What's on your mind?";
      choreographedDispatch('mentor_response');
      const assistantMessage = { role: 'assistant' as const, content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(conversationId, 'assistant', assistantContent, null, moderationStatus);

      if (moderationStatus === 'blocked') {
        supabase.from('engagement_events').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'mentor_image_moderation_blocked',
          source_engine: 'mirror',
          metadata: {},
        }).then(() => {});
      }

      if (storagePath && moderationStatus === 'safe') {
        supabase.from('engagement_events').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'mentor_image_analysis_completed',
          source_engine: 'mirror',
          metadata: {},
        }).then(() => {});
      }
    } catch (error) {
      console.error('Mentor chat error:', error);
      const errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => [...prev, { role: 'assistant' as const, content: errorMessage }]);
      await saveMessage(conversationId, 'assistant', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const professionalLinks = [
    { label: 'Find a Therapist', query: 'therapist near me' },
    { label: 'Find a Doctor', query: 'doctor near me' },
    { label: 'Financial Advisor', query: 'financial advisor near me' },
    { label: 'Career Counselor', query: 'career counselor near me' },
  ];

  const charCount = input.length;
  const charWarning = charCount > MAX_MESSAGE_LENGTH * 0.9;

  return (
    <div className="fixed inset-0 bottom-[4.5rem] lg:bottom-0 lg:left-64 flex flex-col bg-background z-10">
      {/* ── Premium top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-card/70 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="icon-orb">
            <Sparkles />
          </div>
          <div>
            <h1 className="font-serif text-base font-semibold tracking-tight text-foreground">AI Mentor</h1>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mt-0.5">Personal guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/[0.08] border border-primary/15 text-primary/80 hover:bg-primary/[0.12] transition-colors text-[11px] font-medium tracking-wide">
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Guidance Only</span>
                <AlertTriangle className="w-2.5 h-2.5 sm:hidden" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4 bg-card/95 backdrop-blur-xl border-white/[0.08]">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary/80" />
                  <p className="text-sm font-semibold text-foreground">About Mentor Guidance</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your AI Mentor offers reflection support and general life guidance. For medical, mental health, financial, or legal matters, consult qualified professionals.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {professionalLinks.map((link) => (
                    <a
                      key={link.query}
                      href={getMapsSearchUrl(link.query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      {link.label}
                    </a>
                  ))}
                </div>
                {latitude && longitude && (
                  <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 pt-1">
                    <MapPin className="w-2.5 h-2.5" /> Using your location for results
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant={sidebarOpen ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "absolute lg:relative inset-y-0 left-0 z-20 transition-transform duration-200 ease-in-out",
          "w-72 bg-card/90 backdrop-blur-xl border-r border-white/[0.06]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full"
        )}>
          <MentorSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => { selectConversation(id); setSidebarOpen(false); }}
            onNewConversation={() => { startNewConversation(); setSidebarOpen(false); }}
            onDeleteConversation={deleteConversation}
            isOpen={true}
            onToggle={() => setSidebarOpen(false)}
          />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Chat column ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {/* Night sky background */}
          <div className="absolute inset-0 z-0">
            <img
              src={mentorNightSky}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Darkening overlay for readability */}
            <div className="absolute inset-0" style={{ background: 'rgba(11, 15, 26, 0.62)' }} />
            {/* Center darkening where messages appear */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 50%, rgba(11, 15, 26, 0.15) 0%, transparent 70%)' }} />
            {/* Soft vignette */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.3) 100%)' }} />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
              {/* ── Empty state ── */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/15 shadow-lg shadow-primary/5">
                    <Sparkles className="w-7 h-7 text-primary/80" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2.5 tracking-tight text-foreground">
                    Hello, {profile?.name || 'there'}
                  </h3>
                  <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                    I'm your AI mentor. Ask me about your goals, habits, or any challenge you're facing.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6 justify-center">
                    {['Review my goals', 'Help me plan', 'I need clarity'].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="text-xs px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground/70 hover:text-foreground hover:bg-white/[0.07] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <MentorMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  imageUrl={msg.imageUrl}
                  conversationId={activeConversationId || undefined}
                />
              ))}

              {/* ── Loading / thinking state ── */}
              {loading && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/15">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="chat-bubble-assistant">
                    <div className="flex items-center gap-2.5 text-sm text-foreground/60">
                      <Loader2 className="w-4 h-4 animate-spin text-primary/60" />
                      <span>{pendingImage || uploading ? 'Analyzing image…' : 'Thinking…'}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>

          {/* ── Input dock — premium composition ── */}
          <div className="border-t border-white/[0.06] bg-card/50 backdrop-blur-2xl shrink-0">
            <div className="max-w-2xl mx-auto px-4 py-3">
              {pendingImage && (
                <div className="mb-3 flex items-center gap-3">
                  <MentorImagePreview
                    file={pendingImage}
                    uploading={uploading}
                    onRemove={() => setPendingImage(null)}
                  />
                  <p className="text-[11px] text-muted-foreground/60">Images shared with your mentor stay private.</p>
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={loading || uploading}
                  className="h-[44px] w-[44px] rounded-xl shrink-0 text-muted-foreground/60 hover:text-primary/80 hover:bg-white/[0.04]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder={pendingImage ? "Add a caption (optional)..." : "Message your mentor..."}
                    disabled={loading}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={2}
                    className="min-h-[56px] max-h-[160px] resize-none rounded-xl bg-white/[0.04] border-white/[0.08] hover:border-white/[0.12] focus:border-primary/30 pr-14 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70"
                  />
                  <span className={cn(
                    "absolute right-3 bottom-2 text-[9px] tabular-nums",
                    charWarning ? "text-warning/70" : "text-muted-foreground/60"
                  )}>
                    {charCount}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  size="icon"
                  disabled={loading || (!input.trim() && !pendingImage)}
                  className="h-[44px] w-[44px] rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
