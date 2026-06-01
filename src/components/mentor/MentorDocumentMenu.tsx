/**
 * Generates documents from a mentor message (PPTX / DOCX / XLSX / PDF / MD / TXT).
 * Fully client-side via `lib/documentGenerator.ts` — no server cost.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FileDown, Loader2, FileText, Presentation, Table2, FileType2 } from 'lucide-react';
import { downloadDocument, shareDocument, type DocFormat } from '@/lib/documentGenerator';
import { toast } from 'sonner';

interface Props {
  title?: string;
  content: string;
  subtitle?: string;
}

const FORMATS: { key: DocFormat; label: string; icon: any; desc: string }[] = [
  { key: 'pdf',  label: 'PDF',         icon: FileType2,     desc: 'Universal, print-ready' },
  { key: 'docx', label: 'Word',        icon: FileText,      desc: 'Editable Microsoft Word' },
  { key: 'pptx', label: 'PowerPoint',  icon: Presentation,  desc: 'Slide deck' },
  { key: 'xlsx', label: 'Spreadsheet', icon: Table2,        desc: 'Excel-compatible' },
  { key: 'md',   label: 'Markdown',    icon: FileText,      desc: 'Plain markdown' },
  { key: 'txt',  label: 'Plain text',  icon: FileText,      desc: 'Universal text' },
];

export function MentorDocumentMenu({ title, content, subtitle }: Props) {
  const [busy, setBusy] = useState<DocFormat | null>(null);

  const run = async (format: DocFormat, share: boolean) => {
    if (!content?.trim()) return;
    setBusy(format);
    try {
      const src = {
        title: title?.trim() || 'Mentor Insight',
        subtitle,
        content,
      };
      if (share) await shareDocument(format, src);
      else await downloadDocument(format, src);
      toast.success(`${format.toUpperCase()} ready`);
    } catch (e) {
      console.error(e);
      toast.error('Could not generate document');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs">Download as</DropdownMenuLabel>
        {FORMATS.map(f => {
          const Icon = f.icon;
          return (
            <DropdownMenuItem key={f.key} onSelect={() => run(f.key, false)} disabled={!!busy}>
              <Icon className="w-3.5 h-3.5 mr-2 text-primary/80" />
              <div className="flex-1">
                <p className="text-xs font-medium leading-none">{f.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Share via</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => run('pdf', true)} disabled={!!busy}>
          <FileType2 className="w-3.5 h-3.5 mr-2 text-primary/80" />
          <span className="text-xs">Share as PDF…</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => run('docx', true)} disabled={!!busy}>
          <FileText className="w-3.5 h-3.5 mr-2 text-primary/80" />
          <span className="text-xs">Share as Word…</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
