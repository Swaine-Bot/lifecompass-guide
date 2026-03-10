interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function RadarLifeDomainsModule({ accentHex, trackHex = 'hsl(220,15%,15%)', animate = true }: Props) {
  const domains = [
    { label: 'PHY', value: 0.8 },
    { label: 'MND', value: 0.6 },
    { label: 'WLT', value: 0.7 },
    { label: 'REL', value: 0.5 },
    { label: 'LGC', value: 0.4 },
  ];
  const cx = 44, cy = 44, r = 32;
  const angleStep = (2 * Math.PI) / domains.length;

  const points = domains.map((d, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: cx + r * d.value * Math.cos(angle),
      y: cy + r * d.value * Math.sin(angle),
      lx: cx + (r + 12) * Math.cos(angle),
      ly: cy + (r + 12) * Math.sin(angle),
      label: d.label,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className={animate ? 'share-hero-fade' : ''}>
      {/* Grid rings */}
      {[0.33, 0.66, 1].map(scale => (
        <polygon key={scale}
          points={domains.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
          }).join(' ')}
          fill="none" stroke={trackHex} strokeWidth="0.5" opacity="0.6"
        />
      ))}
      {/* Axes */}
      {domains.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
            stroke={trackHex} strokeWidth="0.4" opacity="0.4"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={polygon}
        fill={accentHex} fillOpacity="0.12"
        stroke={accentHex} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="2.5" fill={accentHex} />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly + 3} textAnchor="middle"
          fill={accentHex} fontSize="6" fontWeight="600" opacity="0.5"
          fontFamily='"Poppins", sans-serif' letterSpacing="0.06em"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
