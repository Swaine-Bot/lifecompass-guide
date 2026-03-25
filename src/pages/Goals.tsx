import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Search, ChevronRight, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/contexts/SensoryContext';
import { choreographedDispatch } from '@/engines/choreographyEngine';
import { SectionHeader, CategoryChip, StatusBadge, MetaText } from '@/components/ds';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMilestonePrompt } from '@/hooks/useMilestonePrompt';
import { MilestonePromptModal } from '@/components/viral/MilestonePromptModal';

interface Goal {
  id: string;
  title: string;
  category: string | null;
  target_date: string | null;
  priority: number;
  status: string;
  why: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/15',
  completed: 'bg-primary/10 text-primary border-primary/15',
  paused: 'bg-warning/10 text-warning border-warning/15',
  archived: 'bg-muted/50 text-muted-foreground border-border/30',
};

const categories = ['All', 'Health', 'Career', 'Money', 'Relationships', 'Mindset', 'Legacy'];

export default function Goals() {
  useEnvironment('goals');
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const milestonePrompt = useMilestonePrompt();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
    setLoading(false);
  };

  const updateGoalStatus = async (goalId: string, status: 'active' | 'completed' | 'paused' | 'archived') => {
    await supabase
      .from('goals')
      .update({ status })
      .eq('id', goalId);
    
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g));

    if (status === 'completed' && user) {
      choreographedDispatch('milestone_reached');
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        milestonePrompt.checkGoalComplete(goalId, goal.title, user.id);
      }
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      goal.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const activeGoals = filteredGoals.filter(g => g.status === 'active');
  const otherGoals = filteredGoals.filter(g => g.status !== 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header zone with contrast scrim + on-image text */}
      <div className="header-scrim space-y-5">
        {/* Header — Aspirational */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-1 on-image-title">Goals & Plans</h1>
            <p className="on-image-subtitle text-xs uppercase tracking-wider font-medium">Your roadmap to an intentional life</p>
          </div>
          <Button variant="gold" asChild className="shrink-0">
            <Link to="/goals/new">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">New Goal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 on-image-placeholder" />
            <Input
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/20 border-white/[0.12] focus:border-primary/40 placeholder:on-image-placeholder text-foreground"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "shrink-0 text-[11px] tracking-wide",
                  selectedCategory !== cat && "on-image-filter hover:text-foreground"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <SectionHeader icon={Target} title="Active Goals" counter={activeGoals.length} />

        {activeGoals.length === 0 ? (
          <Card variant="glass" className="p-8 text-center">
            <Target className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-muted-foreground/50 text-sm mb-4">
              {searchQuery || selectedCategory !== 'All' 
                ? 'No goals match your filters'
                : "You haven't created any goals yet"
              }
            </p>
            {!searchQuery && selectedCategory === 'All' && (
              <Button variant="gold-outline" size="sm" asChild>
                <Link to="/goals/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first goal
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-3">
            {activeGoals.map((goal) => (
              <Card 
                key={goal.id} 
                variant="glass" 
                className="hover-lift cursor-pointer group"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        {goal.category && (
                          <span className="category-chip">
                            {goal.category}
                          </span>
                        )}
                        <span className={cn("status-badge", statusColors[goal.status])}>
                          {goal.status}
                        </span>
                      </div>
                      <h3 className="font-serif font-semibold text-base leading-snug mb-1">{goal.title}</h3>
                      {goal.why && (
                        <p className="text-xs text-muted-foreground/50 line-clamp-2 leading-relaxed">{goal.why}</p>
                      )}
                      {goal.target_date && (
                        <div className="flex items-center gap-1.5 mt-3 meta-text">
                          <Calendar className="w-3 h-3" />
                          <span>Due {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/[0.06]">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/goals/${goal.id}`);
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          updateGoalStatus(goal.id, 'completed');
                        }}>
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          updateGoalStatus(goal.id, 'paused');
                        }}>
                          Pause Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed & Paused */}
      {otherGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-sm font-semibold text-muted-foreground/40 uppercase tracking-wider">
            Completed & Paused
          </h2>
          <div className="grid gap-2">
            {otherGoals.map((goal) => (
              <Card 
                key={goal.id} 
                variant="surface" 
                className="opacity-60 hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-[10px] border", statusColors[goal.status])}>
                        {goal.status}
                      </Badge>
                      <span className="font-medium text-sm">{goal.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {milestonePrompt.milestone && (
        <MilestonePromptModal
          milestone={milestonePrompt.milestone}
          open={milestonePrompt.open}
          onClose={milestonePrompt.close}
        />
      )}
    </div>
  );
}
