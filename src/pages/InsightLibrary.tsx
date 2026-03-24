import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Lightbulb, Share2, Trash2, StickyNote, X } from 'lucide-react';
import { AiContentLabel } from '@/components/moderation/AiContentLabel';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { engagementEventService } from '@/services/engagementEventService';
import { useEnvironment } from '@/contexts/SensoryContext';

interface SavedInsight {
  id: string;
  quote: string;
  context_tag: string;
  personal_note: string | null;
  created_at: string;
}

export default function InsightLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openShareStudio } = useUniversalShare();
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchInsights();
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('saved_insights')
      .select('*')
      .order('created_at', { ascending: false });
    setInsights((data as SavedInsight[]) || []);
    setLoading(false);
  };

  const deleteInsight = async (id: string) => {
    await supabase.from('saved_insights').delete().eq('id', id);
    setInsights(prev => prev.filter(i => i.id !== id));
    toast.success('Insight removed');
  };

  const saveNote = async (id: string) => {
    await supabase
      .from('saved_insights')
      .update({ personal_note: noteText || null })
      .eq('id', id);
    setInsights(prev => prev.map(i => i.id === id ? { ...i, personal_note: noteText || null } : i));
    setEditingNote(null);
    toast.success('Note saved');
  };

  const shareInsight = (insight: SavedInsight) => {
    openShareStudio({
      type: 'mentor_insight',
      id: insight.id,
      title: 'Mentor Insight',
      quote: insight.quote,
      contextTag: insight.context_tag,
    });
    engagementEventService.log('insight_shared', 'broadcast', { insight_id: insight.id });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-bold">Insight Library</h1>
          <p className="text-muted-foreground text-sm">{insights.length} saved insight{insights.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} variant="glass" className="animate-pulse h-28" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No saved insights yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Save meaningful moments from your AI Mentor conversations.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/mentor')}>
            Go to Mentor
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => (
            <Card key={insight.id} variant="glass">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <blockquote className="text-sm font-medium leading-relaxed flex-1 italic">
                    "{insight.quote}"
                  </blockquote>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AiContentLabel label="AI Insight" variant="chip" />
                    <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {insight.context_tag}
                    </span>
                  </div>
                </div>

                {insight.personal_note && editingNote !== insight.id && (
                  <p className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
                    <StickyNote className="w-3 h-3 inline mr-1" />
                    {insight.personal_note}
                  </p>
                )}

                {editingNote === insight.id && (
                  <div className="space-y-2">
                    <Textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a personal reflection..."
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="gold" onClick={() => saveNote(insight.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(insight.created_at), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingNote(insight.id);
                        setNoteText(insight.personal_note || '');
                      }}
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => shareInsight(insight)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteInsight(insight.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
