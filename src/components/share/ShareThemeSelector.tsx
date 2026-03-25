import { cn } from '@/lib/utils';
import { ShareTheme, THEMES } from '@/services/shareService';

interface ShareThemeSelectorProps {
  theme: ShareTheme;
  onChange: (theme: ShareTheme) => void;
}

const themeList = Object.values(THEMES);

export function ShareThemeSelector({ theme, onChange }: ShareThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Theme</span>
      <div className="grid grid-cols-5 gap-1.5">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all',
              theme === t.id
                ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/20'
                : 'border-white/[0.06] hover:border-white/[0.12] bg-card/30'
            )}
          >
            <div
              className="w-7 h-7 rounded-full shadow-inner ring-1 ring-white/[0.08]"
              style={{ backgroundColor: t.accentHex }}
            />
            <span className={cn(
              'text-[8px] font-semibold leading-tight text-center',
              theme === t.id ? 'text-primary' : 'text-foreground/55'
            )}>
              {t.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
