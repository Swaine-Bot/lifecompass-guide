interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function MilestoneBadgeModule({ accentHex, animate = true }: Props) {
  return (
    <div className={cn('relative', animate && 'share-hero-fade')} style={{ width: 64, height: 64 }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentHex} 0%, transparent 70%)`,
        opacity: 0.15, filter: 'blur(16px)',
      }} />
      <div style={{
        position: 'relative', width: 64, height: 64,
        borderRadius: 16, border: `1.5px solid ${accentHex}`,
        background: `linear-gradient(135deg, ${accentHex}08 0%, ${accentHex}15 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 20px -4px ${accentHex}20`,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentHex} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
