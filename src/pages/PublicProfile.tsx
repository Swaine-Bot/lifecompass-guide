/**
 * Public profile — /u/:userId
 * Powered by `get_public_profile` RPC: profile + 5-pillar levels + public insights.
 * Respects per-user privacy_visibility.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShieldAlert, Share2, UserPlus, UserCheck, Loader2, Sparkles, Lock } from 'lucide-react';
import { PILLAR_META, PILLAR_ORDER, type Pillar } from '@/hooks/usePillarXP';
import { toast } from 'sonner';
import { useUniversalShare } from '@/hooks/useUniversalShare';

interface PublicProfileData {
  profile?: {
    user_id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    life_phase: string | null;
    account_type: string | null;
    page_category: string | null;
    website_url: string | null;
    is_verified: boolean | null;
  };
  pillars?: Record<string, { level: number; xp: number }>;
  public_insights?: Array<{ id: string; quote: string; context_tag: string | null; created_at: string }>;
  is_friend?: boolean;
  is_self?: boolean;
  error?: 'forbidden' | 'not_found';
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openShareStudio } = useUniversalShare();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const { data: rpcData, error } = await supabase.rpc('get_public_profile' as any, { _target: userId });
      if (error) {
        setData({ error: 'not_found' });
      } else {
        setData(rpcData as PublicProfileData);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const sendFriendRequest = async () => {
    if (!user || !userId) return;
    setSending(true);
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: userId,
      status: 'pending',
    });
    setSending(false);
    if (error) {
      toast.error(error.code === '23505' ? 'Already connected' : 'Could not send request');
      return;
    }
    toast.success('Friend request sent');
  };

  const shareProfile = () => {
    if (!data?.profile) return;
    openShareStudio({
      type: 'mentor_insight',
      title: data.profile.name || 'A LifeStack profile',
      quote: data.profile.bio || 'View this profile on LifeStack.',
      contextTag: data.profile.life_phase || 'LifeStack',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.error === 'not_found') {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Card variant="glass" className="p-8 text-center text-foreground">
          <p>Profile not found.</p>
        </Card>
      </div>
    );
  }

  if (data.error === 'forbidden') {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Card variant="glass" className="p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-foreground font-medium">This profile is private</p>
          <p className="text-sm text-muted-foreground">Only friends can view this profile. Send a friend request to connect.</p>
          <Button variant="cta" size="sm" onClick={sendFriendRequest} disabled={sending}>
            <UserPlus className="w-4 h-4 mr-1.5" /> Send Friend Request
          </Button>
        </Card>
      </div>
    );
  }

  const p = data.profile!;
  const initials = (p.name || p.username || '?').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-2 space-y-6 animate-fade-in text-foreground">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={shareProfile}>
          <Share2 className="w-4 h-4 mr-1.5" /> Share
        </Button>
      </div>

      {/* Identity header */}
      <Card variant="glass" className="overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        <CardContent className="-mt-12 px-5 pb-5 space-y-4">
          <div className="flex items-end gap-4">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={p.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-2xl font-semibold text-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pb-1.5">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground truncate">{p.name || 'Anonymous'}</h1>
                {p.is_verified && <span className="text-primary text-sm">✓</span>}
              </div>
              {p.username && <p className="text-sm text-muted-foreground">@{p.username}</p>}
              {p.life_phase && (
                <p className="text-[11px] uppercase tracking-wider text-primary/80 mt-1">{p.life_phase}</p>
              )}
            </div>
          </div>

          {p.bio && (
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{p.bio}</p>
          )}

          {!data.is_self && (
            <div className="flex gap-2 pt-1">
              {data.is_friend ? (
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <UserCheck className="w-4 h-4 mr-1.5" /> Friends
                </Button>
              ) : (
                <Button variant="cta" size="sm" className="flex-1" onClick={sendFriendRequest} disabled={sending}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Add Friend
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5 Pillar Levels */}
      <div className="space-y-2">
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground px-1">Life Levels</h2>
        <Card variant="glass">
          <CardContent className="p-4 grid grid-cols-5 gap-2">
            {PILLAR_ORDER.map(pillar => {
              const stats = data.pillars?.[pillar];
              const lvl = stats?.level ?? 1;
              const meta = PILLAR_META[pillar as Pillar];
              return (
                <div key={pillar} className="flex flex-col items-center gap-1.5 text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.tint} flex items-center justify-center text-xl shadow-inner ring-1 ring-white/10`}>
                    {meta.icon}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">Lv {lvl}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Public insights */}
      {(data.public_insights?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground px-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Public Insights
          </h2>
          <div className="space-y-2">
            {data.public_insights!.map(insight => (
              <Card key={insight.id} variant="glass">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm italic text-foreground/90 line-clamp-4 whitespace-pre-wrap">{insight.quote}</p>
                  {insight.context_tag && (
                    <p className="text-[10px] uppercase tracking-wider text-primary/80">{insight.context_tag}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(data.public_insights?.length ?? 0) === 0 && (
        <Card variant="glass" className="p-6 text-center">
          <Lock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No public insights yet.</p>
        </Card>
      )}
    </div>
  );
}
