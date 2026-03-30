import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Brain, BookOpen, ArrowRight, Check, Shield, Users, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import lifestackLogo from '@/assets/lifestack-logo.png';
import cinematicHero from '@/assets/cinematic-hero-mountains.jpg';

const features = [
  { icon: Target, title: 'Goals & Plans', description: 'Break ambitious goals into actionable micro-moves with AI-powered planning.' },
  { icon: Sparkles, title: 'Daily Micro-Moves', description: 'Focus on 3-7 high-impact tasks each day. No overwhelm, just progress.' },
  { icon: Brain, title: 'AI Mentor', description: 'A calm, pragmatic advisor that knows your context and guides your next move.' },
  { icon: BookOpen, title: 'Life Playbooks', description: 'Curated templates for every phase—from first job to legacy planning.' },
  { icon: Users, title: 'Community', description: 'Connect with friends and family. Share progress and support each other.' },
  { icon: Shield, title: 'Privacy First', description: 'Your data is encrypted and protected. We never sell your information.' },
];

const phases = ['Student / Early Career', 'Builder', 'Family & Home', 'Explorer', 'Legacy & Impact'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]" style={{ top: 0, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={lifestackLogo} alt="LifeStack" className="w-8 h-8" />
            <span className="font-serif text-xl font-semibold text-foreground">LifeStack</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-foreground/70 hover:text-foreground">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="gold" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ══ CINEMATIC HERO ══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={cinematicHero}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(180deg,
              hsl(220 20% 3% / 0.5) 0%,
              hsl(220 20% 4% / 0.35) 40%,
              hsl(220 20% 3% / 0.6) 70%,
              hsl(220 20% 3% / 0.95) 100%
            )
          `,
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, hsl(220 20% 3% / 0.4) 100%)',
        }} />

        {/* Hero content */}
        <div className="relative z-10 container max-w-4xl mx-auto px-4 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
            style={{
              background: 'hsl(43 74% 52% / 0.08)',
              borderColor: 'hsl(43 74% 52% / 0.2)',
              color: 'hsl(43 74% 62%)',
            }}>
            <Sparkles className="w-4 h-4" />
            Your life companion, powered by AI
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-primary">Guide your life</span>
            <br />
            <span className="text-white/95">from your first job</span>
            <br />
            <span className="text-white/90">to your last breath</span>
          </h1>

          <p className="text-lg md:text-xl text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            LifeStack is your personal life operating system—an AI mentor that helps you plan,
            track, and reflect across every phase of your journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gold" asChild className="shadow-[0_0_40px_-10px_hsl(43_74%_52%/0.3)]">
              <Link to="/auth?mode=signup">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="border-white/20 text-white/80 hover:text-white hover:bg-white/[0.06]">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Video Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-card/50">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">Watch Our Story</h2>
            <p className="text-foreground/60">A journey through life, guided by LifeStack</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid hsl(220 15% 20% / 0.3)', background: 'hsl(220 20% 4%)' }}>
            <div className="aspect-video">
              <video className="w-full h-full object-contain" controls playsInline>
                <source src="/videos/launch-teaser.mp4?v=20260205" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button variant="outline" className="gap-2"
              onClick={() => {
                const a = document.createElement('a');
                a.href = '/videos/launch-teaser.mp4?v=20260205';
                a.download = 'lifestack-launch-video.mp4';
                a.click();
                toast.success('Video download started!');
              }}>
              <Download className="w-4 h-4" />Download Video
            </Button>
            <Button variant="ghost" className="gap-2"
              onClick={async () => {
                const { shareText } = await import('@/services/share/nativeShareAdapter');
                const { copyText } = await import('@/services/share/nativeClipboardAdapter');
                const result = await shareText(
                  'Guide your life from your first job to your last breath.',
                  'LifeStack - Your Life Operating System',
                  'https://lifecompass-guide.lovable.app',
                );
                if (result.shared) { toast.success('Thanks for sharing!'); }
                else if (result.method !== 'cancelled') {
                  await copyText('https://lifecompass-guide.lovable.app');
                  toast.success('Link copied!');
                }
              }}>
              <Share2 className="w-4 h-4" />Share App
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Everything you need to thrive
          </h2>
          <p className="text-foreground/60 text-center max-w-xl mx-auto mb-16">
            A complete system for goals, habits, reflection, and growth—all in one elegant experience.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{
                  background: 'hsl(220 18% 9% / 0.8)',
                  border: '1px solid hsl(220 15% 20% / 0.2)',
                  backdropFilter: 'blur(20px)',
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'hsl(43 74% 52% / 0.08)' }}>
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Life Phases */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Designed for every chapter</h2>
          <p className="text-foreground/60 max-w-xl mx-auto mb-12">
            Tailored guidance and playbooks for wherever you are in life.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {phases.map((phase, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
                style={{
                  background: 'hsl(220 18% 12% / 0.6)',
                  border: '1px solid hsl(220 15% 20% / 0.2)',
                  color: 'hsl(40 15% 88%)',
                }}>
                <Check className="w-4 h-4 text-primary" />{phase}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12 text-center"
            style={{
              background: 'hsl(220 18% 9% / 0.8)',
              border: '1px solid hsl(43 74% 52% / 0.12)',
              boxShadow: '0 0 60px -20px hsl(43 74% 52% / 0.1)',
              backdropFilter: 'blur(20px)',
            }}>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to stack your life?</h2>
            <p className="text-foreground/60 max-w-lg mx-auto mb-8">
              Join thousands who are building intentional lives, one micro-move at a time.
            </p>
            <Button size="xl" variant="gold" asChild className="shadow-[0_0_32px_-8px_hsl(43_74%_52%/0.3)]">
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/[0.06]">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={lifestackLogo} alt="LifeStack" className="w-5 h-5" />
              <span className="font-serif font-semibold text-foreground">LifeStack</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground/50">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            </div>
            <p className="text-sm text-foreground/40">© 2026 LifeStack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
