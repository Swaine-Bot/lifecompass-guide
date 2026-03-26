import { cn } from '@/lib/utils';
import { TEMPLATE_REGISTRY, type ShareTemplateName } from './templates';
import { LayoutTemplate, BookOpen, Type, TrendingUp, Camera, Heart, LayoutGrid, Columns, Sparkles, Minus } from 'lucide-react';

interface TemplateSelectorProps {
  selected: ShareTemplateName;
  onChange: (template: ShareTemplateName) => void;
}

const ICONS: Record<ShareTemplateName, React.ReactNode> = {
  bento_hero: <LayoutGrid className="w-4 h-4" />,
  bento_split: <Columns className="w-4 h-4" />,
  bento_reflection: <Sparkles className="w-4 h-4" />,
  bento_minimal: <Minus className="w-4 h-4" />,
  classic: <LayoutTemplate className="w-4 h-4" />,
  story: <BookOpen className="w-4 h-4" />,
  minimal: <Type className="w-4 h-4" />,
  momentum: <TrendingUp className="w-4 h-4" />,
  media_spotlight: <Camera className="w-4 h-4" />,
  reflection: <Heart className="w-4 h-4" />,
};

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const bentoTemplates = TEMPLATE_REGISTRY.filter(t => t.isBento);
  const legacyTemplates = TEMPLATE_REGISTRY.filter(t => !t.isBento);

  return (
    <div className="space-y-4">
      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Bento Cards</span>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {bentoTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onChange(tmpl.id)}
            className={cn(
              'studio-option-pill flex-shrink-0 flex flex-col items-center gap-1.5 p-3.5 transition-all min-w-[72px]',
              selected === tmpl.id && 'active'
            )}
          >
            <span className={selected === tmpl.id ? 'text-primary' : 'text-white/40'}>{ICONS[tmpl.id]}</span>
            <span className={cn(
              'text-[10px] font-medium whitespace-nowrap',
              selected === tmpl.id ? 'text-primary' : 'text-white/40'
            )}>{tmpl.label}</span>
          </button>
        ))}
      </div>

      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Classic</span>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {legacyTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onChange(tmpl.id)}
            className={cn(
              'studio-option-pill flex-shrink-0 flex flex-col items-center gap-1.5 p-3.5 transition-all min-w-[72px]',
              selected === tmpl.id && 'active'
            )}
          >
            <span className={selected === tmpl.id ? 'text-primary' : 'text-white/40'}>{ICONS[tmpl.id]}</span>
            <span className={cn(
              'text-[10px] font-medium whitespace-nowrap',
              selected === tmpl.id ? 'text-primary' : 'text-white/40'
            )}>{tmpl.label}</span>
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-white/20">
        {TEMPLATE_REGISTRY.find(t => t.id === selected)?.description} · Best for {TEMPLATE_REGISTRY.find(t => t.id === selected)?.bestFor.join(', ')}
      </p>
    </div>
  );
}
