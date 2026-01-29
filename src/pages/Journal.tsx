import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PenLine, Image, Video, Mic, MicOff, Send, X, Loader2,
  Bot, Lightbulb, AlertTriangle, ExternalLink, ChevronUp, ChevronDown,
  Camera, Play, Pause, Calendar, Sun, Moon, Cloud, Zap, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OpportunitySuggestion {
  category: string;
  title: string;
  description: string;
  searchQuery: string;
}

interface JournalAnalysis {
  approved: boolean;
  mentorComment: string;
  opportunities: OpportunitySuggestion[];
  nudge?: string;
  flagReason?: string;
}

interface JournalEntry {
  id: string;
  content: string | null;
  mood: number | null;
  energy: number | null;
  gratitude: string | null;
  reflection: string | null;
  date: string;
  created_at: string;
  media_urls?: string[];
  mentor_feedback?: string;
}

const moodOptions = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 3, emoji: '😐', label: 'Low' },
  { value: 5, emoji: '🙂', label: 'Okay' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 9, emoji: '🔥', label: 'Great' },
];

const energyOptions = [
  { value: 1, icon: Moon, label: 'Drained' },
  { value: 3, icon: Cloud, label: 'Low' },
  { value: 5, icon: Sun, label: 'Steady' },
  { value: 7, icon: Sparkles, label: 'Energized' },
  { value: 9, icon: Zap, label: 'Electric' },
];

// File upload validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'
];

