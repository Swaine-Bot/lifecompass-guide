import { cn } from '@/lib/utils';
import { ShareTheme, THEMES } from '@/services/shareService';

interface ShareThemeSelectorProps {
  theme: ShareTheme;
  onChange: (theme: ShareTheme) => void;
}

const themeList = Object.values(THEMES);

export function ShareThemeSelector({ theme, onChange }: ShareThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
      <div className="grid grid-cols-5 gap-1.5">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all',
              theme === t.id
                ? 'border-primary bg-primary/10'
                : 'border-border/50 hover:border-border'
            )}
          >
            <div
              className="w-6 h-6 rounded-full border border-border/30 shadow-inner"
              style={{ backgroundColor: t.accentHex }}
            />
            <span className={cn(
              'text-[8px] font-medium leading-tight text-center',
              theme === t.id ? 'text-primary' : 'text-muted-foreground'
            )}>
              {t.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
