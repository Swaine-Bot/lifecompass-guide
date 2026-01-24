-- Create enums for life phases, goal status, habit frequency, and roles
CREATE TYPE public.life_phase AS ENUM ('student_early_career', 'builder', 'family_home', 'explorer', 'legacy_impact');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'archived');
CREATE TYPE public.task_status AS ENUM ('backlog', 'this_week', 'today', 'done');
CREATE TYPE public.habit_frequency AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  timezone TEXT DEFAULT 'UTC',
  life_phase life_phase DEFAULT 'builder',
  available_minutes_per_day INTEGER DEFAULT 60,
  strictness_level INTEGER DEFAULT 5,
  focus_areas JSONB DEFAULT '["health", "career", "mindset"]'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  target_date DATE,
  priority INTEGER DEFAULT 2,
  success_metric TEXT,
  why TEXT,
  constraints TEXT,
  status goal_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  status task_status DEFAULT 'backlog',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status task_status DEFAULT 'backlog',
  effort_minutes INTEGER DEFAULT 15,
  tags JSONB DEFAULT '[]'::jsonb,
  is_one_thing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency habit_frequency DEFAULT 'daily',
  metric_unit TEXT,
  target_value NUMERIC,
  reminder_times JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habit logs table
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  value NUMERIC,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Journal entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  content TEXT,
  gratitude TEXT,
  reflection TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor conversations table
CREATE TABLE public.mentor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor messages table
CREATE TABLE public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.mentor_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Library playbooks table
CREATE TABLE public.library_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  phase life_phase,
  description TEXT,
  category TEXT,
  content_json JSONB DEFAULT '{}'::jsonb,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Playbook installs table
CREATE TABLE public.playbook_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playbook_id UUID REFERENCES public.library_playbooks(id) ON DELETE CASCADE NOT NULL,
  installed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, playbook_id)
);

-- Daily check-ins table
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Goals policies
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view milestones of their goals" ON public.milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can create milestones for their goals" ON public.milestones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can update milestones of their goals" ON public.milestones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can delete milestones of their goals" ON public.milestones FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view logs of their habits" ON public.habit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);
CREATE POLICY "Users can create logs for their habits" ON public.habit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);
CREATE POLICY "Users can update logs of their habits" ON public.habit_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Mentor conversations policies
CREATE POLICY "Users can view their own conversations" ON public.mentor_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.mentor_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.mentor_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.mentor_conversations FOR DELETE USING (auth.uid() = user_id);

-- Mentor messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.mentor_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mentor_conversations WHERE mentor_conversations.id = mentor_messages.conversation_id AND mentor_conversations.user_id = auth.uid())
);
CREATE POLICY "Users can create messages in their conversations" ON public.mentor_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.mentor_conversations WHERE mentor_conversations.id = mentor_messages.conversation_id AND mentor_conversations.user_id = auth.uid())
);

-- Library playbooks policies (public read for published)
CREATE POLICY "Anyone can view published playbooks" ON public.library_playbooks FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all playbooks" ON public.library_playbooks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Playbook installs policies
CREATE POLICY "Users can view their own installs" ON public.playbook_installs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own installs" ON public.playbook_installs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own installs" ON public.playbook_installs FOR DELETE USING (auth.uid() = user_id);

-- Daily check-ins policies
CREATE POLICY "Users can view their own check-ins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own check-ins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own check-ins" ON public.daily_checkins FOR UPDATE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentor_conversations_updated_at BEFORE UPDATE ON public.mentor_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_library_playbooks_updated_at BEFORE UPDATE ON public.library_playbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed sample playbooks
INSERT INTO public.library_playbooks (title, phase, category, description, content_json, published) VALUES
('First Job Success Blueprint', 'student_early_career', 'career', 'Master your first 90 days and build a foundation for career growth', '{"goals": [{"title": "Complete onboarding excellently", "category": "career"}], "habits": [{"title": "Daily learning block", "frequency": "daily"}], "tasks": [{"title": "Schedule 1:1 with manager", "effort_minutes": 30}]}', true),
('Morning Mastery Routine', 'builder', 'health', 'Design a morning routine that sets you up for peak performance', '{"habits": [{"title": "Wake at 5:30 AM", "frequency": "daily"}, {"title": "10-min meditation", "frequency": "daily"}, {"title": "Cold shower", "frequency": "daily"}]}', true),
('Relationship Anxiety Reframe', 'family_home', 'relationships', 'Tools and prompts to examine attachment patterns and build secure connections', '{"journal_prompts": ["What story am I telling myself about this relationship?", "What would secure attachment look like here?"]}', true),
('Travel Planning System', 'explorer', 'lifestyle', 'A complete system for planning meaningful adventures', '{"goals": [{"title": "Plan next adventure", "category": "lifestyle"}], "tasks": [{"title": "Research destinations", "effort_minutes": 60}]}', true),
('Legacy Planning Starter', 'legacy_impact', 'legacy', 'Begin documenting your values, wisdom, and intentions for future generations', '{"journal_prompts": ["What do I want to be remembered for?", "What wisdom would I share with my grandchildren?"]}', true),
('Cutting Cycle Nutrition', 'builder', 'health', 'A structured approach to fat loss while preserving muscle', '{"habits": [{"title": "Track calories", "frequency": "daily"}, {"title": "Protein goal: 1g per lb", "frequency": "daily"}], "goals": [{"title": "Reach target body composition", "category": "health"}]}', true);