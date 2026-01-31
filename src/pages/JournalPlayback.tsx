import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Mic, Video, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  content: string | null;
  mood: number | null;
  energy: number | null;
  gratitude: string | null;
  reflection: string | null;
  date: string;
  created_at: string;
  scheduled_playback_at: string | null;
  tags: unknown; // JSON type from database
}

const moodOptions = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 3, emoji: '😐', label: 'Low' },
  { value: 5, emoji: '🙂', label: 'Okay' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 9, emoji: '🔥', label: 'Great' },
];

export default function JournalPlayback() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (user && entryId) {
      fetchEntry();
    }
  }, [user, entryId]);

  const fetchEntry = async () => {
    if (!entryId) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error || !data) {
      console.error('Error fetching entry:', error);
      setLoading(false);
      return;
    }

    setEntry(data);

    // Generate signed URLs for media
    const tags = data.tags as string[] | null;
    if (tags && tags.length > 0) {
      const signedUrls: string[] = [];
      
      for (const path of tags) {
        try {
          // Handle both paths and legacy URLs
          if (path.startsWith('http')) {
            const pathMatch = path.match(/user-media\/([^?]+)/);
            if (pathMatch) {
              const filePath = decodeURIComponent(pathMatch[1]);
              const { data: urlData } = await supabase.storage
                .from('user-media')
                .createSignedUrl(filePath, 3600);
              if (urlData) signedUrls.push(urlData.signedUrl);
            }
          } else {
            const { data: urlData } = await supabase.storage
              .from('user-media')
              .createSignedUrl(path, 3600);
            if (urlData) signedUrls.push(urlData.signedUrl);
          }
        } catch (e) {
          console.error('Error creating signed URL:', e);
        }
      }
      
      setMediaUrls(signedUrls);
      
      // Autoplay after a short delay
      setTimeout(() => {
        if (signedUrls.length > 0) {
          const firstUrl = signedUrls[0].toLowerCase();
          if (firstUrl.includes('.webm') || firstUrl.includes('.mp3') || firstUrl.includes('.wav') || firstUrl.includes('audio')) {
            audioRef.current?.play();
            setIsPlaying(true);
          } else if (firstUrl.includes('.mp4') || firstUrl.includes('.mov') || firstUrl.includes('video')) {
            videoRef.current?.play();
            setIsPlaying(true);
          }
        }
      }, 500);
    }

    setLoading(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current?.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const getMediaType = (url: string): 'audio' | 'video' | 'image' => {
    const lower = url.toLowerCase();
    if (lower.includes('.webm') || lower.includes('.mp3') || lower.includes('.wav') || lower.includes('.ogg') || lower.includes('audio')) {
      return 'audio';
    }
    if (lower.includes('.mp4') || lower.includes('.mov') || lower.includes('video')) {
      return 'video';
    }
    return 'image';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/journal')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Entry not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const entryDate = new Date(entry.created_at);
  const playbackDate = entry.scheduled_playback_at ? new Date(entry.scheduled_playback_at) : null;
  const daysSince = Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-6 space-y-6 pb-20 md:pb-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/journal')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Journal
      </Button>

      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Message from {daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Recorded on {format(entryDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Mood badge */}
          {entry.mood && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {moodOptions.find(m => m.value === entry.mood)?.emoji}
              </span>
              <span className="text-sm text-muted-foreground">
                You were feeling {moodOptions.find(m => m.value === entry.mood)?.label.toLowerCase()}
              </span>
            </div>
          )}

          {/* Media playback */}
          {mediaUrls.length > 0 && (
            <div className="space-y-4">
              {mediaUrls.map((url, idx) => {
                const mediaType = getMediaType(url);
                
                if (mediaType === 'video') {
                  return (
                    <div key={idx} className="relative rounded-xl overflow-hidden bg-black">
                      <video
                        ref={idx === 0 ? videoRef : undefined}
                        src={url}
                        controls
                        className="w-full max-h-[60vh] mx-auto"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                      />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1">
                        <Video className="w-4 h-4 text-white" />
                        <span className="text-xs text-white">Video from past you</span>
                      </div>
                    </div>
                  );
                }
                
                if (mediaType === 'audio') {
                  return (
                    <div key={idx} className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                          <Mic className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Voice message from your past self</p>
                        <audio
                          ref={idx === 0 ? audioRef : undefined}
                          src={url}
                          controls
                          className="w-full max-w-md"
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                        />
                      </div>
                    </div>
                  );
                }
                
                // Image
                return (
                  <img
                    key={idx}
                    src={url}
                    alt="Journal media"
                    className="w-full rounded-xl"
                  />
                );
              })}
            </div>
          )}

          {/* Text content */}
          {entry.content && (
            <div className="space-y-2">
              <h3 className="font-medium">Your words</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
            </div>
          )}

          {entry.gratitude && (
            <div className="space-y-2 p-4 bg-primary/5 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">🙏 Gratitude</h3>
              <p className="text-muted-foreground">{entry.gratitude}</p>
            </div>
          )}

          {entry.reflection && (
            <div className="space-y-2 p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">💭 Reflection</h3>
              <p className="text-muted-foreground">{entry.reflection}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
