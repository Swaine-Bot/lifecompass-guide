import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Plus, Gift, Heart, Flag, Star, Edit, Trash2, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEnvironment } from '@/contexts/SensoryContext';
import { PageHeader } from '@/components/ds';

interface LifeEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'birthday' | 'anniversary' | 'deadline' | 'milestone' | 'custom';
  event_date: string;
  recurring: boolean;
  reminder_days_before: number[];
}

const EVENT_ICONS = {
  birthday: Gift,
  anniversary: Heart,
  deadline: Flag,
  milestone: Star,
  custom: Calendar,
};

const EVENT_COLORS = {
  birthday: 'bg-pink-500/20 text-pink-400',
  anniversary: 'bg-red-500/20 text-red-400',
  deadline: 'bg-orange-500/20 text-orange-400',
  milestone: 'bg-primary/20 text-primary',
  custom: 'bg-blue-500/20 text-blue-400',
};

export default function LifeEvents() {
  useEnvironment('life_events');
  const { user } = useAuth();
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<LifeEvent['event_type']>('custom');
  const [eventDate, setEventDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [reminderDays, setReminderDays] = useState('7,1');

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('life_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(data.map(e => ({
        ...e,
        event_type: e.event_type as LifeEvent['event_type'],
        reminder_days_before: e.reminder_days_before || [7, 1]
      })));
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('custom');
    setEventDate('');
    setRecurring(false);
    setReminderDays('7,1');
    setEditingEvent(null);
  };

  const openEditDialog = (event: LifeEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventType(event.event_type);
    setEventDate(event.event_date);
    setRecurring(event.recurring);
    setReminderDays(event.reminder_days_before.join(','));
    setShowAddDialog(true);
  };

  const saveEvent = async () => {
    if (!user || !title || !eventDate) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    const reminderArray = reminderDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

    const eventData = {
      user_id: user.id,
      title,
      description: description || null,
      event_type: eventType,
      event_date: eventDate,
      recurring,
      reminder_days_before: reminderArray,
    };

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('life_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated!');
      } else {
        const { error } = await supabase
          .from('life_events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Event created!');
      }

      resetForm();
      setShowAddDialog(false);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('life_events').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted');
      fetchEvents();
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  return (
    <div className="space-y-5 pb-20 md:pb-0 animate-fade-in">
      <PageHeader
        icon={Gift}
        title="Life Events"
        subtitle="Track important dates and get mentor reminders"
        actions={
          <Button variant="gold" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        }
      />

      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Life Event'}</DialogTitle>
            <DialogDescription>
              Add important dates like birthdays, anniversaries, or milestones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mom's Birthday"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as LifeEvent['event_type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">🎂 Birthday</SelectItem>
                  <SelectItem value="anniversary">💕 Anniversary</SelectItem>
                  <SelectItem value="deadline">🚩 Deadline</SelectItem>
                  <SelectItem value="milestone">⭐ Milestone</SelectItem>
                  <SelectItem value="custom">📅 Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recurring Yearly</Label>
                <p className="text-xs text-muted-foreground">Repeat this event every year</p>
              </div>
              <Switch checked={recurring} onCheckedChange={setRecurring} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminders">Reminder Days Before</Label>
              <Input
                id="reminders"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="e.g., 7,1"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated days (e.g., "7,1" = remind 7 days and 1 day before)
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button variant="gold" onClick={saveEvent} disabled={loading}>
                {editingEvent ? 'Update' : 'Save'} Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {events.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold mb-2">No life events yet</h3>
            <p className="text-muted-foreground mb-4">
              Add important dates to get timely reminders from your AI Mentor
            </p>
            <Button variant="gold" onClick={() => setShowAddDialog(true)}>
              Add Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-semibold">Upcoming Events</h2>
              <div className="grid gap-3">
                {upcomingEvents.map((event) => {
                  const Icon = EVENT_ICONS[event.event_type];
                  return (
                    <Card key={event.id} variant="glass" className="hover-lift">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${EVENT_COLORS[event.event_type]}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.event_date), 'MMMM d, yyyy')}
                                {event.recurring && ' • Recurring'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="hidden sm:flex gap-1">
                              <Bell className="w-3 h-3" />
                              {event.reminder_days_before.join(', ')}d
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 ml-13">{event.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-semibold text-muted-foreground">Past Events</h2>
              <div className="grid gap-3 opacity-60">
                {pastEvents.slice(0, 5).map((event) => {
                  const Icon = EVENT_ICONS[event.event_type];
                  return (
                    <Card key={event.id} variant="glass">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${EVENT_COLORS[event.event_type]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{event.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.event_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
