interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function MiniBarChartModule({ accentHex, trackHex = 'hsl(220,15%,15%)', animate = true }: Props) {
  const bars = [0.35, 0.55, 0.75, 0.45, 0.85, 0.65, 0.9];
  const w = 88, h = 44, barW = 7, gap = 5;
  const totalW = bars.length * (barW + gap) - gap;
  const startX = (w - totalW) / 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={animate ? 'share-hero-fade' : ''}>
      {/* Baseline */}
      <line x1={startX - 2} y1={h} x2={startX + totalW + 2} y2={h}
        stroke={trackHex} strokeWidth="0.5" />
      {bars.map((v, i) => {
        const barH = v * (h - 2);
        return (
          <rect key={i}
            x={startX + i * (barW + gap)} y={h - barH}
            width={barW} height={barH}
            rx={3} fill={accentHex}
            opacity={0.25 + v * 0.55}
          />
        );
      })}
    </svg>
  );
}
