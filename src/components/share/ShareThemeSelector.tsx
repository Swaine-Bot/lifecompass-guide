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
      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Theme</span>
      <div className="grid grid-cols-5 gap-2">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'studio-option-pill flex flex-col items-center gap-2 p-3 transition-all',
              theme === t.id && 'active'
            )}
          >
            <div
              className="w-7 h-7"
              style={{
                borderRadius: 999,
                backgroundColor: t.accentHex,
                boxShadow: theme === t.id
                  ? `0 4px 16px ${t.accentHex}40`
                  : `0 2px 8px ${t.accentHex}20`,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <span className={cn(
              'text-[8px] font-semibold leading-tight text-center',
              theme === t.id ? 'text-primary' : 'text-white/40'
            )}>
              {t.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
