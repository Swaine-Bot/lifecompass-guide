import { Flame } from 'lucide-react';

export function StreakFlameModule({ accentHex }: { accentHex: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 blur-2xl opacity-30" style={{ backgroundColor: accentHex }} />
      <Flame className="w-12 h-12 relative" style={{ color: accentHex }} />
    </div>
  );
}
