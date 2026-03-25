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
    <div className="space-y-3">
      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Platform</span>
      <div className="grid grid-cols-5 gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const profile = PLATFORM_PROFILES[p];
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all',
                platform === p
                  ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'border-white/[0.06] text-foreground/60 hover:border-white/[0.12] bg-card/30'
              )}
            >
              <span className="text-base">{PLATFORM_ICONS[p]}</span>
              <span className="text-[7px] font-semibold leading-tight text-center">{profile.shortLabel}</span>
              <span className="text-[6px] text-foreground/35">{profile.width}×{profile.height}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-foreground/45">
        {PLATFORM_PROFILES[platform].label} · {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height} ·
        {' '}{PLATFORM_PROFILES[platform].textDensity.replace('_', ' ')} density
      </p>
    </div>
  );
}
