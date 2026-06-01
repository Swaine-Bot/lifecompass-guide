/**
 * Global friend / user search.
 * Powered by the `search_profiles` RPC (trigram, privacy-aware).
 * Opens via the unified Sheet primitive; tapping a result navigates to /u/:userId.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserPlus, UserCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Result {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  life_phase: string | null;
  is_verified: boolean | null;
}

type RelStatus = 'none' | 'pending_out' | 'pending_in' | 'friends';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function UserSearchSheet({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [relations, setRelations] = useState<Record<string, RelStatus>>({});

  // Reset on close
  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_profiles' as any, { _query: q, _limit: 20 });
      if (!error && Array.isArray(data)) {
        setResults(data as Result[]);
        await loadRelations((data as Result[]).map(r => r.user_id));
      }
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadRelations = async (ids: string[]) => {
    if (!user || !ids.length) return;
    const { data } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, status')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    const map: Record<string, RelStatus> = {};
    for (const id of ids) map[id] = 'none';
    for (const f of (data || [])) {
      const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      if (!ids.includes(otherId)) continue;
      if (f.status === 'accepted') map[otherId] = 'friends';
      else if (f.status === 'pending') {
        map[otherId] = f.requester_id === user.id ? 'pending_out' : 'pending_in';
      }
    }
    setRelations(map);
  };

  const sendRequest = async (targetId: string) => {
    if (!user) return;
    setRelations(prev => ({ ...prev, [targetId]: 'pending_out' }));
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetId,
      status: 'pending',
    });
    if (error) {
      setRelations(prev => ({ ...prev, [targetId]: 'none' }));
      toast.error(error.code === '23505' ? 'Already requested' : 'Could not send request');
      return;
    }
    toast.success('Friend request sent');
  };

  const openProfile = (id: string) => {
    onOpenChange(false);
    navigate(`/u/${id}`);
  };

  const hasQuery = useMemo(() => query.trim().length >= 2, [query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[88dvh] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-white/5">
          <SheetTitle className="text-foreground">Find people</SheetTitle>
        </SheetHeader>
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or username…"
              className="pl-9 h-11 bg-background/40 border-white/10 text-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!hasQuery && (
            <p className="text-center text-sm text-muted-foreground px-6 py-12">
              Type at least 2 characters to search the LifeStack community.
            </p>
          )}
          {hasQuery && loading && (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          )}
          {hasQuery && !loading && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground px-6 py-12">No people found.</p>
          )}
          <ul className="space-y-1.5">
            {results.map(r => {
              const rel = relations[r.user_id] || 'none';
              return (
                <li key={r.user_id}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <button onClick={() => openProfile(r.user_id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <Avatar className="w-11 h-11 ring-1 ring-white/10">
                        <AvatarImage src={r.avatar_url || undefined} />
                        <AvatarFallback className="bg-secondary text-foreground">
                          {(r.name || r.username || '?').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">{r.name || r.username || 'Unknown'}</p>
                          {r.is_verified && <span className="text-[10px] text-primary">✓</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.username ? `@${r.username}` : ''}{r.username && r.life_phase ? ' · ' : ''}{r.life_phase || ''}
                        </p>
                      </div>
                    </button>
                    {rel === 'friends' && (
                      <span className="text-[11px] flex items-center gap-1 text-emerald-300/90">
                        <UserCheck className="w-3.5 h-3.5" /> Friends
                      </span>
                    )}
                    {rel === 'pending_out' && (
                      <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                    {rel === 'pending_in' && (
                      <Button size="sm" variant="cta" className="h-8 px-3" onClick={() => openProfile(r.user_id)}>
                        Respond
                      </Button>
                    )}
                    {rel === 'none' && (
                      <Button size="sm" variant="cta" className="h-8 px-3" onClick={() => sendRequest(r.user_id)}>
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
