import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, AlertTriangle, ExternalLink, MapPin, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocation } from '@/hooks/useLocation';
import { MAX_MESSAGE_LENGTH } from '@/lib/validation';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorMessage } from '@/components/mentor/MentorMessage';
import { useMentorConversations } from '@/hooks/useMentorConversations';
import { cn } from '@/lib/utils';

export default function Mentor() {
  const [input, setInput] = useState('');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    deleteConversation,
    selectConversation,
    startNewConversation,
  } = useMentorConversations();

  useEffect(() => {
    if (permission === 'while_using') {
      requestLocation();
    }
  }, [permission, requestLocation]);

  // Only auto-scroll when a new message is added (not on initial load of history)
  const prevMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    const userMessage = { role: 'user' as const, content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    await saveMessage(conversationId, 'user', trimmedInput);

    try {
      const response = await supabase.functions.invoke('mentor-chat', {
        body: { 
          messages: [...messages, userMessage],
          profile: profile 
        }
      });

      if (response.error) throw response.error;

      const assistantContent = response.data?.message || "I'm here to help you navigate your journey. What's on your mind?";
      const assistantMessage = { role: 'assistant' as const, content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(conversationId, 'assistant', assistantContent);
    } catch (error) {
      const errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => [...prev, { role: 'assistant' as const, content: errorMessage }]);
      await saveMessage(conversationId, 'assistant', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enter now creates a new line (default textarea behavior)
  // No special key handler needed

  const professionalLinks = [
    { label: 'Find a Therapist', query: 'therapist near me' },
    { label: 'Find a Doctor', query: 'doctor near me' },
    { label: 'Financial Advisor', query: 'financial advisor near me' },
    { label: 'Career Counselor', query: 'career counselor near me' },
  ];

  return (
    <div className="fixed inset-0 bottom-16 lg:bottom-0 lg:left-64 flex flex-col bg-background z-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-lg font-bold">AI Mentor</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => setDisclaimerOpen(!disclaimerOpen)}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Disclaimer</span>
          </Button>
          <Button
            variant={sidebarOpen ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
        </div>
      </div>

      {/* Disclaimer collapsible */}
      <Collapsible open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <CollapsibleContent>
          <div className="px-4 py-3 bg-warning/5 border-b border-warning/20">
            <div className="flex gap-2 items-start max-w-2xl mx-auto">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="text-muted-foreground mb-2">
                  This AI mentor provides general guidance only. For medical, mental health, financial, or legal matters, consult qualified professionals.
                </p>
                <div className="flex flex-wrap gap-2">
                  {professionalLinks.map((link) => (
                    <a
                      key={link.query}
                      href={getMapsSearchUrl(link.query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.label}
                    </a>
                  ))}
                </div>
                {latitude && longitude && (
                  <p className="text-muted-foreground mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Using your location
                  </p>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Chat history sidebar - slides over on mobile, side panel on desktop */}
        <div className={cn(
          "absolute lg:relative inset-y-0 left-0 z-20 transition-transform duration-200 ease-in-out",
          "w-72 bg-card border-r border-border/30",
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

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat messages */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div 
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">Hello, {profile?.name || 'there'}</h3>
                  <p className="text-muted-foreground max-w-md text-sm">
                    I'm your AI mentor. Ask me about your goals, habits, or any challenge you're facing.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MentorMessage key={i} role={msg.role} content={msg.content} />
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="chat-bubble-assistant">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border/30 bg-card/60 backdrop-blur-sm shrink-0">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder="Message your mentor..."
                    disabled={loading}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={2}
                    className="min-h-[60px] max-h-[160px] resize-none rounded-xl bg-secondary/50 border-border/50 pr-14 py-3 text-sm leading-relaxed"
                  />
                  <span className="absolute right-3 bottom-2 text-[10px] text-muted-foreground/50">
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  size="icon"
                  disabled={loading || !input.trim()}
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
