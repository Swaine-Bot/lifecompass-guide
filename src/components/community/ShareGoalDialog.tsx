import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Loader2, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  status: string | null;
  target_date: string | null;
  category: string | null;
}

interface Habit {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
}

interface ShareGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

export function ShareGoalDialog({ open, onOpenChange, onPostCreated }: ShareGoalDialogProps) {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'goal' | 'micro_move' | 'compose'>('goal');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [customContent, setCustomContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchGoalsAndHabits();
    }
  }, [open, user]);

  const fetchGoalsAndHabits = async () => {
    if (!user) return;
    setLoading(true);

    const [goalsResult, habitsResult] = await Promise.all([
      supabase
        .from('goals')
        .select('id, title, status, target_date, category')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('habits')
        .select('id, title, description, color')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    if (goalsResult.data) setGoals(goalsResult.data);
    if (habitsResult.data) setHabits(habitsResult.data);
    setLoading(false);
  };

  const createPost = async () => {
    if (!user) return;
    setPosting(true);

    try {
      let content = '';
      let postType: 'regular' | 'goal' | 'micro_move' = 'regular';
      let goalId: string | null = null;
      let habitId: string | null = null;

      if (tab === 'goal' && selectedGoal) {
        postType = 'goal';
        goalId = selectedGoal.id;
        content = `🎯 Working on my goal: "${selectedGoal.title}"${selectedGoal.target_date ? `\n📅 Target: ${format(new Date(selectedGoal.target_date), 'MMM d, yyyy')}` : ''}${customContent ? `\n\n${customContent}` : ''}`;
      } else if (tab === 'micro_move' && selectedHabit) {
        postType = 'micro_move';
        habitId = selectedHabit.id;
        content = `✨ Completed my habit: "${selectedHabit.title}"${customContent ? `\n\n${customContent}` : ''}`;
      } else if (tab === 'compose') {
        postType = 'regular';
        content = customContent;
      }

      if (!content.trim()) {
        toast.error('Please add some content or select an item to share');
        setPosting(false);
        return;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        visibility,
        post_type: postType,
        goal_id: goalId,
        habit_id: habitId,
        media_urls: []
      });

      if (error) throw error;

      toast.success('Post shared!');
      onPostCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post');
    } finally {
      setPosting(false);
    }
  };

  const resetForm = () => {
    setSelectedGoal(null);
    setSelectedHabit(null);
    setCustomContent('');
    setTab('goal');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Share Your Progress
          </DialogTitle>
          <DialogDescription>Share a goal, celebrate a micro move, or write about your journey</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goal">Goal</TabsTrigger>
            <TabsTrigger value="micro_move">Micro Move</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[40vh]">
            <TabsContent value="goal" className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : goals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active goals yet. Create one first!
                </p>
              ) : (
                goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedGoal?.id === goal.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{goal.title}</span>
                      </div>
                      {selectedGoal?.id === goal.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    {goal.category && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {goal.category}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="micro_move" className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : habits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No habits yet. Create one first!
                </p>
              ) : (
                habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedHabit?.id === habit.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: habit.color || '#D4AF37' }}
                        />
                        <span className="font-medium text-sm">{habit.title}</span>
                      </div>
                      {selectedHabit?.id === habit.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {habit.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="compose">
              <p className="text-sm text-muted-foreground mb-3">
                Write about your progress, achievements, or reflections
              </p>
            </TabsContent>
          </div>

          {/* Additional content area */}
          <div className="mt-4 space-y-4">
            <div>
              <Label>{tab === 'compose' ? 'Your post' : 'Add a note (optional)'}</Label>
              <Textarea
                placeholder={tab === 'compose' ? "Share your thoughts..." : "Add context to your share..."}
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/30 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="gold" 
            onClick={createPost} 
            disabled={posting || (tab !== 'compose' && !selectedGoal && !selectedHabit) || (tab === 'compose' && !customContent.trim())}
          >
            {posting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
