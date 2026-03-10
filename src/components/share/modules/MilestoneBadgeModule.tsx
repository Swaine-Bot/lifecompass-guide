import { Trophy } from 'lucide-react';

export function MilestoneBadgeModule({ accentHex }: { accentHex: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 blur-2xl opacity-25" style={{ backgroundColor: accentHex }} />
      <div className="relative w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
        style={{ borderColor: accentHex, background: `${accentHex}15` }}>
        <Trophy className="w-7 h-7" style={{ color: accentHex }} />
      </div>
    </div>
  );
}
