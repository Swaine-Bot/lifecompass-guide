import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, Target, Repeat, CheckSquare, GripVertical, Share2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import { useEnvironment } from '@/contexts/SensoryContext';
import { PageHeader } from '@/components/ds';
import { ShareButton } from '@/components/share/ShareButton';

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  goal_id: string | null;
}

interface Habit {
  id: string;
  title: string;
  color: string;
}

interface Goal {
  id: string;
  title: string;
  target_date: string | null;
  status: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

interface CalendarItem {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'habit' | 'goal';
  color?: string;
  status?: string;
}

export default function Calendar() {
  useEnvironment('calendar');
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [draggingItem, setDraggingItem] = useState<CalendarItem | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, currentDate]);

  const fetchData = async () => {
    if (!user) return;

    const startDate = startOfMonth(subMonths(currentDate, 1));
    const endDate = endOfMonth(addMonths(currentDate, 1));

    const [tasksRes, habitsRes, goalsRes, logsRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*, habits!inner(user_id)').gte('date', format(startDate, 'yyyy-MM-dd')).lte('date', format(endDate, 'yyyy-MM-dd'))
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (habitsRes.data) setHabits(habitsRes.data);
    if (goalsRes.data) setGoals(goalsRes.data);
    if (logsRes.data) setHabitLogs(logsRes.data.filter(log => log.habits?.user_id === user.id));
  };

  const getItemsForDate = (date: Date): CalendarItem[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const items: CalendarItem[] = [];

    tasks.forEach(task => {
      if (task.due_date === dateStr) {
        items.push({
          id: task.id,
          title: task.title,
          date: dateStr,
          type: 'task',
          status: task.status
        });
      }
    });

    goals.forEach(goal => {
      if (goal.target_date === dateStr) {
        items.push({
          id: goal.id,
          title: goal.title,
          date: dateStr,
          type: 'goal',
          status: goal.status
        });
      }
    });

    habits.forEach(habit => {
      const log = habitLogs.find(l => l.habit_id === habit.id && l.date === dateStr);
      if (log) {
        items.push({
          id: habit.id,
          title: habit.title,
          date: dateStr,
          type: 'habit',
          color: habit.color,
          status: log.completed ? 'done' : 'pending'
        });
      }
    });

    return items;
  };

  const handleItemClick = (item: CalendarItem) => {
    setSelectedItem(item);
    setNewDate(item.date);
    setShowRescheduleDialog(true);
  };

  const handleReschedule = async () => {
    if (!selectedItem || !newDate) return;

    try {
      if (selectedItem.type === 'task') {
        await supabase.from('tasks').update({ due_date: newDate }).eq('id', selectedItem.id);
      } else if (selectedItem.type === 'goal') {
        await supabase.from('goals').update({ target_date: newDate }).eq('id', selectedItem.id);
      }
      toast.success('Item rescheduled successfully');
      fetchData();
      setShowRescheduleDialog(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to reschedule item');
    }
  };

  const handleDragStart = (item: CalendarItem) => {
    setDraggingItem(item);
  };

  const handleDrop = async (targetDate: Date) => {
    if (!draggingItem) return;
    
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    
    try {
      if (draggingItem.type === 'task') {
        await supabase.from('tasks').update({ due_date: dateStr }).eq('id', draggingItem.id);
      } else if (draggingItem.type === 'goal') {
        await supabase.from('goals').update({ target_date: dateStr }).eq('id', draggingItem.id);
      }
      toast.success('Item rescheduled');
      fetchData();
    } catch (error) {
      toast.error('Failed to reschedule');
    }
    
    setDraggingItem(null);
  };

  const getDaysInView = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const navigateBack = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateForward = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const days = getDaysInView();

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <PageHeader
        icon={CalendarDays}
        title="Calendar"
        subtitle="View and reschedule your tasks, habits, and goals"
        back="/library"
        actions={
          <ShareButton
            source={{
              type: 'progress_snapshot',
              title: `My Week — ${format(currentDate, 'MMM d')}`,
              subtitle: `${tasks.filter(t => t.status === 'done').length} tasks completed · ${goals.length} goals active`,
              statValue: String(tasks.filter(t => t.status === 'done').length),
              statLabel: 'Tasks Done',
              domain: 'mind',
            }}
            variant="button"
          />
        }
      />

      <Card variant="glass">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={navigateBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="font-serif">
                {view === 'month' 
                  ? format(currentDate, 'MMMM yyyy')
                  : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
                }
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={navigateForward}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={`grid grid-cols-7 gap-1 ${view === 'week' ? 'min-h-[200px]' : ''}`}>
            {days.map((day, index) => {
              const items = getItemsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-1 rounded-lg border border-border/30 transition-colors ${
                    isToday ? 'bg-primary/10 border-primary/30' : 'bg-card/30'
                  } ${!isCurrentMonth && view === 'month' ? 'opacity-40' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(day)}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-0.5 overflow-y-auto max-h-[80px]">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        draggable={item.type !== 'habit'}
                        onDragStart={() => handleDragStart(item)}
                        onClick={() => handleItemClick(item)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-80 transition-opacity ${
                          item.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
                          item.type === 'goal' ? 'bg-primary/20 text-primary' :
                          'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {item.type !== 'habit' && (
                          <GripVertical className="w-2 h-2 opacity-50" />
                        )}
                        {item.type === 'task' && <CheckSquare className="w-2 h-2 flex-shrink-0" />}
                        {item.type === 'goal' && <Target className="w-2 h-2 flex-shrink-0" />}
                        {item.type === 'habit' && <Repeat className="w-2 h-2 flex-shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-500/20" />
              <span className="text-muted-foreground">Tasks</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span className="text-muted-foreground">Goals</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500/20" />
              <span className="text-muted-foreground">Habits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule {selectedItem?.type}</DialogTitle>
            <DialogDescription>
              Move "{selectedItem?.title}" to a new date
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleReschedule}>
                Reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
