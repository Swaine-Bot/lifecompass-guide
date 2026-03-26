/**
 * Deterministic Canvas Renderer — Environment Dominance Edition.
 *
 * The environment (background + lighting + tone) is the SOURCE OF TRUTH.
 * All surfaces, text, and panels INHERIT from the environment.
 * No independent color systems. No isolated cards.
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

/**
 * Environment-reactive text color.
 * Warms whites when environment is warm, cools when cool.
 */
function envWhite(envTone: EnvironmentTone, alpha: number = 1, tier: 'primary' | 'secondary' | 'meta' = 'primary'): string {
  const { r, g, b, alpha: ta } = envTone.panelTint;
  const warmShift = ta * 1.5; // how much to tint
  
  if (tier === 'primary') {
    const rr = Math.round(248 + r * warmShift * 0.04);
    const gg = Math.round(247 + g * warmShift * 0.02);
    const bb = Math.round(245);
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  if (tier === 'secondary') {
    const rr = Math.round(210 + r * warmShift * 0.05);
    const gg = Math.round(212 + g * warmShift * 0.03);
    const bb = Math.round(218);
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  // meta
  const rr = Math.round(150 + r * warmShift * 0.06);
  const gg = Math.round(155 + g * warmShift * 0.04);
  const bb = Math.round(168);
  return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
}

function drawPanelBackground(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  envTone: EnvironmentTone,
  tier: PanelTier = 'secondary',
) {
  ctx.save();

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;

  // ── TRANSLUCENT GLASS — environment bleeds through ──

  // Single translucent fill — like the Goals page cards
  const fillAlpha = tier === 'hero' ? 0.38 : tier === 'secondary' ? 0.32 : 0.25;
  const tintS = tier === 'hero' ? 4 : tier === 'secondary' ? 3 : 2;
  const bR = Math.round(14 + tr * ta * tintS);
  const bG = Math.round(22 + tg * ta * tintS);
  const bB = Math.round(28 + tb * ta * tintS);

  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${bR + 8}, ${bG + 8}, ${bB + 8}, ${fillAlpha * 0.85})`);
  grad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB}, ${fillAlpha})`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle top luminance edge
  const lumAlpha = tier === 'hero' ? 0.06 : tier === 'secondary' ? 0.04 : 0.025;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const innerLum = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height * 0.15);
  innerLum.addColorStop(0, `rgba(255, 255, 255, ${lumAlpha})`);
  innerLum.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerLum;
  ctx.fill();

  // Thin subtle border — teal-tinted like reference
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  ctx.strokeStyle = `rgba(120, 200, 220, ${tier === 'hero' ? 0.10 : 0.06})`;
  ctx.lineWidth = 1;
  ctx.stroke();

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

  ctx.filter = 'blur(18px) brightness(0.30) saturate(1.4)';
  ctx.drawImage(img, sdx, sdy, sdw, sdh);
  ctx.filter = 'none';

  // Cinematic atmospheric overlay — ensures text legibility
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  overlayGrad.addColorStop(0, `rgba(6, 6, 12, 0.45)`);
  overlayGrad.addColorStop(0.4, `rgba(6, 6, 12, ${spec.backgroundOverlayOpacity * 1.1})`);
  overlayGrad.addColorStop(0.7, `rgba(6, 6, 12, ${Math.min(spec.backgroundOverlayOpacity * 1.2, 0.85)})`);
  overlayGrad.addColorStop(1, `rgba(6, 6, 12, 0.85)`);
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

  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'secondary');

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
  ctx.fillStyle = envWhite(envTone, 1, 'secondary');

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

  // Title — serif editorial, environment-warm white, generous spacing
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `700 ${titleSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 1, 'primary');
  (ctx as any).letterSpacing = '0.5px';

  const textMaxW = panel.width - pad * 2;
  const titleLines = wrapText(ctx, content.title, textMaxW, spec.typography.titleMaxLines);
  const titleLineH = titleSize * 1.22;

  let cursorY = panel.y + pad + titleSize;
  for (const line of titleLines) {
    ctx.fillText(line, panel.x + pad, cursorY);
    cursorY += titleLineH;
  }
  (ctx as any).letterSpacing = '0px';

  // Subtitle
  if (content.subtitle) {
    cursorY += 12;
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
    ctx.fillStyle = envWhite(envTone, 1, 'secondary');

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

  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'secondary');

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
      ctx.fillStyle = envWhite(envTone, 1, 'meta');
      ctx.fillText(content.statLabel.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
    }
  }

  // Phrase — anchored at bottom
  const phraseY = panel.y + panel.height - pad;
  if (phraseY - cursorY > 8) {
    ctx.font = `italic 500 ${phraseSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = theme.accentHex;
    ctx.globalAlpha = 0.7;
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
  ctx.globalAlpha = 0.8;
  ctx.fillText(content.cardTypeLabel.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
  ctx.globalAlpha = 1;

  if (content.timeAnchor) {
    cursorY += metaSize + lineGap;
    ctx.font = `400 ${metaSize - 2}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 1, 'meta');
    ctx.fillText(content.timeAnchor, panel.x + pad, cursorY, panel.width - pad * 2);
  }

  if (content.domain) {
    cursorY += (metaSize - 2) + lineGap;
    ctx.font = `500 ${14}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 0.8, 'meta');
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

  // Brand panel — atmospheric, continuous with the world
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, Math.min(spec.panelRadius, panel.height / 2));

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;
  const bR = Math.round(14 + tr * ta * 3);
  const bG = Math.round(16 + tg * ta * 3);
  const bB = Math.round(28 + tb * ta * 3);

  // Variable density — lighter, more transparent
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${bR + 6}, ${bG + 6}, ${bB + 8}, 0.10)`);
  grad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB}, 0.20)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // No stroke — dissolves into environment

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

  ctx.shadowColor = 'rgba(200, 164, 106, 0.15)';
  ctx.shadowBlur = 12;
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
  ctx.fillStyle = envWhite(envTone, 0.6, 'meta');
  ctx.fillText('Posted from ', textX, textY);

  const postedW = ctx.measureText('Posted from ').width;
  ctx.font = `600 ${brandSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = content.theme.accentHex;
  ctx.globalAlpha = 0.8;
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

  const sR = Math.round(16 + tr * ta * 3);
  const sG = Math.round(18 + tg * ta * 3);
  const sB = Math.round(30 + tb * ta * 3);

  // Atmospheric surface — lighter, more translucent
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${sR + 6}, ${sG + 6}, ${sB + 6}, 0.10)`);
  grad.addColorStop(1, `rgba(${sR}, ${sG}, ${sB}, 0.18)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Environment bleed edge tint — no hard stroke
  const bleedGrad = ctx.createRadialGradient(
    panel.x, panel.y + panel.height / 2, 0,
    panel.x, panel.y + panel.height / 2, panel.width * 0.4,
  );
  bleedGrad.addColorStop(0, `rgba(${tr}, ${tg}, ${tb}, 0.04)`);
  bleedGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = bleedGrad;
  ctx.fill();

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
  ctx.fillStyle = envWhite(envTone, 0.6, 'meta');
  ctx.fillText(prefix, textX, centerY - 2);

  const prefixW = ctx.measureText(prefix).width;
  ctx.font = `600 ${15}px ${FONT_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.9, 'secondary');
  ctx.fillText(` ${sponsor.name}`, textX + prefixW, centerY - 2);

  const tagline = sponsor.message || sponsor.cta;
  if (tagline) {
    ctx.font = `400 ${12}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 0.5, 'meta');
    const maxW = panel.width - pad * 2;
    const clipped = tagline.length > 60 ? tagline.slice(0, 59) + '…' : tagline;
    ctx.fillText(clipped, textX, centerY + 16, maxW);
  }

  ctx.restore();
}