export default function Journal() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchTodayEntry();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);
    
    if (data) {
      setEntries(data);
    }
  };

  const fetchTodayEntry = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('date', today)
      .maybeSingle();
    
    if (data) {
      setContent(data.content || '');
      setGratitude(data.gratitude || '');
      setReflection(data.reflection || '');
      setSelectedMood(data.mood);
      setSelectedEnergy(data.energy);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File "${file.name}" exceeds 10MB limit` };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: `File "${file.name}" has unsupported format` };
    }
    return { valid: true };
  };

  const uploadMedia = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    if (files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return [];
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error('Total file size exceeds 50MB limit');
      return [];
    }

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return [];
      }
    }
    
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `${user!.id}/journal/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error, data } = await supabase.storage
        .from('user-media')
        .upload(fileName, file);

      if (!error && data) {
        const { data: urlData } = await supabase.storage
          .from('user-media')
          .createSignedUrl(data.path, 3600);
        
        if (urlData) {
          urls.push(urlData.signedUrl);
        }
      } else if (error) {
        toast.error(`Failed to upload: ${file.name}`);
        console.error('Upload error:', error);
      }
    }
    
    return urls;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const analyzeJournalContent = async (
    textContent: string, 
    mediaUrls: string[]
  ): Promise<JournalAnalysis | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Not authenticated');

      // Fetch user's goals for context
      const { data: goals } = await supabase
        .from('goals')
        .select('title, category, status')
        .eq('status', 'active')
        .limit(5);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-journal-entry`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            content: textContent,
            mediaUrls,
            mood: selectedMood,
            energy: selectedEnergy,
            gratitude,
            reflection,
            goals: goals || [],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('AI analysis rate limited. Please try again in a moment.');
          return null;
        }
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Journal analysis error:', error);
      return {
        approved: true,
        mentorComment: '',
        opportunities: []
      };
    }
  };

  const saveEntry = async () => {
    if (!user) return;
    if (!content && !gratitude && !reflection && selectedMood === null && selectedEnergy === null && selectedFiles.length === 0 && !audioBlob) {
      toast.error('Please add some content to your journal entry');
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);

    try {
      // Upload media files
      let mediaUrls: string[] = [];
      const filesToUpload = [...selectedFiles];
      
      // Add audio recording as a file
      if (audioBlob) {
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        filesToUpload.push(audioFile);
      }

      if (filesToUpload.length > 0) {
        mediaUrls = await uploadMedia(filesToUpload);
        if (mediaUrls.length === 0 && filesToUpload.length > 0) {
          setLoading(false);
          setIsAnalyzing(false);
          return;
        }
      }

      // Combine all text content for analysis
      const fullContent = [
        content,
        gratitude && `Gratitude: ${gratitude}`,
        reflection && `Reflection: ${reflection}`
      ].filter(Boolean).join('\n\n');

      // Analyze content with AI
      const analysisResult = await analyzeJournalContent(fullContent, mediaUrls);
      setIsAnalyzing(false);

      if (analysisResult) {
        if (!analysisResult.approved) {
          setAnalysis(analysisResult);
          setShowFeedback(true);
          setLoading(false);
          return;
        }
        setAnalysis(analysisResult);
        setShowFeedback(true);
      }

      // Check for existing entry today
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('date', today)
        .maybeSingle();

      const entryData = {
        content: content || null,
        gratitude: gratitude || null,
        reflection: reflection || null,
        mood: selectedMood,
        energy: selectedEnergy,
        date: today,
        tags: mediaUrls.length > 0 ? mediaUrls : null, // Store media URLs in tags for now
      };

      if (existing) {
        await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('journal_entries')
          .insert({ ...entryData, user_id: user.id });
      }

      toast.success('Journal entry saved!');
      setSelectedFiles([]);
      setAudioBlob(null);
      setAudioUrl(null);
      fetchEntries();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <PenLine className="w-6 h-6 text-primary" />
            Journal
          </h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* AI Feedback Section - Collapsible */}
      {analysis && showFeedback && (
        <Collapsible open={feedbackExpanded} onOpenChange={setFeedbackExpanded}>
          <Card variant="glass" className={cn(
            "overflow-hidden border-l-4",
            analysis.approved ? "border-l-primary" : "border-l-destructive"
          )}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">AI Mentor Feedback</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    {feedbackExpanded ? (
                      <>Hide <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Show <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-4">
                {!analysis.approved && analysis.flagReason && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{analysis.flagReason}</AlertDescription>
                  </Alert>
                )}
                
                {analysis.mentorComment && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-primary mb-1">Your mentor says:</p>
                        <p className="text-sm">{analysis.mentorComment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {analysis.nudge && (
                  <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Daily Nudge</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.nudge}</p>
                  </div>
                )}
                
                {analysis.opportunities && analysis.opportunities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Opportunities Spotted
                    </h4>
                    {analysis.opportunities.map((opp, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{opp.title}</span>
                          <Badge variant="secondary" className="text-xs">{opp.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{opp.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/search?q=${encodeURIComponent(opp.searchQuery)}`,
                              '_blank'
                            );
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Find {opp.category} Near You
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      )}

      {/* Main Journal Entry Card */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood & Energy Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mood</label>
              <div className="flex justify-between">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedMood(option.value)}
                    className={cn(
                      "mood-option text-xl",
                      selectedMood === option.value && "selected"
                    )}
                    title={option.label}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Energy</label>
              <div className="flex justify-between">
                {energyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedEnergy(option.value)}
                    className={cn(
                      "mood-option",
                      selectedEnergy === option.value && "selected"
                    )}
                    title={option.label}
                  >
                    <option.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Text Area */}
          <div>
            <label className="text-sm font-medium mb-2 block">What's on your mind?</label>
            <Textarea
              placeholder="Write about your day, thoughts, or anything you want to reflect on..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Gratitude */}
          <div>
            <label className="text-sm font-medium mb-2 block">🙏 Gratitude</label>
            <Textarea
              placeholder="What are you grateful for today?"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Reflection */}
          <div>
            <label className="text-sm font-medium mb-2 block">💭 Reflection</label>
            <Textarea
              placeholder="Any insights or lessons learned?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Media Previews */}
          {(selectedFiles.length > 0 || audioUrl) && (
            <div className="flex gap-2 flex-wrap">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              
              {audioUrl && (
                <div className="relative flex items-center gap-2 bg-muted rounded-lg p-2">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={playAudio}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground">Voice Recording</span>
                  <button
                    onClick={clearRecording}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Media Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Add photo"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                title="Add video"
              >
                <Video className="w-5 h-5" />
              </Button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'video')}
              />

              <Button
                variant={isRecording ? "destructive" : "ghost"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? "Stop recording" : "Start voice recording"}
                disabled={!!audioUrl}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </div>

            <Button 
              variant="gold" 
              onClick={saveEntry} 
              disabled={loading || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.slice(0, 5).map((entry) => (
              <div 
                key={entry.id} 
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {format(new Date(entry.date), 'EEEE, MMMM d')}
                  </span>
                  <div className="flex items-center gap-2">
                    {entry.mood && (
                      <span className="text-lg">
                        {moodOptions.find(m => m.value === entry.mood)?.emoji}
                      </span>
                    )}
                    {entry.energy && (
                      <span className="text-xs text-muted-foreground">
                        Energy: {energyOptions.find(e => e.value === entry.energy)?.label}
                      </span>
                    )}
                  </div>
                </div>
                {entry.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.content}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
