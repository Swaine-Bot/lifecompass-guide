import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroVideo } from '@/components/onboarding/IntroVideo';
import { UserGuide } from '@/components/onboarding/UserGuide';
import { TermsAcceptance } from '@/components/onboarding/TermsAcceptance';
import { AccountTypeSelect } from '@/components/community/AccountTypeSelect';
import {
  Crown, ArrowRight, ArrowLeft, Check, Loader2,
  GraduationCap, Rocket, Home, Compass, Heart,
  Sparkles, ShoppingBag, Bell, Shield, Settings, Info,
  Swords, Eye, BookOpen, Brain, Target, Dumbbell,
  TrendingUp, Users, PenLine, Flame, Zap
} from 'lucide-react';

// ── Data ──

const phases = [
  { id: 'student_early_career', label: 'Student / Early Career', description: 'Building foundations and exploring paths', icon: GraduationCap },
  { id: 'builder', label: 'Builder', description: 'Growing career, wealth, and skills', icon: Rocket },
  { id: 'family_home', label: 'Family & Home', description: 'Nurturing relationships and stability', icon: Home },
  { id: 'explorer', label: 'Explorer', description: 'Seeking new experiences and adventures', icon: Compass },
  { id: 'legacy_impact', label: 'Legacy & Impact', description: 'Creating lasting meaning and giving back', icon: Heart },
];

const focusAreas = [
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell, domain: 'physical' },
  { id: 'career', label: 'Career & Work', icon: Rocket, domain: 'wealth' },
  { id: 'money', label: 'Money & Wealth', icon: TrendingUp, domain: 'wealth' },
  { id: 'relationships', label: 'Relationships', icon: Users, domain: 'relationships' },
  { id: 'mindset', label: 'Mindset & Growth', icon: Brain, domain: 'mind' },
  { id: 'legacy', label: 'Legacy & Purpose', icon: Heart, domain: 'legacy' },
];

const mentorStyles = [
  { id: 'strategist', label: 'Strategist', description: 'Data-driven, systematic, and actionable', icon: Target },
  { id: 'challenger', label: 'Challenger', description: 'Push your limits, tough love', icon: Swords },
  { id: 'guardian', label: 'Guardian', description: 'Supportive, nurturing, encouraging', icon: Shield },
  { id: 'sage', label: 'Sage', description: 'Reflective, philosophical, wisdom-focused', icon: Eye },
];

// Adaptive sub-questions based on focus areas
const activationQuestions: Record<string, { question: string; options: { id: string; label: string }[] }> = {
  health: {
    question: 'What kind of physical focus?',
    options: [
      { id: 'gym', label: 'Gym / Strength' },
      { id: 'running', label: 'Running / Cardio' },
      { id: 'general', label: 'General Fitness' },
      { id: 'nutrition', label: 'Nutrition' },
    ],
  },
  money: {
    question: "What's your wealth focus?",
    options: [
      { id: 'saving', label: 'Saving' },
      { id: 'earning', label: 'Earning More' },
      { id: 'investing', label: 'Investing' },
      { id: 'debt', label: 'Debt Freedom' },
    ],
  },
  mindset: {
    question: 'What mental area matters most?',
    options: [
      { id: 'journaling', label: 'Journaling' },
      { id: 'discipline', label: 'Discipline' },
      { id: 'stress', label: 'Stress / Calm' },
      { id: 'clarity', label: 'Clarity / Focus' },
    ],
  },
  relationships: {
    question: 'Which relationship focus?',
    options: [
      { id: 'social', label: 'Social Circle' },
      { id: 'romantic', label: 'Romantic' },
      { id: 'family', label: 'Family' },
      { id: 'self', label: 'Self-work' },
    ],
  },
};

// ── Component ──