// ─── Main Background — Card IS the environment ─────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
  envTone: EnvironmentTone,
) {
  const colors = parseGradient(theme.bgGradient);

  // ── Base environment — the world the card lives in ──
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
    ctx.fillStyle = '#0e0e16';
  }
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Key light — expansive warm bloom, not a spotlight
  const kl = envTone.keyLight;
  const keyGrad = ctx.createRadialGradient(
    spec.width * kl.x, spec.height * kl.y, 0,
    spec.width * kl.x, spec.height * kl.y, spec.width * 1.8,
  );
  keyGrad.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.25})`));
  keyGrad.addColorStop(0.1, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.16})`));
  keyGrad.addColorStop(0.3, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.07})`));
  keyGrad.addColorStop(0.6, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.025})`));
  keyGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fill light — cool complementary wash
  const fl = envTone.fillLight;
  const fillGrad = ctx.createRadialGradient(
    spec.width * fl.x, spec.height * fl.y, 0,
    spec.width * fl.x, spec.height * fl.y, spec.width * 1.1,
  );
  fillGrad.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.12})`));
  fillGrad.addColorStop(0.35, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.04})`));
  fillGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Ambient warmth — diffused center gravity
  const aw = envTone.ambientWarmth;
  const centerGrad = ctx.createRadialGradient(
    spec.width * 0.45, spec.height * 0.35, 0,
    spec.width * 0.45, spec.height * 0.35, spec.width * 0.9,
  );
  centerGrad.addColorStop(0, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.10})`));
  centerGrad.addColorStop(0.4, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.03})`));
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Secondary warm bloom — creates depth, not flatness
  const bloom2 = ctx.createRadialGradient(
    spec.width * 0.7, spec.height * 0.2, 0,
    spec.width * 0.7, spec.height * 0.2, spec.width * 0.6,
  );
  bloom2.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.06})`));
  bloom2.addColorStop(0.5, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.015})`));
  bloom2.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fine grain — physical materiality
  ctx.fillStyle = 'rgba(255, 255, 255, 0.004)';
  for (let i = 0; i < 120; i++) {
    const nx = Math.random() * spec.width;
    const ny = Math.random() * spec.height;
    ctx.fillRect(nx, ny, 1, 1);
  }

  // Soft vignette — gentle edge darkening
  const vs = envTone.vignetteStrength;
  const vignetteGrad = ctx.createRadialGradient(
    spec.width / 2, spec.height * 0.4, Math.min(spec.width, spec.height) * 0.5,
    spec.width / 2, spec.height * 0.4, Math.max(spec.width, spec.height) * 0.95,
  );
  vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGrad.addColorStop(0.65, `rgba(0,0,0,${vs * 0.06})`);
  vignetteGrad.addColorStop(1, `rgba(0,0,0,${vs * 0.22})`);
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

  // 3. Panels (in z-order) — all inherit environment
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

  // 4. Card shell — premium rounded clip + subtle outer glow
  // Re-apply rounded clip to ensure no hard clipping edges leak
  const shellRadius = Math.max(spec.panelRadius, 34);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  return canvas;
}
