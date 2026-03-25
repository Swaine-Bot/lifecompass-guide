import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import lifestackLogo from '@/assets/lifestack-logo.png';

const AUTH_BG_VIDEO_SRC = '/videos/auth-background.mp4?v=20260204';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Please enter your name').optional(),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isSignUp) authSchema.parse({ email, password, name });
      else authSchema.omit({ name: true }).parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message; });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSignUp && (!acceptedTerms || !acceptedPrivacy)) {
      toast.error('Please accept the Terms and Privacy Policy to continue');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message.includes('already registered') ? 'This email is already registered. Please sign in instead.' : error.message);
        } else {
          toast.success('Account created! Redirecting...');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes('Invalid login') ? 'Invalid email or password. Please try again.' : error.message);
        }
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
      >
        <source src={AUTH_BG_VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(220 20% 4% / 0.7) 0%, hsl(220 20% 6% / 0.5) 40%, hsl(220 20% 4% / 0.85) 100%)',
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 pt-5">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>
        </header>

        {/* Auth Form */}
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-md">
            {/* Logo + Brand */}
            <div className="flex flex-col items-center mb-10">
              <div className="flex items-center gap-3 mb-4">
                <img src={lifestackLogo} alt="LifeStack" className="w-14 h-14 drop-shadow-[0_0_20px_hsl(43_74%_52%/0.2)]" />
                <span className="font-serif text-3xl font-bold text-foreground tracking-tight">LifeStack</span>
              </div>
              {/* Aspirational tagline */}
              <div className="text-center space-y-2">
                {/* DEBUG MARKER — remove after confirming live */}
                <span className="text-[8px] text-primary/60 font-mono">AUTH-V2-LIVE</span>
                <h1 className="text-xl font-serif font-bold text-foreground/95 leading-snug">
                  {isSignUp ? 'Begin your intentional life' : 'Welcome back'}
                </h1>
                <p className="text-sm text-foreground/60 max-w-[280px] leading-relaxed">
                  {isSignUp
                    ? 'Join a community of people designing lives with meaning, clarity, and purpose.'
                    : 'Your journey is waiting. Sign in to continue.'}
                </p>
              </div>
            </div>

            <Card variant="glass-elevated" className="animate-fade-in border-white/[0.08] shadow-[0_8px_40px_-12px_hsl(220_20%_4%/0.5)]">
              <CardContent className="p-6 pt-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground/80 text-sm font-medium">Name</Label>
                      <Input
                        id="name" type="text" placeholder="Your name"
                        value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
                        className="bg-card/50 border-white/[0.1] h-11 text-foreground placeholder:text-foreground/35"
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">Email</Label>
                    <Input
                      id="email" type="email" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                      className="bg-card/50 border-white/[0.1] h-11 text-foreground placeholder:text-foreground/35"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground/80 text-sm font-medium">Password</Label>
                      {!isSignUp && (
                        <Link to="/reset-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                        className="pr-10 bg-card/50 border-white/[0.1] h-11 text-foreground placeholder:text-foreground/35"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  {isSignUp && (
                    <div className="space-y-3 py-1">
                      <div className="flex items-start gap-2.5">
                        <Checkbox id="terms" checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked === true)} />
                        <label htmlFor="terms" className="text-sm text-foreground/65 leading-tight">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms & Conditions</Link>
                        </label>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Checkbox id="privacy" checked={acceptedPrivacy}
                          onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)} />
                        <label htmlFor="privacy" className="text-sm text-foreground/65 leading-tight">
                          I have read and accept the{' '}
                          <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
                        </label>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit" variant="gold" className="w-full h-12 text-sm font-semibold shadow-[0_0_24px_-6px_hsl(43_74%_52%/0.3)]"
                    disabled={loading || (isSignUp && (!acceptedTerms || !acceptedPrivacy))}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {isSignUp ? 'Start Your Journey' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-7 text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-[10px] uppercase tracking-[0.12em] text-foreground/40 bg-card/80">
                        {isSignUp ? 'already a member?' : 'new here?'}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-foreground/65 hover:text-primary transition-colors font-medium">
                    {isSignUp ? 'Sign in to your account' : 'Create your account'}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Trust footer */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-foreground/35">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-medium">Built for intentional living</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
