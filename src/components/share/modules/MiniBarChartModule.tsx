export function MiniBarChartModule({ accentHex }: { accentHex: string }) {
  const bars = [0.4, 0.6, 0.8, 0.5, 0.9, 0.7, 0.85];
  const w = 80, h = 40, barW = 7, gap = 4;
  const totalW = bars.length * (barW + gap) - gap;
  const startX = (w - totalW) / 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {bars.map((v, i) => (
        <rect key={i}
          x={startX + i * (barW + gap)} y={h - v * h}
          width={barW} height={v * h}
          rx={2} fill={accentHex} opacity={0.3 + v * 0.5}
        />
      ))}
    </svg>
  );
}
