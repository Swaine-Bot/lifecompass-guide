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
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</span>
      <div className="grid grid-cols-5 gap-1.5">
        {formats.map((f) => {
          const dim = FORMAT_DIMENSIONS[f];
          const ratio = dim.w / dim.h;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all',
                format === f
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-border'
              )}
            >
              <div
                className={cn(
                  'rounded border',
                  format === f ? 'border-primary bg-primary/20' : 'border-border/50 bg-secondary/50'
                )}
                style={{ width: 20, height: 20 / ratio }}
              />
              <span className="text-[8px] font-medium">{formatLabels[f]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
