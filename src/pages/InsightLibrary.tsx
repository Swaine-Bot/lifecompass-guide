import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Lightbulb, Share2, Trash2, StickyNote, X, Search, Star,
  Copy, MessageCircle, Pencil, Check, ArrowDownUp, BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { engagementEventService } from '@/services/engagementEventService';
import { useEnvironment } from '@/contexts/SensoryContext';
import { PageHeader } from '@/components/ds';
import { cn } from '@/lib/utils';

interface SavedInsight {
  id: string;
  quote: string;
  context_tag: string | null;
  personal_note: string | null;
  created_at: string;
  updated_at?: string | null;
  is_favorite?: boolean | null;
  source_conversation_id?: string | null;
}

type SortMode = 'newest' | 'oldest' | 'favorites';

const WORDS_PER_MIN = 220;
const readingTime = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MIN));
};

export default function InsightLibrary() {
  useEnvironment('insights');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openShareStudio } = useUniversalShare();
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState(false);
  const [draftQuote, setDraftQuote] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState('');

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('saved_insights')
      .select('*')
      .order('created_at', { ascending: false });
    setInsights(((data as SavedInsight[]) || []));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const open = useMemo(
    () => insights.find(i => i.id === openId) || null,
    [insights, openId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = insights;
    if (q) {
      list = list.filter(i =>
        (i.quote || '').toLowerCase().includes(q) ||
        (i.personal_note || '').toLowerCase().includes(q) ||
        (i.context_tag || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === 'oldest') sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else if (sort === 'favorites') sorted.sort((a, b) => Number(!!b.is_favorite) - Number(!!a.is_favorite));
    else sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted;
  }, [insights, query, sort]);

  const deleteInsight = async (id: string) => {
    await supabase.from('saved_insights').delete().eq('id', id);
    setInsights(prev => prev.filter(i => i.id !== id));
    setOpenId(null);
    toast.success('Insight removed');
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    const next = !current;
    setInsights(prev => prev.map(i => i.id === id ? { ...i, is_favorite: next } : i));
    const { error } = await supabase.from('saved_insights').update({ is_favorite: next }).eq('id', id);
    if (error) {
      // revert
      setInsights(prev => prev.map(i => i.id === id ? { ...i, is_favorite: current } : i));
      toast.error('Could not update favorite');
    }
  };

  const saveQuote = async (id: string) => {
    const text = draftQuote.trim();
    if (!text) { toast.error('Insight cannot be empty'); return; }
    const { error } = await supabase
      .from('saved_insights')
      .update({ quote: text })
      .eq('id', id);
    if (error) { toast.error('Save failed'); return; }
    setInsights(prev => prev.map(i => i.id === id ? { ...i, quote: text } : i));
    setEditingQuote(false);
    toast.success('Insight updated');
  };

  const saveNote = async (id: string) => {
    const note = draftNote.trim() || null;
    const { error } = await supabase
      .from('saved_insights')
      .update({ personal_note: note })
      .eq('id', id);
    if (error) { toast.error('Save failed'); return; }
    setInsights(prev => prev.map(i => i.id === id ? { ...i, personal_note: note } : i));
    setEditingNote(false);
    toast.success('Note saved');
  };

  const copyInsight = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const shareInsight = (insight: SavedInsight) => {
    const words = insight.quote.split(/\s+/);
    const preview = words.length <= 20 ? insight.quote : words.slice(0, 20).join(' ') + '…';
    openShareStudio({
      type: 'mentor_insight',
      id: insight.id,
      title: 'Mentor Insight',
      quote: preview,
      contextTag: insight.context_tag || 'Life Strategy',
    });
    engagementEventService.log('insight_shared', 'broadcast', { insight_id: insight.id });
  };

  const askMentor = (insight: SavedInsight) => {
    setOpenId(null);
    navigate('/mentor', {
      state: {
        actionPlanRequest: {
          prompt: `I want to revisit this insight and go deeper:\n\n"${insight.quote}"\n\nHelp me understand it more clearly and turn it into action.`,
          goalContext: {
            title: 'Saved Insight',
            why: insight.context_tag || 'Life Strategy',
            notes: insight.personal_note || undefined,
            content: insight.quote,
          },
        },
      },
    });
  };

  const openDetail = (insight: SavedInsight) => {
    setOpenId(insight.id);
    setEditingQuote(false);
    setEditingNote(false);
    setDraftQuote(insight.quote);
    setDraftNote(insight.personal_note || '');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-24">
      <PageHeader
        icon={Lightbulb}
        title="Insight Library"
        back="/library"
        subtitle={`${insights.length} saved insight${insights.length !== 1 ? 's' : ''}`}
        compact
      />

      {/* Search + sort */}
      {!loading && insights.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search insights, notes, tags…"
              className="pl-9 h-10 bg-background/40 border-white/10"
              aria-label="Search insights"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 border-white/10 bg-background/40 shrink-0"
            onClick={() =>
              setSort(s => (s === 'newest' ? 'oldest' : s === 'oldest' ? 'favorites' : 'newest'))
            }
            aria-label={`Sort: ${sort}`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span className="text-xs capitalize">{sort}</span>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} variant="glass" className="animate-pulse h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
          <p className="text-muted-foreground">
            {insights.length === 0 ? 'No saved insights yet.' : 'No insights match your search.'}
          </p>
          {insights.length === 0 && (
            <>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Save meaningful moments from your AI Mentor conversations.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/mentor')}>
                Go to Mentor
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(insight => {
            const minutes = readingTime(insight.quote);
            return (
              <Card
                key={insight.id}
                variant="glass"
                role="button"
                tabIndex={0}
                onClick={() => openDetail(insight)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetail(insight);
                  }
                }}
                className="cursor-pointer transition hover:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Excerpt with fade-out */}
                    <div className="relative flex-1 min-w-0">
                      <blockquote
                        className="text-sm font-medium leading-relaxed italic whitespace-pre-wrap break-words line-clamp-4"
                      >
                        {insight.quote}
                      </blockquote>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <AiContentLabel label="AI Insight" variant="chip" />
                      {insight.context_tag && (
                        <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[140px] truncate">
                          {insight.context_tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {insight.personal_note && (
                    <p className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2 line-clamp-2">
                      <StickyNote className="w-3 h-3 inline mr-1" />
                      {insight.personal_note}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span>{format(new Date(insight.created_at), 'MMM d, yyyy')}</span>
                      <span aria-hidden>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {minutes} min read
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={insight.is_favorite ? 'Remove favorite' : 'Mark favorite'}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(insight.id, !!insight.is_favorite); }}
                      className="p-1 rounded-md hover:bg-white/5 transition"
                    >
                      <Star
                        className={cn(
                          'w-4 h-4',
                          insight.is_favorite ? 'text-primary fill-primary' : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!open} onOpenChange={(v) => { if (!v) setOpenId(null); }}>
        <SheetContent
          side="bottom"
          className="h-[92dvh] p-0 border-t border-white/10 bg-background/95 backdrop-blur-2xl flex flex-col"
        >
          {open && (
            <>
              {/* Header */}
              <div
                className="px-5 pt-4 pb-3 border-b border-white/5 flex items-start gap-3"
                style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AiContentLabel label="AI Insight" variant="chip" />
                    {open.context_tag && (
                      <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {open.context_tag}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{format(new Date(open.created_at), 'MMM d, yyyy')}</span>
                    <span aria-hidden>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {readingTime(open.quote)} min read
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={open.is_favorite ? 'Remove favorite' : 'Mark favorite'}
                  onClick={() => toggleFavorite(open.id, !!open.is_favorite)}
                  className="p-2 rounded-md hover:bg-white/5"
                >
                  <Star
                    className={cn(
                      'w-5 h-5',
                      open.is_favorite ? 'text-primary fill-primary' : 'text-muted-foreground'
                    )}
                  />
                </button>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpenId(null)}
                  className="p-2 rounded-md hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain px-5 py-5"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {editingQuote ? (
                  <div className="space-y-2">
                    <Textarea
                      value={draftQuote}
                      onChange={e => setDraftQuote(e.target.value)}
                      rows={14}
                      className="text-sm leading-relaxed"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="gold" onClick={() => saveQuote(open.id)}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingQuote(false); setDraftQuote(open.quote); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <article
                    className={cn(
                      'max-w-none text-[15px] text-foreground/90 break-words',
                      '[&_p]:my-3 [&_p]:leading-relaxed',
                      '[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-5 [&_h1]:mb-2',
                      '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2',
                      '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2',
                      '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3',
                      '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3',
                      '[&_li]:my-1',
                      '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-foreground/80 [&_blockquote]:my-3',
                      '[&_strong]:text-foreground [&_strong]:font-semibold',
                      '[&_em]:italic',
                      '[&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]',
                      '[&_a]:text-primary [&_a]:underline'
                    )}
                    style={{ wordBreak: 'break-word' }}
                  >
                    <ReactMarkdown>{open.quote}</ReactMarkdown>
                  </article>
                )}

                {/* Personal note section */}
                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5" /> My Note
                    </h3>
                    {!editingNote && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => { setEditingNote(true); setDraftNote(open.personal_note || ''); }}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        {open.personal_note ? 'Edit' : 'Add'}
                      </Button>
                    )}
                  </div>
                  {editingNote ? (
                    <div className="space-y-2">
                      <Textarea
                        value={draftNote}
                        onChange={e => setDraftNote(e.target.value)}
                        rows={4}
                        placeholder="A reflection, context, or follow-up thought…"
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="gold" onClick={() => saveNote(open.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingNote(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : open.personal_note ? (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                      {open.personal_note}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No note yet.</p>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div
                className="border-t border-white/5 px-3 py-3 flex items-center gap-1.5 overflow-x-auto bg-background/60 backdrop-blur-xl"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
              >
                <Button
                  variant="gold"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => askMentor(open)}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Ask Mentor About This
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => { setEditingQuote(true); setDraftQuote(open.quote); }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => copyInsight(open.quote)}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => shareInsight(open)}
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => deleteInsight(open.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
