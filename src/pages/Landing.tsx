import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Brain, BookOpen, ArrowRight, Check, Shield, Users, Download, Play } from 'lucide-react';
import { toast } from 'sonner';
import lifestackLogo from '@/assets/lifestack-logo.png';

const features = [
  {
    icon: Target,
    title: 'Goals & Plans',
    description: 'Break ambitious goals into actionable micro-moves with AI-powered planning.'
  },
  {
    icon: Sparkles,
    title: 'Daily Micro-Moves',
    description: 'Focus on 3-7 high-impact tasks each day. No overwhelm, just progress.'
  },
  {
    icon: Brain,
    title: 'AI Mentor',
    description: 'A calm, pragmatic advisor that knows your context and guides your next move.'
  },
  {
    icon: BookOpen,
    title: 'Life Playbooks',
    description: 'Curated templates for every phase—from first job to legacy planning.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with friends and family. Share progress and support each other.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is encrypted and protected. We never sell your information.'
  },
];

const phases = [
  'Student / Early Career',
  'Builder',
  'Family & Home',
  'Explorer',
  'Legacy & Impact',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={lifestackLogo} alt="LifeStack" className="w-8 h-8" />
            <span className="font-serif text-xl font-semibold">LifeStack</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="gold" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Your life companion, powered by AI
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-gold-gradient">Guide your life</span>
            <br />
            <span className="text-foreground">from your first job to your last breath</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            LifeStack is your personal life operating system—an AI mentor that helps you plan, 
            track, and reflect across every phase of your journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gold" asChild>
              <Link to="/auth?mode=signup">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Video Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-card/50">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Watch Our Story</h2>
            <p className="text-muted-foreground">A journey through life, guided by LifeStack</p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden bg-black/80 shadow-2xl border border-border/50">
            <div className="aspect-video">
              <video
                className="w-full h-full object-contain"
                controls
                playsInline
                poster="/videos/intro-poster.jpg"
              >
                <source src="/videos/launch-teaser.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const a = document.createElement('a');
                a.href = '/videos/launch-teaser.mp4';
                a.download = 'lifestack-launch-video.mp4';
                a.click();
                toast.success('Video download started!');
              }}
            >
              <Download className="w-4 h-4" />
              Download Video
            </Button>
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/launch-video">
                <Play className="w-4 h-4" />
                View Full Production Kit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to thrive
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
            A complete system for goals, habits, reflection, and growth—all in one elegant experience.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Life Phases */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Designed for every chapter
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            Tailored guidance and playbooks for wherever you are in life.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="phase-badge"
              >
                <Check className="w-4 h-4 text-primary" />
                {phase}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="glass-card-elevated p-8 md:p-12 text-center gold-glow">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready to stack your life?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join thousands who are building intentional lives, one micro-move at a time.
            </p>
            <Button size="xl" variant="gold" asChild>
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={lifestackLogo} alt="LifeStack" className="w-5 h-5" />
              <span className="font-serif font-semibold">LifeStack</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms & Conditions
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 LifeStack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
