/**
 * Deterministic Canvas Renderer — Unified Environment Edition.
 *
 * Renders a CompositionSpec + NormalizedShareContent directly to a
 * <canvas> element at exact export dimensions. No DOM capture, no
 * html2canvas, no post-crop/pad.
 *
 * Uses the shared EnvironmentTone system so card backgrounds match
 * the Share Studio atmosphere.
 */

import type { CompositionSpec, PanelSpec } from '../composition/computeCompositionSpec';
import type { NormalizedShareContent } from '../composition/normalizeShareContent';
import type { ThemeDefinition, SponsorData } from '@/services/shareService';
import { getEnvironmentTone, type EnvironmentTone } from '../environmentTone';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const SERIF_FAMILY = '"Playfair Display", Georgia, serif';

// ─── Helpers ──────────────────────────────────────────────────────────

function parseGradient(gradient: string): string[] {
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

type PanelTier = 'hero' | 'secondary' | 'tertiary';

function drawPanelBackground(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  envTone: EnvironmentTone,
  tier: PanelTier = 'secondary',
  glowColor?: string,
) {
  ctx.save();

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;

  // Soft depth shadow — objects in environment
  const shadowAlpha = tier === 'hero' ? 0.35 : tier === 'secondary' ? 0.2 : 0.12;
  const shadowBlur = tier === 'hero' ? 32 : tier === 'secondary' ? 18 : 10;
  ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetY = tier === 'hero' ? 6 : 3;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  ctx.fillStyle = 'rgba(10, 12, 20, 0.4)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Material fill — environment-tinted glass
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const baseAlpha = tier === 'hero' ? 0.92 : tier === 'secondary' ? 0.84 : 0.72;
  const baseR = Math.round(22 + tr * ta * 2);
  const baseG = Math.round(24 + tg * ta * 2);
  const baseB = Math.round(42 + tb * ta * 2);

  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width * 0.3, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${baseR + 8}, ${baseG + 8}, ${baseB + 10}, ${baseAlpha})`);
  grad.addColorStop(0.5, `rgba(${baseR + 4}, ${baseG + 4}, ${baseB + 4}, ${baseAlpha - 0.06})`);
  grad.addColorStop(1, `rgba(${baseR}, ${baseG}, ${baseB}, ${baseAlpha - 0.1})`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Inner luminance — simulating environment key light
  const glowAlpha = tier === 'hero' ? 0.055 : tier === 'secondary' ? 0.03 : 0.018;
  const innerGlow = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height * 0.35);
  innerGlow.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
  innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerGlow;
  ctx.fill();

  // Subtle edge — reduced for sculpted feel
  const edgeAlpha = tier === 'hero' ? 0.1 : tier === 'secondary' ? 0.06 : 0.035;
  ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Ambient glow from environment
  if (tier === 'hero' || glowColor) {
    const gc = glowColor || `rgba(${tr}, ${tg}, ${tb}, 0.06)`;
    ctx.shadowColor = gc;
    ctx.shadowBlur = tier === 'hero' ? 28 : 16;
    ctx.shadowOffsetY = tier === 'hero' ? 4 : 2;
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

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const panelAspect = panel.width / panel.height;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > panelAspect) {
    sw = img.naturalHeight * panelAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / panelAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, panel.x, panel.y, panel.width, panel.height);

  // Cinematic vignette on media
  const vignette = ctx.createRadialGradient(
    panel.x + panel.width / 2, panel.y + panel.height / 2,
    Math.min(panel.width, panel.height) * 0.3,
    panel.x + panel.width / 2, panel.y + panel.height / 2,
    Math.max(panel.width, panel.height) * 0.7,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = vignette;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  // Image count badge
  if (content.showImageCountBadge && content.mediaCount > 1) {
    const badgeText = `+${content.mediaCount - 1}`;
    ctx.font = `600 ${20}px ${FONT_FAMILY}`;
    const bw = ctx.measureText(badgeText).width + 24;
    const bh = 34;
    const bx = panel.x + panel.width - bw - 16;
    const by = panel.y + 16;

    drawRoundedRect(ctx, bx, by, bw, bh, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(badgeText, bx + 12, by + 23);
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

  const scale = 1.15;
  const sdw = dw * scale;
  const sdh = dh * scale;
  const sdx = dx - (sdw - dw) / 2;
  const sdy = dy - (sdh - dh) / 2;

  ctx.filter = 'blur(20px) brightness(0.35) saturate(1.3)';
  ctx.drawImage(img, sdx, sdy, sdw, sdh);
  ctx.filter = 'none';

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
  envTone: EnvironmentTone,
) {
  if (!panel.visible || !content.aiInsight) return;

  const { r: tr, g: tg, b: tb } = envTone.panelTint;
  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'secondary', `rgba(${tr}, ${tg}, ${tb}, 0.1)`);

  const pad = 24;
  const theme = content.theme;

  ctx.save();

  // Accent bar
  const barGrad = ctx.createLinearGradient(panel.x + pad, panel.y + pad, panel.x + pad, panel.y + pad + 28);
  barGrad.addColorStop(0, theme.accentHex);
  barGrad.addColorStop(1, 'rgba(200,170,80,0.2)');
  ctx.fillStyle = barGrad;
  drawRoundedRect(ctx, panel.x + pad, panel.y + pad, 5, 28, 3);
  ctx.fill();

  // "AI INSIGHT" label
  ctx.font = `700 ${14}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.9;
  ctx.letterSpacing = '2px';
  ctx.fillText('AI INSIGHT', panel.x + pad + 16, panel.y + pad + 18);
  ctx.globalAlpha = 1;

  const insightHeadingGap = 20;
  const headerH = pad + 28 + insightHeadingGap;

  let fontSize = spec.typography.insightFontSize;
  const textX = panel.x + pad;
  const textMaxW = panel.width - pad * 2;
  const availableTextH = panel.height - headerH - pad;

  ctx.font = `italic 400 ${fontSize}px ${FONT_FAMILY}`;
  let lineH = fontSize * spec.typography.insightLineHeight;
  let lines = wrapText(ctx, content.aiInsight, textMaxW, 999);
  let totalH = lines.length * lineH;

  while (totalH > availableTextH && fontSize > 18) {
    fontSize -= 2;
    lineH = fontSize * spec.typography.insightLineHeight;
    ctx.font = `italic 400 ${fontSize}px ${FONT_FAMILY}`;
    lines = wrapText(ctx, content.aiInsight, textMaxW, 999);
    totalH = lines.length * lineH;
  }

  const maxFitLines = Math.max(Math.floor(availableTextH / lineH), 2);
  const finalLines = wrapText(ctx, content.aiInsight, textMaxW, maxFitLines);

  ctx.font = `italic 400 ${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(225, 228, 238)';

  let textY = panel.y + headerH + fontSize;
  for (const line of finalLines) {
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
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'hero');

  const pad = 28;

  ctx.save();

  // Title — serif editorial
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `700 ${titleSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = 'rgb(248, 248, 252)';

  const textMaxW = panel.width - pad * 2;
  const titleLines = wrapText(ctx, content.title, textMaxW, spec.typography.titleMaxLines);
  const titleLineH = titleSize * 1.18;

  let cursorY = panel.y + pad + titleSize;
  for (const line of titleLines) {
    ctx.fillText(line, panel.x + pad, cursorY);
    cursorY += titleLineH;
  }

  // Subtitle
  if (content.subtitle) {
    cursorY += 8;
    let subSize = spec.typography.subtitleFontSize;
    const availableH = panel.y + panel.height - pad - cursorY;

    ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
    let subLines = wrapText(ctx, content.subtitle, textMaxW, 999);
    let subLineH = subSize * spec.typography.subtitleLineHeight;
    let totalTextH = subLines.length * subLineH;

    const minSubSize = 16;
    while (totalTextH > availableH && subSize > minSubSize) {
      subSize -= 2;
      subLineH = subSize * spec.typography.subtitleLineHeight;
      ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
      subLines = wrapText(ctx, content.subtitle, textMaxW, 999);
      totalTextH = subLines.length * subLineH;
    }

    const maxVisibleLines = Math.floor(availableH / subLineH);
    const finalMaxLines = Math.max(maxVisibleLines, 3);
    ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
    const finalLines = wrapText(ctx, content.subtitle, textMaxW, finalMaxLines);
    ctx.fillStyle = 'rgb(212, 214, 228)';

    for (const line of finalLines) {
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
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  const { r: tr, g: tg, b: tb } = envTone.panelTint;
  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'secondary', content.statValue ? `rgba(${tr}, ${tg}, ${tb}, 0.08)` : undefined);

  const pad = 20;
  const theme = content.theme;

  ctx.save();

  const phraseSize = spec.typography.phraseFontSize;
  const phraseReserved = phraseSize + pad;
  const availableForStat = panel.height - pad - phraseReserved;

  let cursorY = panel.y + pad;

  if (content.statValue) {
    const displayStat = content.showNumbers ? content.statValue : '•••';
    let statSize = spec.typography.statFontSize;
    if (displayStat.length > 6) statSize = Math.round(statSize * 0.65);
    else if (displayStat.length > 4) statSize = Math.round(statSize * 0.8);

    const labelSize = 14;
    const labelGap = 10;
    const neededH = statSize * 0.85 + labelGap + labelSize;
    if (neededH > availableForStat && statSize > 24) {
      statSize = Math.max(24, Math.round(statSize * (availableForStat / neededH)));
    }

    ctx.font = `700 ${statSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = theme.accentHex;
    cursorY += statSize * 0.8;
    ctx.fillText(displayStat, panel.x + pad, cursorY, panel.width - pad * 2);

    if (content.statLabel) {
      cursorY += labelGap + labelSize;
      ctx.font = `600 ${labelSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = 'rgb(165, 170, 185)';
      ctx.fillText(content.statLabel.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
    }
  }

  // Phrase — anchored at bottom
  const phraseY = panel.y + panel.height - pad;
  if (phraseY - cursorY > 8) {
    ctx.font = `italic 500 ${phraseSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = theme.accentHex;
    ctx.globalAlpha = 0.75;
    ctx.fillText(content.phrase.toUpperCase(), panel.x + pad, phraseY, panel.width - pad * 2);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawMetaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'tertiary');

  const pad = 20;
  const theme = content.theme;

  ctx.save();

  const metaSize = spec.typography.metaFontSize;
  const lineGap = 10;
  let cursorY = panel.y + pad + metaSize;

  ctx.font = `700 ${metaSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.85;
  ctx.fillText(content.cardTypeLabel.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
  ctx.globalAlpha = 1;

  if (content.timeAnchor) {
    cursorY += metaSize + lineGap;
    ctx.font = `400 ${metaSize - 2}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(160, 165, 180)';
    ctx.fillText(content.timeAnchor, panel.x + pad, cursorY, panel.width - pad * 2);
  }

  if (content.domain) {
    cursorY += (metaSize - 2) + lineGap;
    ctx.font = `500 ${14}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(135, 140, 155)';
    ctx.fillText(content.domain.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
  }

  ctx.restore();
}

function drawBrandPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;
  const bR = Math.round(16 + tr * ta * 1.5);
  const bG = Math.round(18 + tg * ta * 1.5);
  const bB = Math.round(30 + tb * ta * 1.5);

  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${bR + 4}, ${bG + 4}, ${bB + 8}, 0.72)`);
  grad.addColorStop(0.5, `rgba(${bR + 2}, ${bG + 2}, ${bB + 4}, 0.68)`);
  grad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB}, 0.65)`);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // LS icon
  const iconSize = 36;
  const iconX = panel.x + panel.width / 2 - 80;
  const iconY = panel.y + (panel.height - iconSize) / 2;

  drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 9);
  const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
  iconGrad.addColorStop(0, 'hsl(43, 74%, 56%)');
  iconGrad.addColorStop(1, 'hsl(43, 60%, 38%)');
  ctx.fillStyle = iconGrad;
  ctx.fill();

  ctx.shadowColor = 'rgba(200, 164, 106, 0.2)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = iconGrad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.font = `800 ${12}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(14, 16, 24)';
  ctx.textAlign = 'center';
  ctx.fillText('LS', iconX + iconSize / 2, iconY + iconSize / 2 + 4.5);
  ctx.textAlign = 'left';

  const brandSize = spec.typography.brandFontSize;
  const textX = iconX + iconSize + 14;
  const textY = panel.y + panel.height / 2 + brandSize / 3;

  ctx.font = `400 ${brandSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(145, 150, 168)';
  ctx.fillText('Posted from ', textX, textY);

  const postedW = ctx.measureText('Posted from ').width;
  ctx.font = `600 ${brandSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = content.theme.accentHex;
  ctx.globalAlpha = 0.9;
  ctx.fillText('LifeStack', textX + postedW, textY);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawSponsorPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible || !content.sponsor) return;

  const sponsor = content.sponsor;
  const pad = 20;
  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);

  const sR = Math.round(18 + tr * ta * 1.5);
  const sG = Math.round(20 + tg * ta * 1.5);
  const sB = Math.round(32 + tb * ta * 1.5);

  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${sR + 4}, ${sG + 4}, ${sB + 4}, 0.8)`);
  grad.addColorStop(1, `rgba(${sR}, ${sG}, ${sB}, 0.74)`);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = `rgba(${tr}, ${tg}, ${tb}, 0.12)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  const prefixMap: Record<string, string> = {
    sponsored: 'Sponsored by',
    powered: 'Powered by',
    partnership: 'In partnership with',
    rewards: 'Rewards by',
    productivity: 'Productivity partner:',
  };
  const prefix = prefixMap[sponsor.attributionType || 'sponsored'] || 'Sponsored by';

  const textX = panel.x + pad;
  const centerY = panel.y + panel.height / 2;

  ctx.font = `500 ${14}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(130, 135, 150)';
  ctx.fillText(prefix, textX, centerY - 2);

  const prefixW = ctx.measureText(prefix).width;
  ctx.font = `600 ${15}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(210, 205, 195)';
  ctx.fillText(` ${sponsor.name}`, textX + prefixW, centerY - 2);

  const tagline = sponsor.message || sponsor.cta;
  if (tagline) {
    ctx.font = `400 ${12}px ${FONT_FAMILY}`;
    ctx.fillStyle = 'rgb(120, 125, 140)';
    const maxW = panel.width - pad * 2;
    const clipped = tagline.length > 60 ? tagline.slice(0, 59) + '…' : tagline;
    ctx.fillText(clipped, textX, centerY + 16, maxW);
  }

  ctx.restore();
}

// ─── Main Background — Environment-driven ────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
  envTone: EnvironmentTone,
) {
  const colors = parseGradient(theme.bgGradient);

  // Deep base fill
  if (colors.length >= 2) {
    const grad = ctx.createLinearGradient(
      spec.width * 0.1, 0,
      spec.width * 0.9, spec.height,
    );
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#08080d';
  }
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Key light — from environment tone
  const kl = envTone.keyLight;
  const keyGrad = ctx.createRadialGradient(
    spec.width * kl.x, spec.height * kl.y, 0,
    spec.width * kl.x, spec.height * kl.y, spec.width * 0.75,
  );
  keyGrad.addColorStop(0, kl.color);
  keyGrad.addColorStop(0.4, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.03})`));
  keyGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fill light — from environment tone
  const fl = envTone.fillLight;
  const fillGrad = ctx.createRadialGradient(
    spec.width * fl.x, spec.height * fl.y, 0,
    spec.width * fl.x, spec.height * fl.y, spec.width * 0.45,
  );
  fillGrad.addColorStop(0, fl.color);
  fillGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Ambient warmth — center gravity
  const aw = envTone.ambientWarmth;
  const centerGrad = ctx.createRadialGradient(
    spec.width * 0.5, spec.height * 0.4, 0,
    spec.width * 0.5, spec.height * 0.4, spec.width * 0.5,
  );
  centerGrad.addColorStop(0, aw.color);
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fine noise texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.005)';
  for (let i = 0; i < 150; i++) {
    const nx = Math.random() * spec.width;
    const ny = Math.random() * spec.height;
    ctx.fillRect(nx, ny, 1, 1);
  }

  // Edge vignette — environment-driven strength
  const vs = envTone.vignetteStrength;
  const vignetteGrad = ctx.createRadialGradient(
    spec.width / 2, spec.height * 0.42, Math.min(spec.width, spec.height) * 0.3,
    spec.width / 2, spec.height * 0.42, Math.max(spec.width, spec.height) * 0.72,
  );
  vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGrad.addColorStop(0.7, `rgba(0,0,0,${vs * 0.35})`);
  vignetteGrad.addColorStop(1, `rgba(0,0,0,${vs})`);
  ctx.fillStyle = vignetteGrad;
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

  // Resolve environment tone from theme
  const envTone = getEnvironmentTone(content.theme.id);

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

  // 1. Background — environment-driven
  drawBackground(ctx, spec, content.theme, envTone);

  // 2. Background image (if background treatment)
  if (content.imageTreatment === 'background') {
    drawBackgroundImage(ctx, spec, content, mediaImg);
  }

  // 3. Panels (in z-order) — all receive envTone
  const panelDrawOrder: [PanelSpec, (ctx: CanvasRenderingContext2D, panel: PanelSpec) => void][] = [
    [spec.panels.media, (c, p) => drawMediaPanel(c, p, content, spec, content.imageTreatment !== 'background' ? mediaImg : null)],
    [spec.panels.insight, (c, p) => drawInsightPanel(c, p, content, spec, envTone)],
    [spec.panels.text, (c, p) => drawTextPanel(c, p, content, spec, envTone)],
    [spec.panels.momentum, (c, p) => drawMomentumPanel(c, p, content, spec, envTone)],
    [spec.panels.meta, (c, p) => drawMetaPanel(c, p, content, spec, envTone)],
    [spec.panels.sponsor, (c, p) => drawSponsorPanel(c, p, content, spec, envTone)],
    [spec.panels.brand, (c, p) => drawBrandPanel(c, p, content, spec, envTone)],
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
