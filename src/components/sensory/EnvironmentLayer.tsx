import { memo, useState, useEffect } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Full-screen background environment layer with asset support.
 * Uses GPU-safe CSS only (opacity, background, transform).
 */
export const EnvironmentLayer = memo(function EnvironmentLayer() {
  const { environment, settings } = useSensory();
  const { theme, assets } = environment;
  const isStatic = settings.visualMode === 'static' || settings.performanceMode === 'low';
  const [bgLoaded, setBgLoaded] = useState(false);

  // Reset load state when background URL changes
  useEffect(() => {
    if (!assets.backgroundUrl) { setBgLoaded(false); return; }
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = assets.backgroundUrl;
  }, [assets.backgroundUrl]);

  const transitionMs = theme.transitionMs ?? 800;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Gradient base — always present */}
      <div
        className="absolute inset-0"
        style={{
          background: assets.gradientFallback,
          opacity: theme.overlayOpacity,
          transition: `background ${transitionMs}ms ease, opacity ${transitionMs}ms ease`,
        }}
      />

      {/* Real background image — crossfades over gradient */}
      {assets.backgroundUrl && bgLoaded && (
        <div
          className="absolute inset-0 animate-fade-in"
          style={{
            backgroundImage: `url(${assets.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: theme.overlayOpacity * 0.85,
            transition: `opacity ${transitionMs}ms ease`,
          }}
        />
      )}

      {/* Animated ambient movement — dynamic mode only */}
      {!isStatic && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, hsl(${theme.pulseHue} / 0.3), transparent 70%)`,
            animation: 'sensory-drift 20s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
      )}

      {/* Secondary parallax layer — dynamic mode + asset available */}
      {!isStatic && assets.parallaxUrl && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${assets.parallaxUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'sensory-drift 30s ease-in-out infinite alternate-reverse',
            willChange: 'transform',
          }}
        />
      )}
    </div>
  );
});
