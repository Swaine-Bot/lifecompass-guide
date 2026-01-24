import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Crown, ArrowRight, ArrowLeft, Check, Loader2, GraduationCap, Rocket, Home, Compass, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    life_phase: 'builder',
    available_minutes_per_day: 60,
    strictness_level: 5,
    focus_areas: ['health', 'career', 'mindset'],
  });

  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: 'Welcome', subtitle: "Let's personalize your experience" },
    { title: 'Life Phase', subtitle: 'Where are you in your journey?' },
    { title: 'Focus Areas', subtitle: 'What matters most right now?' },
    { title: 'Your Rhythm', subtitle: 'How do you like to work?' },
  ];

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
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Welcome to LifeStack!');
      navigate('/home');
    } catch (err) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
