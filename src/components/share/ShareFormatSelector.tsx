import { cn } from '@/lib/utils';
import { ShareFormat, FORMAT_DIMENSIONS } from '@/services/shareService';

interface ShareFormatSelectorProps {
  format: ShareFormat;
  onChange: (format: ShareFormat) => void;
}

const formats: ShareFormat[] = ['square', 'feed', 'story', 'linkedin', 'tiktok'];

const formatLabels: Record<ShareFormat, string> = {
  square: 'Square',
  feed: 'Feed',
  story: 'Story',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
};

export function ShareFormatSelector({ format, onChange }: ShareFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Format</span>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {formats.map((f) => {
          const dim = FORMAT_DIMENSIONS[f];
          const ratio = dim.w / dim.h;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={cn(
                'studio-option-pill flex flex-col items-center gap-1.5 p-2.5 transition-all',
                format === f && 'active'
              )}
            >
              <div
                style={{
                  width: 20, height: 20 / ratio,
                  borderRadius: 4,
                  background: format === f ? 'rgba(200,160,60,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${format === f ? 'rgba(200,160,60,0.2)' : 'rgba(255,255,255,0.03)'}`,
                }}
              />
              <span className={cn(
                'text-[8px] font-medium',
                format === f ? 'text-primary' : 'text-white/35'
              )}>{formatLabels[f]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
