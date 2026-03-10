import { cn } from '@/lib/utils';
import { ShareFormat, FORMAT_DIMENSIONS } from '@/services/shareService';

interface ShareFormatSelectorProps {
  format: ShareFormat;
  onChange: (format: ShareFormat) => void;
}

const formats: ShareFormat[] = ['square', 'feed', 'story', 'linkedin'];

export function ShareFormatSelector({ format, onChange }: ShareFormatSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</span>
      <div className="grid grid-cols-4 gap-2">
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
                style={{ width: 24, height: 24 / ratio }}
              />
              <span className="text-[9px] font-medium capitalize">{f}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
