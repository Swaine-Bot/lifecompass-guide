import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, Share2, Download, Trash2, Save, Edit3, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { useEnvironment } from '@/contexts/SensoryContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ds';
import { toast } from 'sonner';

interface ShareCardRow {
  id: string;
  card_type: string;
  title: string;
  subtitle: string | null;
  stat_value: string | null;
  stat_label: string | null;
  signature_phrase: string | null;
  theme: string;
  privacy_level: string;
  is_shared: boolean;
  is_archived: boolean;
  created_at: string | null;
  user_id: string;
}

export default function VaultCardDetail() {
  useEnvironment('vault');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openShareStudio } = useUniversalShare();

  const [card, setCard] = useState<ShareCardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Partial<ShareCardRow>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || !user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('share_cards')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error('Could not load this card');
        navigate('/vault');
        return;
      }
      setCard(data as ShareCardRow);
      setDraft(data as ShareCardRow);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    const { error } = await supabase
      .from('share_cards')
      .update({
        title: draft.title ?? card.title,
        subtitle: draft.subtitle ?? card.subtitle,
        stat_value: draft.stat_value ?? card.stat_value,
        stat_label: draft.stat_label ?? card.stat_label,
        signature_phrase: draft.signature_phrase ?? card.signature_phrase,
      })
      .eq('id', card.id);
    setSaving(false);
    if (error) {
      toast.error('Could not save changes');
      return;
    }
    setCard({ ...card, ...draft } as ShareCardRow);
    setEditing(false);
    toast.success('Changes saved');
  };

  const handleArchive = async () => {
    if (!card) return;
    const { error } = await supabase
      .from('share_cards')
      .update({ is_archived: true })
      .eq('id', card.id);
    if (error) {
      toast.error('Could not archive');
      return;
    }
    toast.success('Moved to archive');
    navigate('/vault');
  };

  const handleExport = () => {
    if (!card) return;
    const payload = {
      id: card.id,
      card_type: card.card_type,
      title: card.title,
      subtitle: card.subtitle,
      stat_value: card.stat_value,
      stat_label: card.stat_label,
      signature_phrase: card.signature_phrase,
      theme: card.theme,
      created_at: card.created_at,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifestack-card-${card.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Card exported');
  };

  if (loading || !card) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in mobile-text-safe">
      <PageHeader
        icon={Heart}
        title="Card Detail"
        back="/vault"
        subtitle={format(new Date(card.created_at || Date.now()), 'PPP')}
      />

      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70 font-medium">
            {card.card_type.replace(/_/g, ' ')}
          </p>
          <div className="flex items-center gap-1">
            {!editing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-8 px-2"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDraft(card); setEditing(false); }}
                  className="h-8 px-2"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8 px-2"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold leading-tight break-words whitespace-pre-wrap">
              {card.title}
            </h2>
            {card.subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                {card.subtitle}
              </p>
            )}
            {(card.stat_value || card.stat_label) && (
              <div className="pt-2 border-t border-white/5">
                {card.stat_value && (
                  <p className="text-3xl font-bold tracking-tight break-words">{card.stat_value}</p>
                )}
                {card.stat_label && (
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 break-words">
                    {card.stat_label}
                  </p>
                )}
              </div>
            )}
            {card.signature_phrase && (
              <p className="text-sm italic text-primary/80 pt-2 border-t border-white/5 break-words whitespace-pre-wrap">
                "{card.signature_phrase}"
              </p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                {card.theme}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                {card.privacy_level}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Title</label>
              <Input
                value={draft.title ?? ''}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtitle</label>
              <Textarea
                value={draft.subtitle ?? ''}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stat value</label>
                <Input
                  value={draft.stat_value ?? ''}
                  onChange={(e) => setDraft({ ...draft, stat_value: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stat label</label>
                <Input
                  value={draft.stat_label ?? ''}
                  onChange={(e) => setDraft({ ...draft, stat_label: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Signature phrase</label>
              <Input
                value={draft.signature_phrase ?? ''}
                onChange={(e) => setDraft({ ...draft, signature_phrase: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="default"
          onClick={() => openShareStudio({
            type: 'vault_insight',
            id: card.id,
            title: card.title,
            subtitle: card.subtitle || undefined,
            statValue: card.stat_value || undefined,
            statLabel: card.stat_label || undefined,
          })}
          className="min-h-[44px]"
        >
          <Share2 className="w-4 h-4 mr-1.5" /> Share
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          className="min-h-[44px]"
        >
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
        <Button
          variant="outline"
          onClick={handleArchive}
          className="min-h-[44px] text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1.5" /> Archive
        </Button>
      </div>
    </div>
  );
}
