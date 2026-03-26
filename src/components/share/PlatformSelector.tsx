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
      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Platform</span>
      <div className="grid grid-cols-5 gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const profile = PLATFORM_PROFILES[p];
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'studio-option-pill flex flex-col items-center gap-1.5 p-2.5 transition-all',
                platform === p && 'active'
              )}
            >
              <span className="text-base">{PLATFORM_ICONS[p]}</span>
              <span className={cn(
                'text-[7px] font-semibold leading-tight text-center',
                platform === p ? 'text-primary' : 'text-white/55'
              )}>{profile.shortLabel}</span>
              <span className="text-[6px] text-white/25">{profile.width}×{profile.height}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-white/25">
        {PLATFORM_PROFILES[platform].label} · {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height} ·
        {' '}{PLATFORM_PROFILES[platform].textDensity.replace('_', ' ')} density
      </p>
    </div>
  );
}
