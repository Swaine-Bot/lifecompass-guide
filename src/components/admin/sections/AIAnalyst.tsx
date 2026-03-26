import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import {
  Brain,
  Send,
  RotateCcw,
  Copy,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Users,
  Target,
  Activity,
  AlertTriangle,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Retention analysis', prompt: 'Analyze 30-day user retention. What predicts whether a user stays active?' },
  { icon: Users, label: 'Churn risk', prompt: 'Which user behaviors are the strongest indicators of likely churn? Identify at-risk segments.' },
  { icon: Target, label: 'Goal intelligence', prompt: 'Analyze goal completion rates by category. Which goal types have the highest and lowest success rates?' },
  { icon: MessageSquare, label: 'Mentor engagement', prompt: 'Analyze mentor engagement patterns. How does mentor usage correlate with retention and feature adoption?' },
  { icon: Activity, label: 'Feature adoption', prompt: 'Which features have the strongest adoption? Where are the biggest drop-off points in the user journey?' },
  { icon: AlertTriangle, label: 'Anomaly detection', prompt: 'Detect any anomalies or unusual patterns in recent platform activity compared to historical trends.' },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analyst`;

async function getSessionToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const streamChat = async (allMessages: Message[]) => {
    setIsStreaming(true);
    let assistantContent = '';

    try {
      const token = await getSessionToken();
      if (!token) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to use the AI Analyst.',
          variant: 'destructive',
        });
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        const status = resp.status;

        if (status === 401) {
          throw new Error('Session expired. Please refresh the page and sign in again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to use the AI Analyst. Admin role required.');
        } else if (status === 429) {
          throw new Error('Rate limit reached. Please wait a moment and try again.');
        } else if (status === 402) {
          throw new Error('AI credits exhausted. Please try again later.');
        }
        throw new Error(errData.error || `Analysis failed (${status})`);
      }

      if (!resp.body) throw new Error('No response stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      toast({
        title: 'Analysis failed',
        description: err.message,
        variant: 'destructive',
      });
      // Remove empty assistant message if error
      if (!assistantContent) {
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;

    const userMsg: Message = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await streamChat(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string) => {
    const { copyText } = await import('@/services/share/nativeClipboardAdapter');
    await copyText(content);
    toast({ title: 'Copied to clipboard' });
  };

  const handleNewThread = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="AI Analyst"
        description="Privacy-first conversational intelligence for platform analysis, predictions, and strategic recommendations."
        icon={Brain}
      />

      <div className="flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>
        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm min-h-0">
          {messages.length === 0 ? (
            /* Empty state with quick prompts */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Platform Intelligence</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask questions about user behavior, retention, engagement, predictions, or strategic recommendations. All analysis is privacy-first and aggregated.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qp.prompt)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 text-left transition-all group"
                    >
                      <qp.icon className="h-4 w-4 mt-0.5 text-primary/70 group-hover:text-primary shrink-0" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground leading-snug">
                        {qp.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message thread - use native scrolling */
            <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={scrollContainerRef}>
              <div className="space-y-6 max-w-3xl mx-auto pb-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 max-w-[85%] overflow-hidden',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 text-foreground'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="space-y-2">
                          {msg.content ? (
                            <div className="prose prose-sm prose-invert max-w-none break-words [&_table]:text-xs [&_th]:px-2 [&_td]:px-2 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-sm [&_li]:text-sm [&_strong]:text-foreground [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-all [&_table]:overflow-x-auto [&_table]:block">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 py-1">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                                <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
                                <span className="w-2 h-2 rounded-full bg-primary/20 animate-pulse [animation-delay:300ms]" />
                              </div>
                              <span className="text-xs text-muted-foreground">Analyzing platform data…</span>
                            </div>
                          )}
                          {msg.content && !isStreaming && (
                            <div className="flex gap-2 pt-2 border-t border-border/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopy(msg.content)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border/40 p-3 sm:p-4 shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={handleNewThread}
                  title="New thread"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about retention, churn, engagement, predictions…"
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/40 bg-secondary/30 px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  disabled={isStreaming}
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-lg"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              All analysis is privacy-first · Aggregated data only · No individual user exposure
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}