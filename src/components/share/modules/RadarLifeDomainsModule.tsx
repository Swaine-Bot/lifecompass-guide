export function RadarLifeDomainsModule({ accentHex }: { accentHex: string }) {
  const domains = [
    { label: 'PHY', value: 0.8 },
    { label: 'MND', value: 0.6 },
    { label: 'WLT', value: 0.7 },
    { label: 'REL', value: 0.5 },
    { label: 'LGC', value: 0.4 },
  ];
  const cx = 40, cy = 40, r = 30;
  const angleStep = (2 * Math.PI) / domains.length;

  const points = domains.map((d, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: cx + r * d.value * Math.cos(angle),
      y: cy + r * d.value * Math.sin(angle),
      lx: cx + (r + 10) * Math.cos(angle),
      ly: cy + (r + 10) * Math.sin(angle),
      label: d.label,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      {[0.33, 0.66, 1].map(scale => (
        <polygon key={scale}
          points={domains.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
          }).join(' ')}
          fill="none" stroke="hsl(220,15%,18%)" strokeWidth="0.5"
        />
      ))}
      <polygon points={polygon} fill={accentHex} fillOpacity="0.15" stroke={accentHex} strokeWidth="1.5" />
      {points.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly + 3} textAnchor="middle" fill="hsl(220,10%,45%)" fontSize="6" fontWeight="500">
          {p.label}
        </text>
      ))}
    </svg>
  );
}
