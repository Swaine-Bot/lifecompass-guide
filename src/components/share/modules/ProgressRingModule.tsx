export function ProgressRingModule({ accentHex }: { accentHex: string }) {
  const pct = 72;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(220,15%,15%)" strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={accentHex} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="40" textAnchor="middle" fill={accentHex} fontSize="14" fontWeight="bold" fontFamily="serif">
        {pct}%
      </text>
    </svg>
  );
}
