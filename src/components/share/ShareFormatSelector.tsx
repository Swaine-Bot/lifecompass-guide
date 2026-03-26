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
      <span className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.15em]">Format</span>
      <div className="grid grid-cols-5 gap-2">
        {formats.map((f) => {
          const dim = FORMAT_DIMENSIONS[f];
          const ratio = dim.w / dim.h;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2.5 transition-all',
                format === f ? 'text-primary' : 'text-white/35 hover:text-white/55'
              )}
              style={{
                borderRadius: 16,
                background: format === f
                  ? 'rgba(200,160,60,0.06)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${format === f
                  ? 'rgba(200,160,60,0.12)' : 'rgba(255,255,255,0.025)'}`,
              }}
            >
              <div
                style={{
                  width: 20, height: 20 / ratio,
                  borderRadius: 3,
                  background: format === f ? 'rgba(200,160,60,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${format === f ? 'rgba(200,160,60,0.2)' : 'rgba(255,255,255,0.04)'}`,
                }}
              />
              <span className="text-[8px] font-medium">{formatLabels[f]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
