import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2, AlertTriangle, ExternalLink, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocation } from '@/hooks/useLocation';
import { MAX_MESSAGE_LENGTH } from '@/lib/validation';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorMessage } from '@/components/mentor/MentorMessage';
import { useMentorConversations } from '@/hooks/useMentorConversations';

export default function Mentor() {
  const [input, setInput] = useState('');
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  // Request location when page loads if permission allows
  useEffect(() => {
    if (permission === 'while_using') {
      requestLocation();
    }
  }, [permission, requestLocation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    
    // Validate message length
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    // Create conversation if needed
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    const userMessage = { role: 'user' as const, content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Save user message
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
      
      // Save assistant message
      await saveMessage(conversationId, 'assistant', assistantContent);
    } catch (error) {
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

  return (
    <div className="flex h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)] -mx-4 lg:-mx-0">
      {/* Sidebar */}
      <MentorSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 px-4 lg:px-0">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Mentor
          </h1>
          <p className="text-muted-foreground">Your calm, pragmatic guide</p>
        </div>

        {/* Disclaimer */}
        <Collapsible open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
          <Card className="mb-4 p-3 bg-warning/10 border-warning/30">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-warning">Important Disclaimer</p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                      {disclaimerOpen ? (
                        <>Hide <ChevronUp className="w-3 h-3 ml-1" /></>
                      ) : (
                        <>Show <ChevronDown className="w-3 h-3 ml-1" /></>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <p className="text-muted-foreground text-xs mb-2 mt-1">
                    This AI mentor provides general guidance only and does not constitute professional advice. 
                    For medical, mental health, financial, or legal matters, please consult qualified professionals.
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
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Using your location for nearby results
                    </p>
                  )}
                  {permission === 'never' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Enable location in Settings for personalized nearby results
                    </p>
                  )}
                </CollapsibleContent>
              </div>
            </div>
          </Card>
        </Collapsible>

        {/* Chat Area */}
        <Card variant="glass" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">Hello, {profile?.name || 'there'}</h3>
                <p className="text-muted-foreground max-w-md">
                  I'm your AI mentor. Ask me about your goals, habits, or any challenge you're facing. 
                  I'll provide calm, direct guidance tailored to your life phase.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MentorMessage key={i} role={msg.role} content={msg.content} />
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="chat-bubble-assistant">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  placeholder="Ask your mentor..."
                  disabled={loading}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <Button type="submit" variant="gold" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
