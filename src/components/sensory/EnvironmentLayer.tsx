import { memo } from 'react';
import { useSensory } from '@/contexts/SensoryContext';

/**
 * Full-screen background environment layer.
 * Uses GPU-safe CSS only (opacity, background, transform).
 * Sits behind all content via fixed positioning + z-index.
 */
export const EnvironmentLayer = memo(function EnvironmentLayer() {
  const { environment, settings } = useSensory();
  const { theme } = environment;
  const isStatic = settings.visualMode === 'static' || settings.performanceMode === 'low';

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, hsl(${theme.gradientFrom}), hsl(${theme.gradientTo}))`,
          opacity: theme.overlayOpacity,
          transition: 'background 800ms ease, opacity 800ms ease',
        }}
      />

      {/* Animated subtle movement — only in dynamic mode */}
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
    </div>
  );
});
