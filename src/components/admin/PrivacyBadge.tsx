import { Shield, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrivacyLevel = 'aggregated' | 'anonymous' | 'privacy-safe';

const config: Record<PrivacyLevel, { icon: typeof Shield; label: string; className: string }> = {
  aggregated: { icon: Shield, label: 'Aggregated', className: 'text-info bg-info/10 border-info/20' },
  anonymous: { icon: Eye, label: 'Anonymous', className: 'text-success bg-success/10 border-success/20' },
  'privacy-safe': { icon: Lock, label: 'Privacy-safe summary', className: 'text-primary bg-primary/10 border-primary/20' },
};

export function PrivacyBadge({ level, className }: { level: PrivacyLevel; className?: string }) {
  const { icon: Icon, label, className: badgeClass } = config[level];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', badgeClass, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
