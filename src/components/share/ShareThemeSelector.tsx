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
      <span className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.15em]">Theme</span>
      <div className="grid grid-cols-5 gap-2">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 transition-all',
              theme === t.id ? 'text-primary' : 'text-white/40 hover:text-white/60'
            )}
            style={{
              borderRadius: 20,
              background: theme === t.id
                ? 'rgba(200,160,60,0.06)' : 'rgba(255,255,255,0.015)',
              border: `1px solid ${theme === t.id
                ? 'rgba(200,160,60,0.12)' : 'rgba(255,255,255,0.025)'}`,
              boxShadow: theme === t.id
                ? '0 0 20px rgba(200,160,60,0.06)' : 'none',
            }}
          >
            <div
              className="w-7 h-7 shadow-inner"
              style={{
                borderRadius: 999,
                backgroundColor: t.accentHex,
                boxShadow: `0 2px 12px ${t.accentHex}30`,
                border: `1px solid rgba(255,255,255,0.08)`,
              }}
            />
            <span className="text-[8px] font-semibold leading-tight text-center">
              {t.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
