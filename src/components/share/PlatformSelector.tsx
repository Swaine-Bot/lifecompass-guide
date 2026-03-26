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
      <div className="flex gap-1.5">
        {PLATFORM_LIST.map((p) => {
          const profile = PLATFORM_PROFILES[p];
          const isActive = platform === p;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 transition-all duration-400',
                isActive ? 'text-white/70' : 'text-white/18 hover:text-white/35'
              )}
              style={{ borderRadius: 999 }}
            >
              <span className="text-sm">{PLATFORM_ICONS[p]}</span>
              <span className="text-[9px] font-medium">{profile.shortLabel}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-white/15">
        {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height} · {PLATFORM_PROFILES[platform].textDensity.replace('_', ' ')}
      </p>
    </div>
  );
}
