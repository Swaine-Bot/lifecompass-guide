import { useDemoMode } from '@/contexts/DemoModeContext';
import { Sparkles, X } from 'lucide-react';

/**
 * Persistent slim banner shown when Demo Mode is active.
 * Sits above the navigation shell, safe-area aware.
 * Purely presentational — does not mutate any real data.
 */
export function DemoModeBanner() {
  const { isDemoMode, setDemoMode } = useDemoMode();
  if (!isDemoMode) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] pointer-events-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto max-w-[640px] px-3 pt-2 pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full bg-amber-500/15 backdrop-blur-xl border border-amber-300/25 px-3 py-1.5 text-[11px] tracking-wide text-amber-100 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <Sparkles className="h-3.5 w-3.5 text-amber-200 shrink-0" />
          <span className="font-medium">Demo Mode</span>
          <span className="opacity-70 truncate">— presentation view, no real writes affected</span>
          <button
            onClick={() => setDemoMode(false)}
            aria-label="Exit demo mode"
            className="ml-auto shrink-0 rounded-full p-1 hover:bg-white/10 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