export default function Onboarding() {
  const [showTerms, setShowTerms] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1); // 1 forward, -1 back
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    life_phase: 'builder',
    focus_areas: ['health', 'career', 'mindset'] as string[],
    available_minutes_per_day: 60,
    strictness_level: 5,
    account_type: 'individual' as 'individual' | 'page',
    page_category: '',
    // New Layer 1 fields
    identity_prompt: '',
    primary_intent: '',
    mentor_style: 'strategist',
    // Notifications
    notifications_goals: true,
    notifications_social: true,
    notifications_nudges: true,
    show_ai_insights_to_friends: true,
    curated_suggestions_enabled: false,
    // Layer 2 adaptive
    activation_choices: {} as Record<string, string>,
    first_action: '' as '' | 'goal' | 'journal' | 'mentor',
  });

  const { user, refreshProfile, loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();

  // ── On mount: check if user already completed onboarding or accepted terms ──
  useEffect(() => {
    if (authLoading || !user) {
      // Wait for auth to resolve
      if (!authLoading && !user) {
        navigate('/auth', { replace: true });
      }
      return;
    }

    // If profile shows onboarding already completed, go to /home
    if (profile?.onboarding_completed) {
      console.log('[Onboarding] already_completed redirecting_to_home');
      navigate('/home', { replace: true });
      return;
    }

    // Check if terms were already accepted in privacy_settings
    const checkExistingState = async () => {
      try {
        const { data } = await supabase
          .from('privacy_settings')
          .select('terms_accepted, privacy_policy_accepted')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.terms_accepted && data?.privacy_policy_accepted) {
          console.log('[Onboarding] terms_already_accepted skipping_terms');
          setShowTerms(false);
          setShowAccountType(true);
        }
      } catch (e) {
        console.warn('[Onboarding] state_check_failed', e);
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkExistingState();
  }, [authLoading, user, profile, navigate]);

  // ── Pre-onboarding handlers ──

  const handleTermsAccept = async (termsVersion?: string, privacyVersion?: string) => {
     const resolvedTermsVersion = termsVersion || '1.0';
     const resolvedPrivacyVersion = privacyVersion || '1.0';
     console.log(`[Onboarding] terms_continue_tapped userId=${user?.id ?? 'none'} authLoading=${authLoading}`);
 
     // If auth is still loading, wait briefly then proceed anyway
     if (authLoading) {
       console.log('[Onboarding] auth_still_loading showing_toast');
       toast.info('Initializing your session…');
     }
 
     if (!user) {
       console.log('[Onboarding] missing_user redirecting_to_auth');
       toast.error('Your session expired. Please sign in again.');
       navigate('/auth', { replace: true });
       return;
     }
 
     // ── Optimistic UI progression ──
     console.log('[Onboarding] terms_progressing_optimistically');
     setShowTerms(false);
     setShowAccountType(true);
 
     // ── Background persistence (non-blocking) ──
     try {
       const { error } = await supabase.from('privacy_settings').upsert({
         user_id: user.id,
         terms_accepted: true,
         terms_accepted_at: new Date().toISOString(),
         privacy_policy_accepted: true,
         privacy_policy_accepted_at: new Date().toISOString(),
         terms_version: resolvedTermsVersion,
         privacy_policy_version: resolvedPrivacyVersion,
       } as any);
 
       if (error) throw error;
       console.log('[Onboarding] terms_persist_success');
     } catch (error) {
       const message = error instanceof Error ? error.message : String(error);
       console.error(`[Onboarding] terms_persist_failed error=${message}`);
       toast.error('Terms saved locally — we\'ll sync when connection improves.', { duration: 4000 });
       // Store acceptance locally as fallback
       try {
         localStorage.setItem('lifestack_terms_pending', JSON.stringify({
           termsVersion: resolvedTermsVersion,
           privacyVersion: resolvedPrivacyVersion,
           acceptedAt: new Date().toISOString(),
         }));
       } catch { /* localStorage unavailable */ }
     }
   };

  const handleAccountTypeComplete = async (data: { accountType: 'individual' | 'page'; pageCategory?: string }) => {
    setFormData(prev => ({ ...prev, account_type: data.accountType, page_category: data.pageCategory || '' }));
    setShowAccountType(false);
    setShowIntro(true);
  };

  // ── Step definitions ──
  // Layer 1: 0-6, Layer 2: 7-8
  const hasActivation = formData.focus_areas.some(a => activationQuestions[a]);

  const steps = [
    { title: 'Welcome', subtitle: "Let's personalize your experience" },
    { title: 'Life Phase', subtitle: 'Where are you in your journey?' },
    { title: 'Focus Areas', subtitle: 'What matters most right now?' },
    { title: 'Your Direction', subtitle: 'What are you working toward?' },
    { title: 'Your Mentor', subtitle: 'Choose your guidance style' },
    { title: 'Your Rhythm', subtitle: 'How do you like to work?' },
    { title: 'Notifications', subtitle: 'Stay connected your way' },
    // Layer 2 (conditional)
    ...(hasActivation ? [{ title: 'Fine-Tune', subtitle: 'Sharpen your focus areas' }] : []),
    { title: 'First Step', subtitle: 'Take your first action' },
  ];

  const totalSteps = steps.length;

  // ── Navigation ──

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [step, totalSteps]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  const toggleFocusArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(areaId)
        ? prev.focus_areas.filter(a => a !== areaId)
        : prev.focus_areas.length < 4
          ? [...prev.focus_areas, areaId]
          : prev.focus_areas,
    }));
  };

  // ── Complete ──

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name: formData.name,
        timezone: formData.timezone,
        life_phase: formData.life_phase as any,
        available_minutes_per_day: formData.available_minutes_per_day,
        strictness_level: formData.strictness_level,
        focus_areas: formData.focus_areas,
        onboarding_completed: true,
        account_type: formData.account_type as any,
        page_category: formData.page_category || null,
        mentor_style: formData.mentor_style,
        identity_prompt: formData.identity_prompt || null,
        primary_intent: formData.primary_intent || null,
      } as any).eq('user_id', user.id);

      if (error) throw error;

      await supabase.from('privacy_settings').upsert({
        user_id: user.id,
        curated_suggestions_enabled: formData.curated_suggestions_enabled,
        notifications_goals: formData.notifications_goals,
        notifications_social: formData.notifications_social,
        notifications_nudges: formData.notifications_nudges,
        show_ai_insights_to_friends: formData.show_ai_insights_to_friends,
      });

      // Log onboarding completion event
      await supabase.from('engagement_events').insert({
        user_id: user.id,
        event_type: 'onboarding_completed',
        source_engine: 'onboarding',
        metadata: {
          life_phase: formData.life_phase,
          focus_areas: formData.focus_areas,
          mentor_style: formData.mentor_style,
          first_action: formData.first_action || 'none',
          activation_choices: formData.activation_choices,
        },
      });

      await refreshProfile();
      setShowGuide(true);
    } catch {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuideComplete = async () => {
    if (user) {
      await supabase.from('profiles').update({ guide_completed: true } as any).eq('user_id', user.id);
    }
    toast.success('Welcome to LifeStack!');
    // Route to first action if selected
    const route = formData.first_action === 'goal' ? '/goals/new'
      : formData.first_action === 'journal' ? '/journal'
      : formData.first_action === 'mentor' ? '/mentor'
      : '/home';
    navigate(route);
  };

  const handleGuideSkip = async () => {
    if (user) {
      await supabase.from('profiles').update({ guide_completed: true } as any).eq('user_id', user.id);
    }
    toast.success('Welcome to LifeStack!');
    navigate('/home');
  };

  // ── Pre-onboarding screens ──

  // Show loading until auth resolves AND initial state check completes
  if (authLoading || !initialCheckDone) {
    return (
      <div
        className="min-h-[100dvh] bg-background flex items-center justify-center px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Preparing onboarding…</span>
        </div>
      </div>
    );
  }

  if (showTerms) {
    return <TermsAcceptance onAccept={handleTermsAccept} />;
  }

  if (showAccountType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 safe-area-top safe-area-bottom">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Crown className="w-6 h-6 text-primary" />
            <span className="font-serif text-xl font-semibold">LifeStack</span>
          </div>
          <Card variant="glass">
            <CardContent className="p-6">
              <AccountTypeSelect onComplete={handleAccountTypeComplete} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 safe-area-top safe-area-bottom">
        <IntroVideo onComplete={() => setShowIntro(false)} />
      </div>
    );
  }

  if (showGuide) {
    return <UserGuide onComplete={handleGuideComplete} onSkip={handleGuideSkip} />;
  }

  // ── Determine which Layer 2 activation areas apply ──
  const activationAreas = formData.focus_areas.filter(a => activationQuestions[a]);
  const activationStepIndex = 7;
  const firstStepIndex = hasActivation ? 8 : 7;
  const isLastStep = step === totalSteps - 1;

  // ── Render step content ──

  const renderStepContent = () => {
    // Step 0: Name
    if (step === 0) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-lg"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Timezone: <span className="text-foreground">{formData.timezone}</span>
          </p>
        </div>
      );
    }

    // Step 1: Life Phase
    if (step === 1) {
      return (
        <div className="space-y-2.5">
          {phases.map((phase) => (
            <motion.button
              key={phase.id}
              type="button"
              onClick={() => setFormData({ ...formData, life_phase: phase.id })}
              className={cn(
                "w-full p-3.5 rounded-xl border text-left transition-all duration-200",
                formData.life_phase === phase.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  formData.life_phase === phase.id ? "bg-primary/20" : "bg-secondary"
                )}>
                  <phase.icon className={cn("w-5 h-5", formData.life_phase === phase.id ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{phase.label}</p>
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                </div>
                {formData.life_phase === phase.id && <Check className="w-5 h-5 text-primary shrink-0" />}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    // Step 2: Focus Areas (Pillars)
    if (step === 2) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">Select up to 4 areas</p>
          <div className="grid grid-cols-2 gap-3">
            {focusAreas.map((area) => {
              const isSelected = formData.focus_areas.includes(area.id);
              const isDisabled = !isSelected && formData.focus_areas.length >= 4;
              return (
                <motion.button
                  key={area.id}
                  type="button"
                  onClick={() => !isDisabled && toggleFocusArea(area.id)}
                  disabled={isDisabled}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-2",
                    isSelected ? "border-primary bg-primary/10"
                      : isDisabled ? "border-border/30 opacity-50 cursor-not-allowed"
                      : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
                  )}
                  whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                >
                  <area.icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <p className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>{area.label}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 3: Direction — Intent + Identity
    if (step === 3) {
      return (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="intent" className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              What are you improving right now?
            </Label>
            <Input
              id="intent"
              placeholder="e.g. Build a morning routine, get promoted..."
              value={formData.primary_intent}
              onChange={(e) => setFormData({ ...formData, primary_intent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Who are you becoming?
            </Label>
            <Input
              id="identity"
              placeholder="e.g. A disciplined leader, a present parent..."
              value={formData.identity_prompt}
              onChange={(e) => setFormData({ ...formData, identity_prompt: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Optional — used to personalize your mentor and share cards</p>
          </div>
        </div>
      );
    }

    // Step 4: Mentor Style
    if (step === 4) {
      return (
        <div className="space-y-2.5">
          {mentorStyles.map((style) => (
            <motion.button
              key={style.id}
              type="button"
              onClick={() => setFormData({ ...formData, mentor_style: style.id })}
              className={cn(
                "w-full p-3.5 rounded-xl border text-left transition-all duration-200",
                formData.mentor_style === style.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  formData.mentor_style === style.id ? "bg-primary/20" : "bg-secondary"
                )}>
                  <style.icon className={cn("w-5 h-5", formData.mentor_style === style.id ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
                {formData.mentor_style === style.id && <Check className="w-5 h-5 text-primary shrink-0" />}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    // Step 5: Rhythm (time + strictness)
    if (step === 5) {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <Label>Daily time for growth</Label>
            <div className="px-2">
              <Slider
                value={[formData.available_minutes_per_day]}
                onValueChange={([v]) => setFormData({ ...formData, available_minutes_per_day: v })}
                min={15} max={180} step={15}
              />
            </div>
            <p className="text-center text-lg font-medium text-primary">
              {formData.available_minutes_per_day} min / day
            </p>
          </div>
          <div className="space-y-4">
            <Label>Planning style</Label>
            <div className="px-2">
              <Slider
                value={[formData.strictness_level]}
                onValueChange={([v]) => setFormData({ ...formData, strictness_level: v })}
                min={1} max={10} step={1}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Flexible</span>
              <span>Structured</span>
            </div>
          </div>
        </div>
      );
    }

    // Step 6: Notifications + Privacy
    if (step === 6) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">All optional. Change anytime in Settings.</p>

          {[
            { key: 'notifications_goals', label: 'Goal & task reminders', desc: 'Deadline and progress nudges' },
            { key: 'notifications_social', label: 'Social activity', desc: 'Reactions, comments, requests' },
            { key: 'notifications_nudges', label: 'Daily nudges', desc: 'Habit reminders and journaling prompts' },
            { key: 'show_ai_insights_to_friends', label: 'Share AI insights', desc: 'Friends see mentor feedback on posts' },
            { key: 'curated_suggestions_enabled', label: 'Curated suggestions', desc: 'Relevant product recommendations' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <div>
                <Label className="text-sm">{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={(formData as any)[key]}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}

          <div className="p-3 rounded-xl bg-secondary/50 border border-border/30 flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your data is protected with AES-256 encryption. We never sell personal information.
            </p>
          </div>
        </div>
      );
    }

    // Layer 2 — Activation (adaptive sub-questions)
    if (hasActivation && step === activationStepIndex) {
      return (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground text-center">
            Help us personalize your experience further
          </p>
          {activationAreas.map((areaId) => {
            const q = activationQuestions[areaId];
            return (
              <div key={areaId} className="space-y-2">
                <Label className="text-sm">{q.question}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const selected = formData.activation_choices[areaId] === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          activation_choices: { ...prev.activation_choices, [areaId]: opt.id },
                        }))}
                        className={cn(
                          "p-2.5 rounded-lg border text-center text-sm transition-all",
                          selected ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/50 hover:border-primary/30"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Last step — First Action
    if (step === totalSteps - 1) {
      const actions = [
        { id: 'goal' as const, label: 'Set a Goal', desc: 'Define something to work toward', icon: Target },
        { id: 'journal' as const, label: 'Write a Reflection', desc: 'Capture your first thought', icon: PenLine },
        { id: 'mentor' as const, label: 'Talk to Mentor', desc: 'Get personalized guidance', icon: Sparkles },
      ];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Choose your first action — you can always explore everything later.
          </p>
          {actions.map((action) => (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, first_action: prev.first_action === action.id ? '' : action.id }))}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all duration-200",
                formData.first_action === action.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  formData.first_action === action.id ? "bg-primary/20" : "bg-secondary"
                )}>
                  <action.icon className={cn("w-5 h-5", formData.first_action === action.id ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                {formData.first_action === action.id && <Check className="w-5 h-5 text-primary shrink-0" />}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    return null;
  };

  // ── Can proceed? ──
  const canProceed = step === 0 ? formData.name.trim().length > 0 : true;

  return (
    <div className="min-h-screen-safe bg-background flex flex-col safe-area-top safe-area-bottom overflow-x-hidden">
      {/* Progress Header */}
      <div className="p-4 border-b border-border/30">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-serif font-semibold">LifeStack</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {step + 1} / {totalSteps}
            </span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto overscroll-safe">
        <div className="w-full max-w-md pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="text-center mb-6">
                <h1 className="font-serif text-2xl font-bold mb-1">{steps[step].title}</h1>
                <p className="text-muted-foreground text-sm">{steps[step].subtitle}</p>
              </div>

              <Card variant="glass">
                <CardContent className="p-5">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Navigation Footer — always visible so users never get stuck */}
      <div className="shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-sm safe-area-bottom">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className={step === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {isLastStep ? (
            <Button variant="gold" onClick={handleComplete} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <>Get Started<ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          ) : (
            <Button variant="gold" onClick={handleNext} disabled={!canProceed}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
