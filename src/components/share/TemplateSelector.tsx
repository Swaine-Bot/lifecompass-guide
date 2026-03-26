import { cn } from '@/lib/utils';
import { TEMPLATE_REGISTRY, type ShareTemplateName } from './templates';
import { LayoutTemplate, BookOpen, Type, TrendingUp, Camera, Heart, LayoutGrid, Columns, Sparkles, Minus } from 'lucide-react';

interface TemplateSelectorProps {
  selected: ShareTemplateName;
  onChange: (template: ShareTemplateName) => void;
}

const ICONS: Record<ShareTemplateName, React.ReactNode> = {
  bento_hero: <LayoutGrid className="w-3.5 h-3.5" />,
  bento_split: <Columns className="w-3.5 h-3.5" />,
  bento_reflection: <Sparkles className="w-3.5 h-3.5" />,
  bento_minimal: <Minus className="w-3.5 h-3.5" />,
  classic: <LayoutTemplate className="w-3.5 h-3.5" />,
  story: <BookOpen className="w-3.5 h-3.5" />,
  minimal: <Type className="w-3.5 h-3.5" />,
  momentum: <TrendingUp className="w-3.5 h-3.5" />,
  media_spotlight: <Camera className="w-3.5 h-3.5" />,
  reflection: <Heart className="w-3.5 h-3.5" />,
};

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const bentoTemplates = TEMPLATE_REGISTRY.filter(t => t.isBento);
  const legacyTemplates = TEMPLATE_REGISTRY.filter(t => !t.isBento);

  return (
    <div className="space-y-5">
      <div>
        <span className="text-[8px] font-semibold text-white/18 uppercase tracking-[0.2em]">Bento</span>
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {bentoTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onChange(tmpl.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 transition-all duration-400',
                selected === tmpl.id
                  ? 'text-primary/70'
                  : 'text-white/20 hover:text-white/40'
              )}
              style={{ borderRadius: 999 }}
            >
              {ICONS[tmpl.id]}
              <span className="text-[10px] font-medium whitespace-nowrap">{tmpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[8px] font-semibold text-white/18 uppercase tracking-[0.2em]">Classic</span>
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {legacyTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onChange(tmpl.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 transition-all duration-400',
                selected === tmpl.id
                  ? 'text-primary/70'
                  : 'text-white/20 hover:text-white/40'
              )}
              style={{ borderRadius: 999 }}
            >
              {ICONS[tmpl.id]}
              <span className="text-[10px] font-medium whitespace-nowrap">{tmpl.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-[9px] text-white/15">
        {TEMPLATE_REGISTRY.find(t => t.id === selected)?.description}
      </p>
    </div>
  );
}
