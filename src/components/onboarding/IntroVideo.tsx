import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface IntroVideoProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const IntroVideo = ({ onComplete, onBack }: IntroVideoProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div
      className="h-[100dvh] bg-background flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-6 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold mb-2">Welcome to LifeStack</h1>
            <p className="text-muted-foreground">Watch this quick intro to get started</p>
          </div>

          {!videoFailed ? (
            <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video mb-6">
              <video
                className="w-full h-full object-contain"
                controls
                playsInline
                onPlay={() => setHasStarted(true)}
                onEnded={() => setHasEnded(true)}
                onError={() => setVideoFailed(true)}
                poster="/videos/intro-poster.jpg"
              >
                <source src="/videos/intro.mp4" type="video/mp4" />
              </video>

              {!hasStarted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-secondary/30 border border-border/40 p-8 mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                Intro video unavailable — tap Continue to proceed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="shrink-0 px-4 pt-3 pb-4 border-t border-border/30 bg-background/95 backdrop-blur-sm"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-3">
          {onBack ? (
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : <span />}
          <Button variant="gold" onClick={onComplete} className="min-w-[160px]">
            {hasEnded ? 'Continue' : 'Skip Intro'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
