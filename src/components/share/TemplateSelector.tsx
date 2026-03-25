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
      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Bento Cards</span>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {bentoTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onChange(tmpl.id)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all min-w-[72px]',
              selected === tmpl.id
                ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_16px_-4px_hsl(43_74%_52%/0.2)]'
                : 'border-white/[0.06] text-foreground/60 hover:border-white/[0.12] bg-card/30'
            )}
          >
            {ICONS[tmpl.id]}
            <span className="text-[10px] font-medium whitespace-nowrap">{tmpl.label}</span>
          </button>
        ))}
      </div>

      <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Classic</span>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {legacyTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onChange(tmpl.id)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all min-w-[72px]',
              selected === tmpl.id
                ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/20 shadow-[0_0_16px_-4px_hsl(43_74%_52%/0.2)]'
                : 'border-white/[0.06] text-foreground/60 hover:border-white/[0.12] bg-card/30'
            )}
          >
            {ICONS[tmpl.id]}
            <span className="text-[10px] font-medium whitespace-nowrap">{tmpl.label}</span>
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-foreground/45">
        {TEMPLATE_REGISTRY.find(t => t.id === selected)?.description} · Best for {TEMPLATE_REGISTRY.find(t => t.id === selected)?.bestFor.join(', ')}
      </p>
    </div>
  );
}
