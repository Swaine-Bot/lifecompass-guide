import { cn } from '@/lib/utils';
import { type SharePlatform, PLATFORM_LIST, PLATFORM_PROFILES } from './platformProfiles';

interface PlatformSelectorProps {
  platform: SharePlatform;
  onChange: (platform: SharePlatform) => void;
}

const PLATFORM_ICONS: Record<SharePlatform, string> = {
  instagram_feed: '📷',
  instagram_story: '📱',
  facebook_feed: '👍',
  linkedin_feed: '💼',
  tiktok_story: '🎵',
};

export function PlatformSelector({ platform, onChange }: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</span>
      <div className="grid grid-cols-5 gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const profile = PLATFORM_PROFILES[p];
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                platform === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-border'
              )}
            >
              <span className="text-base">{PLATFORM_ICONS[p]}</span>
              <span className="text-[7px] font-medium leading-tight text-center">{profile.shortLabel}</span>
              <span className="text-[6px] opacity-60">{profile.width}×{profile.height}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-muted-foreground">
        {PLATFORM_PROFILES[platform].label} · {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height} ·
        {' '}{PLATFORM_PROFILES[platform].textDensity.replace('_', ' ')} density
      </p>
    </div>
  );
}
