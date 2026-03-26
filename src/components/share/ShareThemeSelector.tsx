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
      <div className="flex gap-3 justify-center">
        {themeList.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-2 transition-all duration-500"
            >
              <div
                style={{
                  width: isActive ? 28 : 22,
                  height: isActive ? 28 : 22,
                  borderRadius: 999,
                  backgroundColor: t.accentHex,
                  boxShadow: isActive
                    ? `0 4px 20px ${t.accentHex}50, 0 0 0 2px rgba(255,255,255,0.06)`
                    : `0 2px 8px ${t.accentHex}15`,
                  transition: 'all 0.5s ease',
                  opacity: isActive ? 1 : 0.5,
                }}
              />
              <span className={cn(
                'text-[8px] font-medium transition-all duration-500',
                isActive ? 'text-white' : 'text-white'
              )}>
                {t.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
