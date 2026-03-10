import { LucideIcon } from 'lucide-react';
import { PrivacyBadge } from './PrivacyBadge';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  privacyLevel?: 'aggregated' | 'anonymous' | 'privacy-safe';
}

export function SectionHeader({ title, description, icon: Icon, privacyLevel }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {privacyLevel && <PrivacyBadge level={privacyLevel} />}
    </div>
  );
}
