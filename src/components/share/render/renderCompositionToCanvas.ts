/**
 * Deterministic Canvas Renderer — LifeStack Cinematic Artifact Edition.
 *
 * The card is a premium LifeStack artifact: cinematic, aspirational,
 * psychologically charged, elegant, high-trust, luxurious.
 *
 * Visual doctrine:
 * - Deep midnight navy / obsidian base with charcoal-to-blue-black gradients
 * - Restrained luxury gold accents with atmospheric glow
 * - Sculpted glass panels with internal light behavior
 * - Editorial serif + clean sans typography hierarchy
 * - Architectural frame with premium shadow separation
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
 * Premium warm whites with subtle environment tinting.
 */
function envWhite(envTone: EnvironmentTone, alpha: number = 1, tier: 'primary' | 'secondary' | 'meta' = 'primary'): string {
  const { r, g, b, alpha: ta } = envTone.panelTint;
  const warmShift = ta * 1.8;
  
  if (tier === 'primary') {
    const rr = Math.round(250 + r * warmShift * 0.03);
    const gg = Math.round(248 + g * warmShift * 0.02);
    const bb = Math.round(244);
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  if (tier === 'secondary') {
    const rr = Math.round(215 + r * warmShift * 0.04);
    const gg = Math.round(218 + g * warmShift * 0.03);
    const bb = Math.round(224);
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  // meta
  const rr = Math.round(140 + r * warmShift * 0.05);
  const gg = Math.round(148 + g * warmShift * 0.04);
  const bb = Math.round(164);
  return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
}

/**
 * Premium sculpted panel surface — layered glass with internal light.
 * Each panel feels like a translucent obsidian slab with depth.
 */
function drawPanelBackground(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  envTone: EnvironmentTone,
  tier: PanelTier = 'secondary',
) {
  ctx.save();

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;

  // ── SCULPTED GLASS — deep midnight with environment bleed ──

  // Base fill — deep obsidian with blue-black undertone
  const fillAlpha = tier === 'hero' ? 0.52 : tier === 'secondary' ? 0.44 : 0.36;
  const depthShift = tier === 'hero' ? 6 : tier === 'secondary' ? 4 : 2;
  const bR = Math.round(10 + tr * ta * depthShift);
  const bG = Math.round(14 + tg * ta * depthShift);
  const bB = Math.round(24 + tb * ta * depthShift);

  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const baseGrad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width * 0.3, panel.y + panel.height);
  baseGrad.addColorStop(0, `rgba(${bR + 14}, ${bG + 16}, ${bB + 20}, ${fillAlpha * 0.9})`);
  baseGrad.addColorStop(0.5, `rgba(${bR + 6}, ${bG + 8}, ${bB + 14}, ${fillAlpha})`);
  baseGrad.addColorStop(1, `rgba(${bR}, ${bG + 2}, ${bB + 8}, ${fillAlpha * 1.05})`);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Internal light — soft highlight at top-left creating sculpted depth
  const lumAlpha = tier === 'hero' ? 0.09 : tier === 'secondary' ? 0.06 : 0.035;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const innerLum = ctx.createLinearGradient(
    panel.x, panel.y,
    panel.x + panel.width * 0.6, panel.y + panel.height * 0.4,
  );
  innerLum.addColorStop(0, `rgba(255, 255, 255, ${lumAlpha})`);
  innerLum.addColorStop(0.3, `rgba(255, 255, 255, ${lumAlpha * 0.3})`);
  innerLum.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerLum;
  ctx.fill();

  // Bottom edge shadow — creates panel separation/floating effect
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const bottomShadow = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.75,
    panel.x, panel.y + panel.height,
  );
  bottomShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomShadow.addColorStop(1, `rgba(0, 0, 0, ${tier === 'hero' ? 0.12 : 0.08})`);
  ctx.fillStyle = bottomShadow;
  ctx.fill();

  // Architectural border — fine luminous contour line
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const borderGrad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  const borderIntensity = tier === 'hero' ? 0.14 : tier === 'secondary' ? 0.10 : 0.06;
  borderGrad.addColorStop(0, `rgba(255, 255, 255, ${borderIntensity})`);
  borderGrad.addColorStop(0.5, `rgba(255, 255, 255, ${borderIntensity * 0.4})`);
  borderGrad.addColorStop(1, `rgba(255, 255, 255, ${borderIntensity * 0.15})`);
  ctx.strokeStyle = borderGrad;
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

  // Cinematic vignette on media — darker, more dramatic
  const vignette = ctx.createRadialGradient(
    panel.x + panel.width / 2, panel.y + panel.height / 2,
    Math.min(panel.width, panel.height) * 0.25,
    panel.x + panel.width / 2, panel.y + panel.height / 2,
    Math.max(panel.width, panel.height) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.12)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  // Bottom gradient for cinematic feel
  const bottomFade = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.6,
    panel.x, panel.y + panel.height,
  );
  bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomFade.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = bottomFade;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  // Image count badge — premium capsule
  if (content.showImageCountBadge && content.mediaCount > 1) {
    const badgeText = `+${content.mediaCount - 1}`;
    ctx.font = `600 ${18}px ${FONT_FAMILY}`;
    const bw = ctx.measureText(badgeText).width + 26;
    const bh = 32;
    const bx = panel.x + panel.width - bw - 16;
    const by = panel.y + 16;

    drawRoundedRect(ctx, bx, by, bw, bh, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = `600 ${18}px ${FONT_FAMILY}`;
    ctx.fillText(badgeText, bx + 13, by + 22);
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

  ctx.filter = 'blur(18px) brightness(0.25) saturate(1.5)';
  ctx.drawImage(img, sdx, sdy, sdw, sdh);
  ctx.filter = 'none';

  // Cinematic atmospheric overlay — deep navy-black
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  overlayGrad.addColorStop(0, `rgba(4, 6, 14, 0.50)`);
  overlayGrad.addColorStop(0.35, `rgba(4, 6, 14, ${spec.backgroundOverlayOpacity * 1.1})`);
  overlayGrad.addColorStop(0.65, `rgba(4, 6, 14, ${Math.min(spec.backgroundOverlayOpacity * 1.2, 0.88)})`);
  overlayGrad.addColorStop(1, `rgba(4, 6, 14, 0.90)`);
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

  drawPanelBackground(ctx, panel, spec.panelRadius, envTone, 'hero');

  const pad = 32;
  const theme = content.theme;

  ctx.save();

  // ── Vertical accent rule — luminous doctrine marker ──
  const ruleH = panel.height - pad * 2;
  const ruleX = panel.x + pad;
  const ruleY = panel.y + pad;
  const ruleGrad = ctx.createLinearGradient(ruleX, ruleY, ruleX, ruleY + ruleH);
  ruleGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
  ruleGrad.addColorStop(0.2, theme.accentHex);
  ruleGrad.addColorStop(0.8, theme.accentHex);
  ruleGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
  ctx.fillStyle = ruleGrad;
  drawRoundedRect(ctx, ruleX, ruleY, 3, ruleH, 1.5);
  ctx.fill();

  // Accent glow behind rule
  ctx.shadowColor = theme.accentHex;
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, ruleX, ruleY, 3, ruleH, 1.5);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // ── "REFLECTION" label — ceremonial, widely tracked ──
  const labelY = ruleY + 16;
  ctx.font = `600 ${11}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.7;
  (ctx as any).letterSpacing = '4px';
  ctx.fillText('REFLECTION', ruleX + 18, labelY);
  (ctx as any).letterSpacing = '0px';
  ctx.globalAlpha = 1;

  // ── Thin separator line below label ──
  const sepY = labelY + 12;
  const sepGrad = ctx.createLinearGradient(ruleX + 18, sepY, ruleX + 18 + 100, sepY);
  sepGrad.addColorStop(0, `rgba(255,255,255,0.08)`);
  sepGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sepGrad;
  ctx.fillRect(ruleX + 18, sepY, 100, 1);

  const headerH = sepY - panel.y + 24;

  let fontSize = spec.typography.insightFontSize + 2;
  const textX = panel.x + pad + 18;
  const textMaxW = panel.width - pad - (pad + 18);
  const availableTextH = panel.height - headerH - pad - 8;

  ctx.font = `italic 400 ${fontSize}px ${SERIF_FAMILY}`;
  let lineH = fontSize * (spec.typography.insightLineHeight + 0.1);
  let lines = wrapText(ctx, content.aiInsight, textMaxW, 999);
  let totalH = lines.length * lineH;

  while (totalH > availableTextH && fontSize > 18) {
    fontSize -= 2;
    lineH = fontSize * (spec.typography.insightLineHeight + 0.1);
    ctx.font = `italic 400 ${fontSize}px ${SERIF_FAMILY}`;
    lines = wrapText(ctx, content.aiInsight, textMaxW, 999);
    totalH = lines.length * lineH;
  }

  const maxFitLines = Math.max(Math.floor(availableTextH / lineH), 2);
  const finalLines = wrapText(ctx, content.aiInsight, textMaxW, maxFitLines);

  // ── Insight text — high-contrast, commanding ──
  ctx.font = `italic 400 ${fontSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.96, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  let textY = panel.y + headerH + fontSize;
  for (const line of finalLines) {
    ctx.fillText(line, textX, textY);
    textY += lineH;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

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

  const pad = 34;

  ctx.save();

  // ── Decorative top accent — faint directional line ──
  const accentLineW = Math.min(60, panel.width * 0.15);
  const accentGrad = ctx.createLinearGradient(panel.x + pad, panel.y + pad, panel.x + pad + accentLineW, panel.y + pad);
  accentGrad.addColorStop(0, content.theme.accentHex);
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(panel.x + pad, panel.y + pad, accentLineW, 2);

  // Title — editorial serif, high-contrast, strong text shadow
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `700 ${titleSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 1, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  (ctx as any).letterSpacing = '1px';

  const textMaxW = panel.width - pad * 2;
  const titleLines = wrapText(ctx, content.title, textMaxW, spec.typography.titleMaxLines);
  const titleLineH = titleSize * 1.28;

  let cursorY = panel.y + pad + 18 + titleSize;
  for (const line of titleLines) {
    ctx.fillText(line, panel.x + pad, cursorY);
    cursorY += titleLineH;
  }
  (ctx as any).letterSpacing = '0px';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Subtitle — generous line-height, warm grey, more breathing room
  if (content.subtitle) {
    cursorY += 22;
    let subSize = spec.typography.subtitleFontSize;
    const availableH = panel.y + panel.height - pad - cursorY;

    ctx.font = `300 ${subSize}px ${FONT_FAMILY}`;
    let subLines = wrapText(ctx, content.subtitle, textMaxW, 999);
    let subLineH = subSize * (spec.typography.subtitleLineHeight + 0.14);
    let totalTextH = subLines.length * subLineH;

    const minSubSize = 16;
    while (totalTextH > availableH && subSize > minSubSize) {
      subSize -= 2;
      subLineH = subSize * spec.typography.subtitleLineHeight;
      ctx.font = `300 ${subSize}px ${FONT_FAMILY}`;
      subLines = wrapText(ctx, content.subtitle, textMaxW, 999);
      totalTextH = subLines.length * subLineH;
    }

    const maxVisibleLines = Math.floor(availableH / subLineH);
    const finalMaxLines = Math.max(maxVisibleLines, 3);
    ctx.font = `300 ${subSize}px ${FONT_FAMILY}`;
    const finalLines = wrapText(ctx, content.subtitle, textMaxW, finalMaxLines);
    ctx.fillStyle = envWhite(envTone, 0.72, 'secondary');
    (ctx as any).letterSpacing = '0.3px';

    for (const line of finalLines) {
      ctx.fillText(line, panel.x + pad, cursorY);
      cursorY += subLineH;
    }
    (ctx as any).letterSpacing = '0px';
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

  const pad = 26;
  const theme = content.theme;

  ctx.save();

  const phraseSize = spec.typography.phraseFontSize;
  const phraseReserved = phraseSize + pad + 12;
  const availableForStat = panel.height - pad - phraseReserved;

  let cursorY = panel.y + pad;

  if (content.statValue) {
    const displayStat = content.showNumbers ? content.statValue : '•••';
    let statSize = spec.typography.statFontSize;
    if (displayStat.length > 6) statSize = Math.round(statSize * 0.65);
    else if (displayStat.length > 4) statSize = Math.round(statSize * 0.8);

    const labelSize = 13;
    const labelGap = 12;
    const neededH = statSize * 0.85 + labelGap + labelSize;
    if (neededH > availableForStat && statSize > 24) {
      statSize = Math.max(24, Math.round(statSize * (availableForStat / neededH)));
    }

    // Stat value with warm glow — the signal
    ctx.font = `700 ${statSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = theme.accentHex;
    ctx.shadowColor = theme.accentHex;
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 0;
    cursorY += statSize * 0.8;
    ctx.fillText(displayStat, panel.x + pad, cursorY, panel.width - pad * 2);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    if (content.statLabel) {
      cursorY += labelGap + labelSize;
      ctx.font = `500 ${labelSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = envWhite(envTone, 0.55, 'meta');
      (ctx as any).letterSpacing = '2.5px';
      ctx.fillText(content.statLabel.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
      (ctx as any).letterSpacing = '0px';
    }
  }

  // Phrase — philosophical anchor at bottom
  const phraseY = panel.y + panel.height - pad;
  if (phraseY - cursorY > 16) {
    // Thin separator above phrase
    const sepW = Math.min(40, panel.width * 0.1);
    const sepGrad = ctx.createLinearGradient(panel.x + pad, phraseY - phraseSize - 14, panel.x + pad + sepW, phraseY - phraseSize - 14);
    sepGrad.addColorStop(0, theme.accentHex);
    sepGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sepGrad;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(panel.x + pad, phraseY - phraseSize - 14, sepW, 1);
    ctx.globalAlpha = 1;

    ctx.font = `italic 400 ${phraseSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = theme.accentHex;
    ctx.globalAlpha = 0.5;
    (ctx as any).letterSpacing = '1.5px';
    ctx.fillText(content.phrase.toUpperCase(), panel.x + pad, phraseY, panel.width - pad * 2);
    (ctx as any).letterSpacing = '0px';
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

  const pad = 26;
  const theme = content.theme;

  ctx.save();

  const metaSize = spec.typography.metaFontSize;
  const lineGap = 14;

  // ── Small accent diamond — symbolic growth marker ──
  const diamondSize = 6;
  const diamondX = panel.x + pad;
  const diamondCY = panel.y + pad + metaSize * 0.4;
  ctx.save();
  ctx.translate(diamondX + diamondSize / 2, diamondCY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
  ctx.restore();

  let cursorY = panel.y + pad + metaSize;

  // Card type — uppercase, widely tracked, symbolic
  ctx.font = `600 ${metaSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.8;
  (ctx as any).letterSpacing = '3px';
  ctx.fillText(content.cardTypeLabel.toUpperCase(), diamondX + diamondSize + 12, cursorY, panel.width - pad * 2 - diamondSize - 12);
  (ctx as any).letterSpacing = '0px';
  ctx.globalAlpha = 1;

  if (content.timeAnchor) {
    cursorY += metaSize + lineGap;
    ctx.font = `300 ${metaSize - 1}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 0.55, 'meta');
    (ctx as any).letterSpacing = '0.5px';
    ctx.fillText(content.timeAnchor, panel.x + pad, cursorY, panel.width - pad * 2);
    (ctx as any).letterSpacing = '0px';
  }

  if (content.domain) {
    cursorY += (metaSize - 1) + lineGap;
    ctx.font = `500 ${13}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 0.45, 'meta');
    (ctx as any).letterSpacing = '2px';
    ctx.fillText(content.domain.toUpperCase(), panel.x + pad, cursorY, panel.width - pad * 2);
    (ctx as any).letterSpacing = '0px';
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

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;
  const bR = Math.round(10 + tr * ta * 3);
  const bG = Math.round(12 + tg * ta * 3);
  const bB = Math.round(22 + tb * ta * 3);

  // ── Ceremonial brand strip — elegant, prestigious presence ──
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, Math.min(spec.panelRadius, panel.height / 2));
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${bR + 10}, ${bG + 10}, ${bB + 12}, 0.06)`);
  grad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB}, 0.14)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Top border — whisper separation
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, Math.min(spec.panelRadius, panel.height / 2));
  const borderGrad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y);
  borderGrad.addColorStop(0, 'rgba(255,255,255,0.015)');
  borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.055)');
  borderGrad.addColorStop(1, 'rgba(255,255,255,0.015)');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // ── Seal icon — refined golden emblem with glow ──
  const iconSize = 28;
  const brandSize = spec.typography.brandFontSize;

  // Measure full text to center everything
  ctx.font = `300 ${brandSize - 1}px ${FONT_FAMILY}`;
  const prefixW = ctx.measureText('Posted from ').width;
  ctx.font = `600 ${brandSize}px ${SERIF_FAMILY}`;
  const nameW = ctx.measureText('LifeStack').width;
  const gap = 12;
  const totalContentW = iconSize + gap + prefixW + nameW;
  const startX = panel.x + (panel.width - totalContentW) / 2;
  const iconX = startX;
  const iconY = panel.y + (panel.height - iconSize) / 2;

  // Icon glow — warm, ceremonial
  ctx.shadowColor = 'rgba(200, 164, 106, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 0;

  // Circular seal instead of square
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  const iconGrad = ctx.createRadialGradient(
    iconX + iconSize * 0.4, iconY + iconSize * 0.35, 0,
    iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2,
  );
  iconGrad.addColorStop(0, 'hsl(43, 74%, 62%)');
  iconGrad.addColorStop(0.6, 'hsl(43, 70%, 50%)');
  iconGrad.addColorStop(1, 'hsl(40, 55%, 34%)');
  ctx.fillStyle = iconGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Inner ring on seal
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // LS mark
  ctx.font = `800 ${10}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(14, 12, 20)';
  ctx.textAlign = 'center';
  ctx.fillText('LS', iconX + iconSize / 2, iconY + iconSize / 2 + 3.5);
  ctx.textAlign = 'left';

  // ── Brand text — ceremonial, split hierarchy ──
  const textX = iconX + iconSize + gap;
  const textY = panel.y + panel.height / 2 + brandSize * 0.3;

  ctx.font = `300 ${brandSize - 1}px ${FONT_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.35, 'meta');
  (ctx as any).letterSpacing = '0.8px';
  ctx.fillText('Posted from ', textX, textY);

  ctx.font = `600 ${brandSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = content.theme.accentHex;
  ctx.globalAlpha = 0.65;
  (ctx as any).letterSpacing = '1.2px';
  ctx.fillText('LifeStack', textX + prefixW, textY);
  ctx.globalAlpha = 1;
  (ctx as any).letterSpacing = '0px';

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
  const pad = 22;
  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;

  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);

  const sR = Math.round(12 + tr * ta * 3);
  const sG = Math.round(14 + tg * ta * 3);
  const sB = Math.round(26 + tb * ta * 3);

  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${sR + 6}, ${sG + 6}, ${sB + 6}, 0.08)`);
  grad.addColorStop(1, `rgba(${sR}, ${sG}, ${sB}, 0.15)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle top border
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;
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

  ctx.font = `400 ${14}px ${FONT_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.5, 'meta');
  (ctx as any).letterSpacing = '0.5px';
  ctx.fillText(prefix, textX, centerY - 2);

  const prefixW = ctx.measureText(prefix).width;
  ctx.font = `600 ${15}px ${FONT_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.85, 'secondary');
  ctx.fillText(` ${sponsor.name}`, textX + prefixW, centerY - 2);

  const tagline = sponsor.message || sponsor.cta;
  if (tagline) {
    ctx.font = `400 ${12}px ${FONT_FAMILY}`;
    ctx.fillStyle = envWhite(envTone, 0.4, 'meta');
    const maxW = panel.width - pad * 2;
    const clipped = tagline.length > 60 ? tagline.slice(0, 59) + '…' : tagline;
    ctx.fillText(clipped, textX, centerY + 18, maxW);
  }

  (ctx as any).letterSpacing = '0px';
  ctx.restore();
}

// ─── Main Background — Cinematic LifeStack Environment ─────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
  envTone: EnvironmentTone,
) {
  const colors = parseGradient(theme.bgGradient);

  // ── Base environment — deep midnight navy / obsidian ──
  if (colors.length >= 2) {
    const grad = ctx.createLinearGradient(
      spec.width * 0.05, 0,
      spec.width * 0.95, spec.height,
    );
    colors.forEach((color, i) => {
      grad.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#060810';
  }
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Key light — expansive warm bloom with cinematic spread
  const kl = envTone.keyLight;
  const keyGrad = ctx.createRadialGradient(
    spec.width * kl.x, spec.height * kl.y, 0,
    spec.width * kl.x, spec.height * kl.y, spec.width * 2.0,
  );
  keyGrad.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.30})`));
  keyGrad.addColorStop(0.08, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.20})`));
  keyGrad.addColorStop(0.25, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.09})`));
  keyGrad.addColorStop(0.5, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.03})`));
  keyGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fill light — cool complementary wash, deeper
  const fl = envTone.fillLight;
  const fillGrad = ctx.createRadialGradient(
    spec.width * fl.x, spec.height * fl.y, 0,
    spec.width * fl.x, spec.height * fl.y, spec.width * 1.2,
  );
  fillGrad.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.14})`));
  fillGrad.addColorStop(0.3, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.05})`));
  fillGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Ambient warmth — diffused center gravity
  const aw = envTone.ambientWarmth;
  const centerGrad = ctx.createRadialGradient(
    spec.width * 0.45, spec.height * 0.30, 0,
    spec.width * 0.45, spec.height * 0.30, spec.width * 1.0,
  );
  centerGrad.addColorStop(0, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.12})`));
  centerGrad.addColorStop(0.35, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.04})`));
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Secondary warm bloom — creates depth layering
  const bloom2 = ctx.createRadialGradient(
    spec.width * 0.72, spec.height * 0.18, 0,
    spec.width * 0.72, spec.height * 0.18, spec.width * 0.65,
  );
  bloom2.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.08})`));
  bloom2.addColorStop(0.4, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.02})`));
  bloom2.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Lower-right cool accent — cinematic color separation
  const coolAccent = ctx.createRadialGradient(
    spec.width * 0.85, spec.height * 0.75, 0,
    spec.width * 0.85, spec.height * 0.75, spec.width * 0.5,
  );
  coolAccent.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.06})`));
  coolAccent.addColorStop(0.5, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.015})`));
  coolAccent.addColorStop(1, 'transparent');
  ctx.fillStyle = coolAccent;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fine grain — physical materiality (more subtle)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.003)';
  for (let i = 0; i < 180; i++) {
    const nx = Math.random() * spec.width;
    const ny = Math.random() * spec.height;
    ctx.fillRect(nx, ny, 1, 1);
  }

  // Soft vignette — cinematic edge darkening
  const vs = envTone.vignetteStrength;
  const vignetteGrad = ctx.createRadialGradient(
    spec.width / 2, spec.height * 0.38, Math.min(spec.width, spec.height) * 0.4,
    spec.width / 2, spec.height * 0.38, Math.max(spec.width, spec.height) * 1.0,
  );
  vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGrad.addColorStop(0.5, `rgba(0,0,0,${vs * 0.05})`);
  vignetteGrad.addColorStop(0.75, `rgba(0,0,0,${vs * 0.14})`);
  vignetteGrad.addColorStop(1, `rgba(0,0,0,${vs * 0.30})`);
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

  // 1. Background — cinematic environment
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

  // 4. Card shell — architectural frame with edge glow
  const shellRadius = Math.max(spec.panelRadius, 34);
  
  // Apply rounded clip
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  // Premium edge contour — subtle luminous border on the card itself
  ctx.save();
  drawRoundedRect(ctx, 1, 1, spec.width - 2, spec.height - 2, shellRadius - 1);
  const shellBorderGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  shellBorderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
  shellBorderGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
  shellBorderGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
  shellBorderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.strokeStyle = shellBorderGrad;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  return canvas;
}
