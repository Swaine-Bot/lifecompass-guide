import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

interface IntroVideoProps {
  onComplete: () => void;
}

export const IntroVideo = ({ onComplete }: IntroVideoProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl font-bold mb-2">Welcome to LifeStack</h1>
        <p className="text-muted-foreground">Watch this quick intro to get started</p>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video mb-6">
        <video
          className="w-full h-full object-contain"
          controls
          playsInline
          onPlay={() => setHasStarted(true)}
          onEnded={() => setHasEnded(true)}
          poster="/videos/intro-poster.jpg"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          variant="gold"
          onClick={onComplete}
          className="min-w-[200px]"
        >
          {hasEnded ? 'Continue' : 'Skip Intro'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
