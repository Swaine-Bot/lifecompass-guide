interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function StreakFlameModule({ accentHex, animate = true }: Props) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
      {/* Glow */}
      <div
        className={animate ? 'share-gradient-drift' : ''}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentHex} 0%, transparent 70%)`,
          opacity: 0.2,
          filter: 'blur(12px)',
        }}
      />
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className={animate ? 'share-hero-fade' : ''}>
        <path
          d="M20 0C20 0 4 16 4 28C4 37.9 11.2 46 20 48C28.8 46 36 37.9 36 28C36 16 20 0 20 0Z"
          fill={accentHex}
          fillOpacity="0.2"
        />
        <path
          d="M20 12C20 12 10 24 10 32C10 38.6 14.5 44 20 44C25.5 44 30 38.6 30 32C30 24 20 12 20 12Z"
          fill={accentHex}
          fillOpacity="0.45"
        />
        <path
          d="M20 22C20 22 15 30 15 34C15 38 17.2 40 20 40C22.8 40 25 38 25 34C25 30 20 22 20 22Z"
          fill={accentHex}
          fillOpacity="0.8"
        />
      </svg>
    </div>
  );
}
