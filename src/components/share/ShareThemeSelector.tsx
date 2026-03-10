import { cn } from '@/lib/utils';
import { ShareTheme } from '@/services/shareService';

interface ShareThemeSelectorProps {
  theme: ShareTheme;
  onChange: (theme: ShareTheme) => void;
}

const themes: { id: ShareTheme; label: string; colors: string[] }[] = [
  { id: 'executive', label: 'Executive', colors: ['hsl(43,74%,52%)', 'hsl(220,20%,8%)'] },
  { id: 'warrior', label: 'Warrior', colors: ['hsl(0,70%,50%)', 'hsl(0,15%,8%)'] },
  { id: 'minimal', label: 'Minimal', colors: ['hsl(0,0%,92%)', 'hsl(220,20%,5%)'] },
  { id: 'cinematic', label: 'Cinematic', colors: ['hsl(260,50%,60%)', 'hsl(260,20%,8%)'] },
];

export function ShareThemeSelector({ theme, onChange }: ShareThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
      <div className="grid grid-cols-4 gap-2">
        {themes.map((t) => (
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
            <div className="flex gap-0.5">
              {t.colors.map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-border/30" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className={cn(
              'text-[9px] font-medium',
              theme === t.id ? 'text-primary' : 'text-muted-foreground'
            )}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
