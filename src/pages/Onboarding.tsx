import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Crown, ArrowRight, ArrowLeft, Check, Loader2, GraduationCap, Rocket, Home, Compass, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { IntroVideo } from '@/components/onboarding/IntroVideo';
import { UserGuide } from '@/components/onboarding/UserGuide';
import { TermsAcceptance } from '@/components/onboarding/TermsAcceptance';
import { AccountTypeSelect } from '@/components/community/AccountTypeSelect';

const phases = [
  { id: 'student_early_career', label: 'Student / Early Career', description: 'Building foundations and exploring paths', icon: GraduationCap },
  { id: 'builder', label: 'Builder', description: 'Growing career, wealth, and skills', icon: Rocket },
  { id: 'family_home', label: 'Family & Home', description: 'Nurturing relationships and stability', icon: Home },
  { id: 'explorer', label: 'Explorer', description: 'Seeking new experiences and adventures', icon: Compass },
  { id: 'legacy_impact', label: 'Legacy & Impact', description: 'Creating lasting meaning and giving back', icon: Heart },
];

const focusAreas = [
  { id: 'health', label: 'Health & Fitness' },
  { id: 'career', label: 'Career & Work' },
  { id: 'money', label: 'Money & Wealth' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'mindset', label: 'Mindset & Growth' },
  { id: 'legacy', label: 'Legacy & Purpose' },
];

export default function Onboarding() {
  const [showTerms, setShowTerms] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    life_phase: 'builder',
    available_minutes_per_day: 60,
    strictness_level: 5,
    focus_areas: ['health', 'career', 'mindset'],
    account_type: 'individual' as 'individual' | 'page',
    page_category: '' as string,
    curated_suggestions_enabled: false,
  });

  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleTermsAccept = async () => {
    if (!user) return;
    
    // Save terms acceptance to database
    await supabase
      .from('privacy_settings')
      .upsert({
        user_id: user.id,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        privacy_policy_accepted: true,
        privacy_policy_accepted_at: new Date().toISOString(),
      });
    
    setShowTerms(false);
    setShowAccountType(true);
  };

  const steps = [
    { title: 'Welcome', subtitle: "Let's personalize your experience" },
    { title: 'Life Phase', subtitle: 'Where are you in your journey?' },
    { title: 'Focus Areas', subtitle: 'What matters most right now?' },
    { title: 'Your Rhythm', subtitle: 'How do you like to work?' },
    { title: 'Smart Suggestions', subtitle: 'Personalize your AI experience' },
  ];

  const handleAccountTypeComplete = async (data: { accountType: 'individual' | 'page'; pageCategory?: string }) => {
    setFormData(prev => ({
      ...prev,
      account_type: data.accountType,
      page_category: data.pageCategory || '',
    }));
    setShowAccountType(false);
    setShowIntro(true);
  };

  // Show terms acceptance first
  if (showTerms) {
    return <TermsAcceptance onAccept={handleTermsAccept} />;
  }

  // Show account type selection after terms
  if (showAccountType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <IntroVideo onComplete={() => setShowIntro(false)} />
      </div>
    );
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleFocusArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(areaId)
        ? prev.focus_areas.filter(a => a !== areaId)
        : [...prev.focus_areas, areaId]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          timezone: formData.timezone,
          life_phase: formData.life_phase as any,
          available_minutes_per_day: formData.available_minutes_per_day,
          strictness_level: formData.strictness_level,
          focus_areas: formData.focus_areas,
          onboarding_completed: true,
          account_type: formData.account_type as any,
          page_category: formData.page_category || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Save curated suggestions preference
      await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          curated_suggestions_enabled: formData.curated_suggestions_enabled,
        });

      await refreshProfile();
      // Show the user guide after profile is saved
      setShowGuide(true);
    } catch (err) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuideComplete = async () => {
    // Mark guide as completed
    if (user) {
      await supabase
        .from('profiles')
        .update({ guide_completed: true })
        .eq('user_id', user.id);
    }
    toast.success('Welcome to LifeStack!');
    navigate('/home');
  };

  const handleGuideSkip = async () => {
    // Still mark as completed when skipped
    if (user) {
      await supabase
        .from('profiles')
        .update({ guide_completed: true })
        .eq('user_id', user.id);
    }
    toast.success('Welcome to LifeStack!');
    navigate('/home');
  };

  // Show user guide after onboarding wizard
  if (showGuide) {
    return <UserGuide onComplete={handleGuideComplete} onSkip={handleGuideSkip} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="p-4 border-b border-border/30">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-serif font-semibold">LifeStack</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-bold mb-2">{steps[step].title}</h1>
            <p className="text-muted-foreground">{steps[step].subtitle}</p>
          </div>

          <Card variant="glass" className="animate-fade-in">
            <CardContent className="p-6">
              {/* Step 0: Name */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">What should we call you?</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your timezone has been set to <span className="text-foreground">{formData.timezone}</span>
                  </p>
                </div>
              )}

              {/* Step 1: Life Phase */}
              {step === 1 && (
                <div className="space-y-3">
                  {phases.map((phase) => (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, life_phase: phase.id })}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-200",
                        formData.life_phase === phase.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          formData.life_phase === phase.id ? "bg-primary/20" : "bg-secondary"
                        )}>
                          <phase.icon className={cn(
                            "w-5 h-5",
                            formData.life_phase === phase.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{phase.label}</p>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        {formData.life_phase === phase.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Focus Areas */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select up to 4 areas to focus on</p>
                  <div className="grid grid-cols-2 gap-3">
                    {focusAreas.map((area) => {
                      const isSelected = formData.focus_areas.includes(area.id);
                      const isDisabled = !isSelected && formData.focus_areas.length >= 4;
                      
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => !isDisabled && toggleFocusArea(area.id)}
                          disabled={isDisabled}
                          className={cn(
                            "p-4 rounded-xl border text-center transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : isDisabled
                                ? "border-border/30 opacity-50 cursor-not-allowed"
                                : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
                          )}
                        >
                          <p className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {area.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label>Daily available time for growth</Label>
                    <div className="px-2">
                      <Slider
                        value={[formData.available_minutes_per_day]}
                        onValueChange={([value]) => setFormData({ ...formData, available_minutes_per_day: value })}
                        min={15}
                        max={180}
                        step={15}
                      />
                    </div>
                    <p className="text-center text-lg font-medium text-primary">
                      {formData.available_minutes_per_day} minutes / day
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Planning style</Label>
                    <div className="px-2">
                      <Slider
                        value={[formData.strictness_level]}
                        onValueChange={([value]) => setFormData({ ...formData, strictness_level: value })}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Flexible</span>
                      <span>Structured</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Curated Suggestions Opt-in */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Our AI mentor can include curated suggestions for products, services, and resources that match your goals and interests.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 space-y-3">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">What you'll see</p>
                        <p className="text-xs text-muted-foreground">
                          Relevant product recommendations, service suggestions, and curated resources within AI insights on your feed posts and mentor conversations.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Your control</p>
                        <p className="text-xs text-muted-foreground">
                          This is completely optional. You can turn it off anytime in Settings → Privacy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div>
                      <Label className="text-sm font-medium">Enable Curated Suggestions</Label>
                      <p className="text-xs text-muted-foreground">Show me relevant recommendations</p>
                    </div>
                    <Switch
                      checked={formData.curated_suggestions_enabled}
                      onCheckedChange={(v) => setFormData({ ...formData, curated_suggestions_enabled: v })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className={step === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step < steps.length - 1 ? (
              <Button
                variant="gold"
                onClick={handleNext}
                disabled={step === 0 && !formData.name.trim()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
