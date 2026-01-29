import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Target, Flame, Sparkles, BookOpen, Calendar,
  ChevronRight, X, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight: string;
  tip: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 'home',
    title: 'Your Daily Dashboard',
    description: 'This is your command center. See your daily tasks, track habits, and monitor your progress all in one place.',
    icon: Home,
    highlight: 'Start each day here',
    tip: 'Check in every morning to set your focus',
  },
  {
    id: 'goals',
    title: 'Set Meaningful Goals',
    description: 'Create goals that matter to you. Break them down into milestones and actionable micro-moves.',
    icon: Target,
    highlight: 'Goals → Milestones → Tasks',
    tip: 'Focus on your "One Thing" each day',
  },
  {
    id: 'habits',
    title: 'Build Better Habits',
    description: 'Track daily habits with visual streaks. Small consistent actions lead to big transformations.',
    icon: Flame,
    highlight: 'Consistency beats intensity',
    tip: 'Start with just 2-3 habits to build momentum',
  },
  {
    id: 'mentor',
    title: 'Your AI Life Mentor',
    description: 'Get personalized guidance anytime. Ask questions, seek clarity, and receive actionable advice.',
    icon: Sparkles,
    highlight: 'Available 24/7',
    tip: 'Be specific about your challenges for better guidance',
  },
  {
    id: 'library',
    title: 'Life Playbooks',
    description: 'Explore curated guides for different life phases and challenges. Install them to get started quickly.',
    icon: BookOpen,
    highlight: 'Battle-tested strategies',
    tip: 'Browse playbooks matching your life phase',
  },
];

interface UserGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const UserGuide = ({ onComplete, onSkip }: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const step = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;
  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  useEffect(() => {
    // Initial animation delay
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setCurrentStep(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
      >
        Skip Guide
        <X className="w-4 h-4 ml-2" />
      </Button>

      {/* Main content */}
      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {guideSteps.length}
            </span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step navigation dots */}
        <div className="flex justify-center gap-2 mb-8">
          {guideSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => {
                setIsAnimating(true);
                setCurrentStep(index);
                setTimeout(() => setIsAnimating(false), 300);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "bg-primary w-8" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-secondary"
              )}
            />
          ))}
        </div>

        {/* Card content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Icon with animated ring */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                >
                  <step.icon className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
            </div>

            {/* Title */}
            <motion.h2
              className="text-2xl md:text-3xl font-serif font-bold text-center mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {step.title}
            </motion.h2>

            {/* Highlight badge */}
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                {step.highlight}
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-center text-muted-foreground mb-6 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {step.description}
            </motion.p>

            {/* Tip card */}
            <motion.div
              className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
                    Pro Tip
                  </p>
                  <p className="text-sm text-foreground">{step.tip}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && "invisible")}
          >
            Previous
          </Button>
          
          <Button
            variant="gold"
            onClick={handleNext}
            className="min-w-[140px]"
          >
            {isLastStep ? (
              <>
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
