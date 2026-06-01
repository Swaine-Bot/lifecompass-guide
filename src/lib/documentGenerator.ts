/**
 * Client-side document generation. No server, no API keys.
 * Outputs are triggered as direct browser downloads. Each function returns
 * { filename, blob } so callers can also feed them to Web Share API if desired.
 */
import jsPDF from 'jspdf';

export type DocFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'md';

export interface DocSource {
  title: string;
  /** Full content as plain text or markdown. Headings become slide/section breaks. */
  content: string;
  /** Optional subtitle / context tag. */
  subtitle?: string;
}

interface DocResult {
  filename: string;
  blob: Blob;
}

const sanitize = (s: string) =>
  s.replace(/[^a-zA-Z0-9-_]+/g, '_').slice(0, 60) || 'document';

const stripMd = (s: string) =>
  s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_>#]/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// ── PDF ────────────────────────────────────────────────────────────────
export function generatePdf(src: DocSource): DocResult {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const usable = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(doc.splitTextToSize(src.title, usable), margin, margin + 6);

  if (src.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(src.subtitle, margin, margin + 30);
    doc.setTextColor(0);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const body = stripMd(src.content);
  const lines = doc.splitTextToSize(body, usable);
  let y = margin + 60;
  const lineHeight = 16;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const blob = doc.output('blob');
  return { filename: `${sanitize(src.title)}.pdf`, blob };
}

// ── DOCX ───────────────────────────────────────────────────────────────
export async function generateDocx(src: DocSource): Promise<DocResult> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx');
  const children: any[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: src.title, bold: true })],
    }),
  ];
  if (src.subtitle) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: src.subtitle, italics: true, color: '666666' })] }),
    );
  }
  children.push(new Paragraph({ text: '' }));

  for (const rawLine of src.content.split(/\n/)) {
    const line = rawLine.trimEnd();
    if (!line) { children.push(new Paragraph({ text: '' })); continue; }
    if (/^#{1,2}\s/.test(line)) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: line.replace(/^#{1,2}\s/, '') }));
    } else if (/^#{3,6}\s/.test(line)) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: line.replace(/^#{3,6}\s/, '') }));
    } else if (/^\s*[-•*]\s/.test(line)) {
      children.push(new Paragraph({ text: line.replace(/^\s*[-•*]\s/, ''), bullet: { level: 0 } }));
    } else if (/^\s*\d+\.\s/.test(line)) {
      children.push(new Paragraph({ text: line.replace(/^\s*\d+\.\s/, ''), numbering: { reference: 'nums', level: 0 } as any }));
    } else {
      children.push(new Paragraph({ text: stripMd(line) }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  return { filename: `${sanitize(src.title)}.docx`, blob };
}

// ── XLSX (one row per non-empty line; bullets/numbered as separate column) ──
export async function generateXlsx(src: DocSource): Promise<DocResult> {
  const XLSX = await import('xlsx');
  const rows: any[][] = [['Section', 'Content']];
  let section = src.title;
  for (const rawLine of src.content.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^#{1,6}\s/.test(line)) { section = line.replace(/^#{1,6}\s/, ''); continue; }
    rows.push([section, stripMd(line)]);
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 24 }, { wch: 80 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plan');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return { filename: `${sanitize(src.title)}.xlsx`, blob };
}

// ── PPTX (one slide per H1/H2; bullets within) ─────────────────────────
export async function generatePptx(src: DocSource): Promise<DocResult> {
  const pptxgen = (await import('pptxgenjs')).default;
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  // Title slide
  const cover = pres.addSlide();
  cover.background = { color: '0F172A' };
  cover.addText(src.title, {
    x: 0.6, y: 2.6, w: 12, h: 1.6,
    fontSize: 44, bold: true, color: 'FFFFFF', fontFace: 'Helvetica', align: 'left',
  });
  if (src.subtitle) {
    cover.addText(src.subtitle, {
      x: 0.6, y: 4.1, w: 12, h: 0.6,
      fontSize: 18, color: 'D4AF37', fontFace: 'Helvetica', align: 'left',
    });
  }

  // Parse content into sections
  type Section = { title: string; bullets: string[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const rawLine of src.content.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^#{1,3}\s/.test(line)) {
      if (current) sections.push(current);
      current = { title: line.replace(/^#{1,3}\s/, ''), bullets: [] };
    } else if (/^\s*[-•*\d.]+\s/.test(line)) {
      if (!current) current = { title: 'Key Points', bullets: [] };
      current.bullets.push(stripMd(line.replace(/^\s*[-•*]\s|^\s*\d+\.\s/, '')));
    } else {
      if (!current) current = { title: 'Overview', bullets: [] };
      current.bullets.push(stripMd(line));
    }
  }
  if (current) sections.push(current);
  if (!sections.length) sections.push({ title: 'Summary', bullets: [stripMd(src.content).slice(0, 400)] });

  for (const sec of sections) {
    const s = pres.addSlide();
    s.background = { color: '0B0F1A' };
    s.addText(sec.title, {
      x: 0.6, y: 0.5, w: 12, h: 0.9,
      fontSize: 28, bold: true, color: 'FFFFFF', fontFace: 'Helvetica',
    });
    s.addShape(pres.ShapeType.line, {
      x: 0.6, y: 1.45, w: 1.8, h: 0, line: { color: 'D4AF37', width: 2 },
    });
    s.addText(
      sec.bullets.slice(0, 8).map(b => ({ text: b, options: { bullet: true, color: 'F8FAFC' } })),
      { x: 0.6, y: 1.8, w: 12, h: 5.2, fontSize: 18, fontFace: 'Helvetica', valign: 'top' },
    );
    s.addText('LifeStack', { x: 11.6, y: 7.0, w: 1.2, h: 0.3, fontSize: 10, color: '6B7280', align: 'right' });
  }

  const blob = (await pres.write({ outputType: 'blob' })) as Blob;
  return { filename: `${sanitize(src.title)}.pptx`, blob };
}

// ── Plain text + Markdown ──────────────────────────────────────────────
export function generateTxt(src: DocSource): DocResult {
  const body = `${src.title}\n${'='.repeat(src.title.length)}\n${src.subtitle ? src.subtitle + '\n\n' : '\n'}${stripMd(src.content)}\n`;
  return { filename: `${sanitize(src.title)}.txt`, blob: new Blob([body], { type: 'text/plain' }) };
}
export function generateMd(src: DocSource): DocResult {
  const body = `# ${src.title}\n${src.subtitle ? `\n_${src.subtitle}_\n` : ''}\n${src.content}\n`;
  return { filename: `${sanitize(src.title)}.md`, blob: new Blob([body], { type: 'text/markdown' }) };
}

// ── Unified entry ──────────────────────────────────────────────────────
export async function generateDocument(format: DocFormat, src: DocSource): Promise<DocResult> {
  switch (format) {
    case 'pdf': return generatePdf(src);
    case 'docx': return generateDocx(src);
    case 'pptx': return generatePptx(src);
    case 'xlsx': return generateXlsx(src);
    case 'md': return generateMd(src);
    case 'txt':
    default: return generateTxt(src);
  }
}

export async function downloadDocument(format: DocFormat, src: DocSource) {
  const { filename, blob } = await generateDocument(format, src);
  triggerDownload(blob, filename);
  return { filename, blob };
}

/** Best-effort native share; falls back to download if Web Share unsupported. */
export async function shareDocument(format: DocFormat, src: DocSource) {
  const { filename, blob } = await generateDocument(format, src);
  const file = new File([blob], filename, { type: blob.type });
  const navAny = navigator as any;
  if (navAny.canShare?.({ files: [file] }) && navAny.share) {
    try {
      await navAny.share({ files: [file], title: src.title, text: src.subtitle || src.title });
      return { filename, blob, method: 'share' as const };
    } catch {
      /* user canceled; fall through to download */
    }
  }
  triggerDownload(blob, filename);
  return { filename, blob, method: 'download' as const };
}
