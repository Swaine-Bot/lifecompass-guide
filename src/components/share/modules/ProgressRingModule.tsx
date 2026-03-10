interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function ProgressRingModule({ accentHex, trackHex = 'hsl(220,15%,15%)', animate = true }: Props) {
  const pct = 72;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      {/* Track */}
      <circle cx="40" cy="40" r={r} fill="none" stroke={trackHex} strokeWidth="3" />
      {/* Progress arc */}
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke={accentHex} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
        className={animate ? 'share-ring-draw' : ''}
        style={animate ? { '--ring-offset': `${circ}`, '--ring-target': `${offset}` } as React.CSSProperties : undefined}
      />
      {/* Center text */}
      <text
        x="40" y="38" textAnchor="middle" dominantBaseline="central"
        fill={accentHex} fontSize="16" fontWeight="700"
        fontFamily='"Playfair Display", serif'
      >
        {pct}%
      </text>
      <text
        x="40" y="52" textAnchor="middle" dominantBaseline="central"
        fill={accentHex} fontSize="7" fontWeight="500" opacity="0.5"
        fontFamily='"Poppins", sans-serif' letterSpacing="0.1em"
      >
        COMPLETE
      </text>
    </svg>
  );
}
