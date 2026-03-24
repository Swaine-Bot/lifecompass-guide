import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PenLine, Image, Video, Mic, MicOff, Send, X, Loader2,
  Bot, Lightbulb, AlertTriangle, ExternalLink, ChevronUp, ChevronDown,
  Camera, Play, Pause, Calendar, Sun, Moon, Cloud, Zap, Sparkles,
  Edit, Trash2, MoreVertical, Clock, Bell, CalendarClock, Mail, Eye, History, Share2
} from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/contexts/SensoryContext';
import { choreographedDispatch } from '@/engines/choreographyEngine';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
  mentor_feedback?: JournalAnalysis | null;
  scheduled_playback_at?: string | null;
  playback_reminder_sent?: boolean | null;
  tags?: unknown;
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
  useEnvironment('journal');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<JournalEntry[]>([]);
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
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editGratitude, setEditGratitude] = useState('');
  const [editReflection, setEditReflection] = useState('');
  const [editMood, setEditMood] = useState<number | null>(null);
  const [editEnergy, setEditEnergy] = useState<number | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [scheduledPlaybackDate, setScheduledPlaybackDate] = useState<Date | undefined>(undefined);
  const [scheduledPlaybackTime, setScheduledPlaybackTime] = useState<string>('09:00');
  const [showSchedulePlayback, setShowSchedulePlayback] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchScheduledMessages();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);
    
    if (data) {
      // Generate signed URLs for media stored as paths in tags
      const entriesWithMedia = await Promise.all(data.map(async (entry) => {
        const tags = entry.tags as string[] | null;
        let mediaUrls: string[] = [];
        
        if (tags && tags.length > 0) {
          mediaUrls = await generateSignedUrls(tags);
        }
        
        return {
          ...entry,
          media_urls: mediaUrls,
          mentor_feedback: entry.mentor_feedback as unknown as JournalAnalysis | null
        } as JournalEntry;
      }));
      
      setEntries(entriesWithMedia);
    }
  };

  const fetchScheduledMessages = async () => {
    // Fetch entries with scheduled playback (upcoming or due)
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .not('scheduled_playback_at', 'is', null)
      .order('scheduled_playback_at', { ascending: true })
      .limit(20);
    
    if (data) {
      const messagesWithMedia = await Promise.all(data.map(async (entry) => {
        const tags = entry.tags as string[] | null;
        let mediaUrls: string[] = [];
        
        if (tags && tags.length > 0) {
          mediaUrls = await generateSignedUrls(tags);
        }
        
        return {
          ...entry,
          media_urls: mediaUrls,
          mentor_feedback: entry.mentor_feedback as unknown as JournalAnalysis | null
        } as JournalEntry;
      }));
      
      setScheduledMessages(messagesWithMedia);
    }
  };

  const toggleInsights = (entryId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const toggleEntry = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
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

  // Upload media and return file PATHS (not signed URLs)
  const uploadMedia = async (files: File[]): Promise<string[]> => {
    const paths: string[] = [];
    
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
        // Store the file PATH, not a signed URL (which expires)
        paths.push(data.path);
      } else if (error) {
        toast.error(`Failed to upload: ${file.name}`);
        console.error('Upload error:', error);
      }
    }
    
    return paths;
  };

  // Generate signed URLs from stored paths for display
  const generateSignedUrls = async (paths: string[]): Promise<string[]> => {
    if (!paths || paths.length === 0) return [];
    
    const signedUrls: string[] = [];
    
    for (const path of paths) {
      try {
        // If it's already a full URL (legacy data), try to extract path
        if (path.startsWith('http')) {
          const pathMatch = path.match(/user-media\/([^?]+)/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const { data, error } = await supabase.storage
              .from('user-media')
              .createSignedUrl(filePath, 3600);
            
            if (!error && data) {
              signedUrls.push(data.signedUrl);
              continue;
            }
          }
          // If we can't extract, skip this URL
          continue;
        }
        
        // For stored paths, generate fresh signed URL
        const { data, error } = await supabase.storage
          .from('user-media')
          .createSignedUrl(path, 3600);
        
        if (!error && data) {
          signedUrls.push(data.signedUrl);
        }
      } catch (e) {
        console.error('Error creating signed URL for path:', path, e);
      }
    }
    
    return signedUrls;
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
      // Upload media files and get file PATHS (not URLs)
      let mediaPaths: string[] = [];
      const filesToUpload = [...selectedFiles];
      
      // Add audio recording as a file
      if (audioBlob) {
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        filesToUpload.push(audioFile);
      }

      if (filesToUpload.length > 0) {
        mediaPaths = await uploadMedia(filesToUpload);
        if (mediaPaths.length === 0 && filesToUpload.length > 0) {
          setLoading(false);
          setIsAnalyzing(false);
          return;
        }
      }

      // For AI analysis, we need temporary signed URLs
      let analysisMediaUrls: string[] = [];
      if (mediaPaths.length > 0) {
        analysisMediaUrls = await generateSignedUrls(mediaPaths);
      }

      // Combine all text content for analysis
      const fullContent = [
        content,
        gratitude && `Gratitude: ${gratitude}`,
        reflection && `Reflection: ${reflection}`
      ].filter(Boolean).join('\n\n');

      // Analyze content with AI
      const analysisResult = await analyzeJournalContent(fullContent, analysisMediaUrls);
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

      // Calculate scheduled playback timestamp if set
      let scheduledPlaybackAt: string | null = null;
      if (showSchedulePlayback && scheduledPlaybackDate) {
        const [hours, minutes] = scheduledPlaybackTime.split(':').map(Number);
        const playbackDateTime = new Date(scheduledPlaybackDate);
        playbackDateTime.setHours(hours, minutes, 0, 0);
        scheduledPlaybackAt = playbackDateTime.toISOString();
      }

      const entryData = {
        content: content || null,
        gratitude: gratitude || null,
        reflection: reflection || null,
        mood: selectedMood,
        energy: selectedEnergy,
        date: today,
        // Store file PATHS in tags (not signed URLs which expire)
        tags: mediaPaths.length > 0 ? mediaPaths : null,
        scheduled_playback_at: scheduledPlaybackAt,
        playback_reminder_sent: false,
        // Store AI mentor feedback for later viewing
        mentor_feedback: analysisResult ? JSON.parse(JSON.stringify({
          approved: analysisResult.approved,
          mentorComment: analysisResult.mentorComment,
          opportunities: analysisResult.opportunities,
          nudge: analysisResult.nudge,
        })) : null,
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

      const successMessage = scheduledPlaybackAt 
        ? `Journal entry saved! You'll be reminded on ${format(new Date(scheduledPlaybackAt), 'MMM d, yyyy')} at ${format(new Date(scheduledPlaybackAt), 'h:mm a')}`
        : 'Journal entry saved!';
      choreographedDispatch('reflection_saved');
      toast.success(successMessage);
      
      // Reset all form fields for new entry
      setContent('');
      setGratitude('');
      setReflection('');
      setSelectedMood(null);
      setSelectedEnergy(null);
      setSelectedFiles([]);
      setAudioBlob(null);
      setAudioUrl(null);
      setAnalysis(null);
      setScheduledPlaybackDate(undefined);
      setScheduledPlaybackTime('09:00');
      setShowSchedulePlayback(false);
      
      fetchEntries();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Journal entry deleted');
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  };

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditContent(entry.content || '');
    setEditGratitude(entry.gratitude || '');
    setEditReflection(entry.reflection || '');
    setEditMood(entry.mood);
    setEditEnergy(entry.energy);
  };

  const saveEditedEntry = async () => {
    if (!editingEntry) return;
    setIsSavingEdit(true);

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          content: editContent || null,
          gratitude: editGratitude || null,
          reflection: editReflection || null,
          mood: editMood,
          energy: editEnergy,
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      toast.success('Journal entry updated');
      setEditingEntry(null);
      fetchEntries();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update entry');
    } finally {
      setIsSavingEdit(false);
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

          {/* Schedule Playback for Future Self */}
          {(selectedFiles.length > 0 || audioUrl) && (
            <div className="pt-2 border-t border-border/30">
              <button
                onClick={() => setShowSchedulePlayback(!showSchedulePlayback)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
              >
                <CalendarClock className="w-4 h-4" />
                <span>{showSchedulePlayback ? 'Cancel scheduled reminder' : 'Schedule reminder for future self'}</span>
                {showSchedulePlayback && <Bell className="w-4 h-4 ml-auto text-primary" />}
              </button>
              
              {showSchedulePlayback && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Get a push notification to revisit this {audioUrl ? 'voice message' : 'video'} on a future date
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal flex-1 min-w-[140px]",
                            !scheduledPlaybackDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {scheduledPlaybackDate ? format(scheduledPlaybackDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={scheduledPlaybackDate}
                          onSelect={setScheduledPlaybackDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Select value={scheduledPlaybackTime} onValueChange={setScheduledPlaybackTime}>
                      <SelectTrigger className="w-[110px]">
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {scheduledPlaybackDate && (
                    <p className="text-xs text-primary font-medium">
                      📬 Reminder set for {format(scheduledPlaybackDate, 'EEEE, MMMM d, yyyy')} at {scheduledPlaybackTime.replace(':00', '')}:00 {parseInt(scheduledPlaybackTime) >= 12 ? 'PM' : 'AM'}
                    </p>
                  )}
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

      {/* Messages to Future Self - Scheduled & Due */}
      {scheduledMessages.length > 0 && (
        <Card variant="glass" className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Messages to Future Self
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledMessages.map((msg) => {
              const scheduledDate = msg.scheduled_playback_at ? new Date(msg.scheduled_playback_at) : null;
              const isDue = scheduledDate && scheduledDate <= new Date();
              const hasMedia = msg.media_urls && msg.media_urls.length > 0;
              
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "p-3 rounded-lg transition-colors cursor-pointer",
                    isDue 
                      ? "bg-primary/20 border border-primary/40 hover:bg-primary/30" 
                      : "bg-secondary/30 hover:bg-secondary/50"
                  )}
                  onClick={() => navigate(`/journal/playback/${msg.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isDue ? (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          <Bell className="w-3 h-3 mr-1" />
                          Ready to view
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {scheduledDate && format(scheduledDate, 'MMM d, yyyy')}
                        </Badge>
                      )}
                      {hasMedia && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          {msg.media_urls![0].includes('video') ? 'Video' : 'Voice'}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant={isDue ? "gold" : "outline"} 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/journal/playback/${msg.id}`);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isDue ? 'Play Now' : 'Preview'}
                    </Button>
                  </div>
                  {msg.content && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {msg.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Recorded {format(new Date(msg.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Entries with AI Insights */}
      {entries.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" />
              Previous Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.slice(0, 10).map((entry) => {
              const isExpanded = expandedEntries.has(entry.id);
              
              return (
                <div 
                  key={entry.id} 
                  className={cn(
                    "p-3 rounded-lg transition-colors cursor-pointer",
                    isExpanded 
                      ? "bg-primary/10 border border-primary/30" 
                      : "bg-secondary/30 hover:bg-secondary/50"
                  )}
                  onClick={() => toggleEntry(entry.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {format(new Date(entry.date), 'EEEE, MMMM d')}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
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
                      <ShareButton
                        source={{
                          type: 'journal_reflection',
                          id: entry.id,
                          title: 'Reflection',
                          excerpt: (entry.content || entry.reflection || entry.gratitude || '').slice(0, 120),
                          statLabel: format(new Date(entry.date), 'MMM d, yyyy'),
                          domain: 'mind',
                          imageUrl: entry.media_urls?.find(u => /\.(jpg|jpeg|png|gif|webp)/i.test(u)),
                          imageUrls: entry.media_urls?.filter(u => /\.(jpg|jpeg|png|gif|webp)/i.test(u)),
                          mediaUrls: entry.media_urls,
                        }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {entry.media_urls && entry.media_urls.length > 0 && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/journal/playback/${entry.id}`); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Playback
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(entry); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); setEntryToDelete(entry.id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Content preview or full content */}
                  {entry.content && (
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      !isExpanded && "line-clamp-2"
                    )}>
                      {entry.content}
                    </p>
                  )}
                  
                  {/* Expanded content sections */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 animate-fade-in">
                      {/* Gratitude */}
                      {entry.gratitude && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium">Gratitude</span>
                          </div>
                          <p className="text-sm text-foreground">{entry.gratitude}</p>
                        </div>
                      )}
                      
                      {/* Reflection */}
                      {entry.reflection && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium">Reflection</span>
                          </div>
                          <p className="text-sm text-foreground">{entry.reflection}</p>
                        </div>
                      )}
                    </div>
                  )}
                
                {/* Display media (images, videos, audio) */}
                {entry.media_urls && entry.media_urls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.media_urls.map((url, idx) => {
                      // Determine media type from URL
                      const isAudio = url.includes('.webm') || url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg') || url.includes('audio');
                      const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('video');
                      
                      if (isAudio) {
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                            <Mic className="w-4 h-4 text-primary" />
                            <audio controls className="h-8 max-w-[200px]" preload="metadata">
                              <source src={url} type="audio/webm" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        );
                      }
                      
                      if (isVideo) {
                        return (
                          <video 
                            key={idx}
                            src={url} 
                            controls 
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        );
                      }
                      
                      // Default: image
                      return (
                        <img 
                          key={idx}
                          src={url} 
                          alt="Journal media" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      );
                    })}
                  </div>
                )}

                {/* AI Insights Toggle */}
                {entry.mentor_feedback && entry.mentor_feedback.mentorComment && (
                  <div className="mt-3 pt-2 border-t border-border/30">
                    <button
                      onClick={() => toggleInsights(entry.id)}
                      className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors w-full"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Insights</span>
                      {expandedInsights.has(entry.id) ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>
                    
                    {expandedInsights.has(entry.id) && (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Bot className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-foreground">{entry.mentor_feedback.mentorComment}</p>
                          </div>
                        </div>
                        
                        {entry.mentor_feedback.nudge && (
                          <div className="bg-accent/20 rounded-lg p-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium">Daily Nudge</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{entry.mentor_feedback.nudge}</p>
                          </div>
                        )}
                        
                        {entry.mentor_feedback.opportunities && entry.mentor_feedback.opportunities.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Lightbulb className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium">Opportunities</span>
                            </div>
                            {entry.mentor_feedback.opportunities.slice(0, 2).map((opp, idx) => (
                              <div key={idx} className="bg-muted/50 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">{opp.title}</span>
                                  <Badge variant="secondary" className="text-[10px] h-4">{opp.category}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{opp.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => entryToDelete && deleteEntry(entryToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>
              {editingEntry && format(new Date(editingEntry.date), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Mood & Energy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mood</label>
                <div className="flex justify-between">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditMood(option.value)}
                      className={cn(
                        "mood-option text-xl",
                        editMood === option.value && "selected"
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
                      onClick={() => setEditEnergy(option.value)}
                      className={cn(
                        "mood-option",
                        editEnergy === option.value && "selected"
                      )}
                      title={option.label}
                    >
                      <option.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Gratitude */}
            <div>
              <label className="text-sm font-medium mb-2 block">🙏 Gratitude</label>
              <Textarea
                value={editGratitude}
                onChange={(e) => setEditGratitude(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Reflection */}
            <div>
              <label className="text-sm font-medium mb-2 block">💭 Reflection</label>
              <Textarea
                value={editReflection}
                onChange={(e) => setEditReflection(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={saveEditedEntry} disabled={isSavingEdit}>
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
