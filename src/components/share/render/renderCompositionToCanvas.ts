/**
 * Deterministic Canvas Renderer.
 *
 * Renders a CompositionSpec + NormalizedShareContent directly to a
 * <canvas> element at exact export dimensions. No DOM capture, no
 * html2canvas, no post-crop/pad.
 *
 * This is the CANONICAL export path.
 */

import type { CompositionSpec, PanelSpec } from '../composition/computeCompositionSpec';
import type { NormalizedShareContent } from '../composition/normalizeShareContent';
import type { ThemeDefinition, SponsorData } from '@/services/shareService';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';

// ─── Helpers ──────────────────────────────────────────────────────────

function parseGradient(gradient: string): string[] {
  // Extract color stops from CSS gradient string
  const colorMatches = gradient.match(/hsl[a]?\([^)]+\)/g);
  return colorMatches || ['#0a0a0f', '#0d0d14', '#111118'];
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPanelBackground(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  glowColor?: string,
) {
  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);

  // Glass background
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  grad.addColorStop(0, 'rgba(20, 22, 35, 0.82)');
  grad.addColorStop(1, 'rgba(16, 18, 28, 0.76)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Glow shadow
  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = 'transparent';
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

/** Wrap text into lines that fit within maxWidth */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) break;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // Add ellipsis to last line if we truncated
  if (lines.length >= maxLines && words.length > 0) {
    const lastLine = lines[lines.length - 1];
    const remaining = text.slice(lines.join(' ').length).trim();
    if (remaining) {
      lines[lines.length - 1] = lastLine + '…';
    }
  }

  return lines;
}

// ─── Panel Renderers ──────────────────────────────────────────────────

function drawMediaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  img: HTMLImageElement | null,
) {
  if (!panel.visible || !img) return;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  ctx.clip();

  // Draw image with cover fit
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const panelAspect = panel.width / panel.height;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > panelAspect) {
    // Image wider than panel — crop sides
    sw = img.naturalHeight * panelAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // Image taller — crop top/bottom
    sh = img.naturalWidth / panelAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, panel.x, panel.y, panel.width, panel.height);

  // Image count badge
  if (content.showImageCountBadge && content.mediaCount > 1) {
    const badgeText = `+${content.mediaCount - 1}`;
    ctx.font = `600 ${20}px ${FONT_FAMILY}`;
    const bw = ctx.measureText(badgeText).width + 20;
    const bh = 32;
    const bx = panel.x + panel.width - bw - 16;
    const by = panel.y + 16;

    drawRoundedRect(ctx, bx, by, bw, bh, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText(badgeText, bx + 10, by + 22);
  }

  ctx.restore();
}

function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  content: NormalizedShareContent,
  img: HTMLImageElement | null,
) {
  if (!img || content.imageTreatment !== 'background') return;

  ctx.save();

  // Draw blurred background (simulated with scaling)
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = spec.width / spec.height;
  let dx = 0, dy = 0, dw = spec.width, dh = spec.height;

  if (imgAspect > canvasAspect) {
    dw = spec.height * imgAspect;
    dx = (spec.width - dw) / 2;
  } else {
    dh = spec.width / imgAspect;
    dy = (spec.height - dh) / 2;
  }

  // Scale slightly larger for blur simulation
  const scale = 1.15;
  const sdw = dw * scale;
  const sdh = dh * scale;
  const sdx = dx - (sdw - dw) / 2;
  const sdy = dy - (sdh - dh) / 2;

  ctx.filter = 'blur(20px) brightness(0.4) saturate(1.2)';
  ctx.drawImage(img, sdx, sdy, sdw, sdh);
  ctx.filter = 'none';

  // Overlay gradient
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  overlayGrad.addColorStop(0, `rgba(6, 6, 12, 0.4)`);
  overlayGrad.addColorStop(0.5, `rgba(6, 6, 12, ${spec.backgroundOverlayOpacity})`);
  overlayGrad.addColorStop(1, `rgba(6, 6, 12, 0.8)`);
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  ctx.restore();
}

function drawInsightPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible || !content.aiInsight) return;

  drawPanelBackground(ctx, panel, spec.panelRadius, 'rgba(200, 170, 80, 0.06)');

  const pad = 24;
  const theme = content.theme;

  // Label bar
  ctx.save();
  // Accent bar
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.7;
  drawRoundedRect(ctx, panel.x + pad, panel.y + pad, 6, 20, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  // "AI Insight" label
  ctx.font = `700 ${14}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.85;
  ctx.letterSpacing = '2px';
  ctx.fillText('AI INSIGHT', panel.x + pad + 14, panel.y + pad + 16);
  ctx.globalAlpha = 1;

  // ── Heading-to-body gap (universal spacing token) ──
  const insightHeadingGap = 20;

  // Insight text
  const fontSize = spec.typography.insightFontSize;
  ctx.font = `italic 400 ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(200, 205, 215)';

  const textX = panel.x + pad;
  const textMaxW = panel.width - pad * 2;
  const lineH = fontSize * spec.typography.insightLineHeight;
  const lines = wrapText(ctx, content.aiInsight, textMaxW, spec.typography.insightMaxLines);

  // pad(24) + labelHeight(20) + insightHeadingGap(20) + fontSize offset
  let textY = panel.y + pad + 20 + insightHeadingGap + fontSize;
  for (const line of lines) {
    ctx.fillText(line, textX, textY);
    textY += lineH;
  }

  ctx.restore();
}

function drawTextPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible) return;

  drawPanelBackground(ctx, panel, spec.panelRadius);

  const pad = 24;
  const theme = content.theme;

  ctx.save();

  // Title
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `600 ${titleSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.headlineHex;

  const textMaxW = panel.width - pad * 2;
  const titleLines = wrapText(ctx, content.title, textMaxW, spec.typography.titleMaxLines);
  const titleLineH = titleSize * spec.typography.titleLineHeight;

  let cursorY = panel.y + pad + titleSize;
  for (const line of titleLines) {
    ctx.fillText(line, panel.x + pad, cursorY);
    cursorY += titleLineH;
  }

  // Subtitle
  if (content.subtitle) {
    cursorY += 8;
    const subSize = spec.typography.subtitleFontSize;
    ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(140, 145, 155)';

    const subLines = wrapText(ctx, content.subtitle, textMaxW, spec.typography.subtitleMaxLines);
    const subLineH = subSize * spec.typography.subtitleLineHeight;

    for (const line of subLines) {
      ctx.fillText(line, panel.x + pad, cursorY);
      cursorY += subLineH;
    }
  }

  ctx.restore();
}

function drawMomentumPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible) return;

  drawPanelBackground(ctx, panel, spec.panelRadius, content.statValue ? 'rgba(200, 170, 80, 0.05)' : undefined);

  const pad = 20;
  const theme = content.theme;

  ctx.save();

  // Stat value — stacked vertically, never side-by-side with label
  if (content.statValue) {
    const displayStat = content.showNumbers ? content.statValue : '•••';
    // Dynamic font scaling: shrink stat for long values
    let statSize = spec.typography.statFontSize;
    if (displayStat.length > 6) statSize = Math.round(statSize * 0.7);
    else if (displayStat.length > 4) statSize = Math.round(statSize * 0.85);

    ctx.font = `700 ${statSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = theme.accentHex;

    // Position stat value at top of panel
    const statY = panel.y + pad + statSize * 0.8;
    ctx.fillText(displayStat, panel.x + pad, statY, panel.width - pad * 2);

    // Stat label — BELOW stat value, on its own line
    if (content.statLabel) {
      const labelSize = 14;
      const labelGap = 6;
      ctx.font = `600 ${labelSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = 'rgb(128, 132, 142)';
      const labelY = statY + labelGap + labelSize;
      ctx.fillText(content.statLabel.toUpperCase(), panel.x + pad, labelY, panel.width - pad * 2);
    }
  }

  // Phrase — at the bottom with safe padding
  const phraseSize = spec.typography.phraseFontSize;
  ctx.font = `italic 500 ${phraseSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.6;
  ctx.fillText(content.phrase.toUpperCase(), panel.x + pad, panel.y + panel.height - pad, panel.width - pad * 2);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawMetaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible) return;

  drawPanelBackground(ctx, panel, spec.panelRadius);

  const pad = 20;
  const theme = content.theme;

  ctx.save();

  // Card type label
  const metaSize = spec.typography.metaFontSize;
  ctx.font = `700 ${metaSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.75;
  ctx.fillText(content.cardTypeLabel.toUpperCase(), panel.x + pad, panel.y + pad + metaSize);
  ctx.globalAlpha = 1;

  // Time anchor
  if (content.timeAnchor) {
    ctx.font = `400 ${metaSize - 2}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(128, 132, 142)';
    ctx.fillText(content.timeAnchor, panel.x + pad, panel.y + pad + metaSize + metaSize + 4);
  }

  // Domain
  if (content.domain) {
    const domainY = content.timeAnchor
      ? panel.y + pad + metaSize * 3 + 8
      : panel.y + pad + metaSize * 2 + 4;
    ctx.font = `400 ${14}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(100, 105, 115)';
    ctx.fillText(content.domain.toUpperCase(), panel.x + pad, domainY);
  }

  ctx.restore();
}

function drawBrandPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible) return;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);

  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  grad.addColorStop(0, 'rgba(18, 20, 30, 0.8)');
  grad.addColorStop(1, 'rgba(14, 16, 24, 0.72)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // LS icon
  const iconSize = 36;
  const iconX = panel.x + panel.width / 2 - 80;
  const iconY = panel.y + (panel.height - iconSize) / 2;

  drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 10);
  const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
  iconGrad.addColorStop(0, 'hsl(43, 74%, 55%)');
  iconGrad.addColorStop(1, 'hsl(43, 65%, 38%)');
  ctx.fillStyle = iconGrad;
  ctx.fill();

  ctx.font = `800 ${12}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(14, 16, 24)';
  ctx.textAlign = 'center';
  ctx.fillText('LS', iconX + iconSize / 2, iconY + iconSize / 2 + 4);
  ctx.textAlign = 'left';

  // "Posted from LifeStack"
  const brandSize = spec.typography.brandFontSize;
  ctx.font = `500 ${brandSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(110, 115, 128)';
  const textX = iconX + iconSize + 12;
  const textY = panel.y + panel.height / 2 + brandSize / 3;
  ctx.fillText('Posted from ', textX, textY);

  const postedW = ctx.measureText('Posted from ').width;
  ctx.font = `600 ${brandSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = content.theme.accentHex;
  ctx.fillText('LifeStack', textX + postedW, textY);

  ctx.restore();
}

function drawSponsorPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
) {
  if (!panel.visible || !content.sponsor) return;

  const sponsor = content.sponsor;
  const pad = 20;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);

  // Subtle glass background with slight gold tint
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  grad.addColorStop(0, 'rgba(22, 24, 36, 0.78)');
  grad.addColorStop(1, 'rgba(18, 20, 30, 0.72)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Thin accent border
  ctx.strokeStyle = 'rgba(200, 170, 80, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Attribution prefix
  const prefixMap: Record<string, string> = {
    sponsored: 'Sponsored by',
    powered: 'Powered by',
    partnership: 'In partnership with',
    rewards: 'Rewards by',
    productivity: 'Productivity partner:',
  };
  const prefix = prefixMap[sponsor.attributionType || 'sponsored'] || 'Sponsored by';

  // Left side: attribution text
  const textX = panel.x + pad;
  const centerY = panel.y + panel.height / 2;

  // Attribution line
  ctx.font = `500 ${14}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(100, 105, 118)';
  ctx.fillText(prefix, textX, centerY - 2);

  const prefixW = ctx.measureText(prefix).width;
  ctx.font = `600 ${15}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(180, 175, 165)';
  ctx.fillText(` ${sponsor.name}`, textX + prefixW, centerY - 2);

  // Message / CTA on second line if present
  const tagline = sponsor.message || sponsor.cta;
  if (tagline) {
    ctx.font = `400 ${12}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(90, 95, 108)';
    const maxW = panel.width - pad * 2;
    const clipped = tagline.length > 60 ? tagline.slice(0, 59) + '…' : tagline;
    ctx.fillText(clipped, textX, centerY + 16, maxW);
  }

  ctx.restore();
}

// ─── Main Background ─────────────────────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
) {
  // Parse and draw the background gradient
  const colors = parseGradient(theme.bgGradient);

  if (colors.length >= 2) {
    const grad = ctx.createLinearGradient(
      spec.width * 0.2, 0,
      spec.width * 0.8, spec.height,
    );
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#0a0a0f';
  }

  ctx.fillRect(0, 0, spec.width, spec.height);

  // Subtle radial highlight
  const radGrad = ctx.createRadialGradient(
    spec.width * 0.2, spec.height * 0.2, 0,
    spec.width * 0.2, spec.height * 0.2, spec.width * 0.6,
  );
  radGrad.addColorStop(0, 'rgba(200, 170, 80, 0.03)');
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);
}

// ─── Main Render Function ─────────────────────────────────────────────

export async function renderCompositionToCanvas(
  spec: CompositionSpec,
  content: NormalizedShareContent,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Wait for fonts
  if ('fonts' in document) {
    try { await (document as any).fonts.ready; } catch { /* continue */ }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Load media image if needed
  let mediaImg: HTMLImageElement | null = null;
  if (content.hasMedia && content.mediaUrl) {
    try {
      mediaImg = await loadImage(content.mediaUrl);
    } catch {
      // Continue without media
    }
  }

  // 1. Background
  drawBackground(ctx, spec, content.theme);

  // 2. Background image (if background treatment)
  if (content.imageTreatment === 'background') {
    drawBackgroundImage(ctx, spec, content, mediaImg);
  }

  // 3. Panels (in z-order)
  const panelDrawOrder: [PanelSpec, (ctx: CanvasRenderingContext2D, panel: PanelSpec) => void][] = [
    [spec.panels.media, (c, p) => drawMediaPanel(c, p, content, spec, content.imageTreatment !== 'background' ? mediaImg : null)],
    [spec.panels.insight, (c, p) => drawInsightPanel(c, p, content, spec)],
    [spec.panels.text, (c, p) => drawTextPanel(c, p, content, spec)],
    [spec.panels.momentum, (c, p) => drawMomentumPanel(c, p, content, spec)],
    [spec.panels.meta, (c, p) => drawMetaPanel(c, p, content, spec)],
    [spec.panels.sponsor, (c, p) => drawSponsorPanel(c, p, content, spec)],
    [spec.panels.brand, (c, p) => drawBrandPanel(c, p, content, spec)],
  ];

  // Sort by z-index
  panelDrawOrder.sort((a, b) => a[0].zIndex - b[0].zIndex);

  for (const [panel, draw] of panelDrawOrder) {
    if (panel.visible) {
      draw(ctx, panel);
    }
  }

  return canvas;
}
