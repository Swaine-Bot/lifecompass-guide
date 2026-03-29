/**
 * Deterministic Canvas Renderer — LifeStack Glass Material System.
 *
 * 6-LAYER GLASS ARCHITECTURE:
 *   L1  Outer Frame    — structural glass shell, warm gold tint, restrained glow
 *   L2  Card Base      — primary obsidian glass plane, internal gradient, inner shadow
 *   L3  Content Panels — secondary glass surfaces elevated above base
 *   L4  Image Panel    — glass-housed media with edge highlights
 *   L5  Typography     — floating signal layer with subtle glow
 *   L6  Brand Seal     — micro glass badge, etched signature
 *
 * Every layer has distinct opacity. No two share the same depth.
 * Light direction: top-left → bottom-right (consistent across all layers).
 */

import type { CompositionSpec, PanelSpec } from '../composition/computeCompositionSpec';
import type { NormalizedShareContent } from '../composition/normalizeShareContent';
import type { ThemeDefinition, SponsorData } from '@/services/shareService';
import { getEnvironmentTone, type EnvironmentTone } from '../environmentTone';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const SERIF_FAMILY = '"Playfair Display", Georgia, serif';

// ─── Light direction constants ────────────────────────────────────────
const LIGHT_ANGLE = { x: 0.15, y: 0.08 }; // top-left origin

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

type GlassLayer = 'frame' | 'base' | 'panel-hero' | 'panel-secondary' | 'panel-tertiary' | 'seal';

// ─── LAYER OPACITIES — no two layers share the same value ─────────────
const GLASS_OPACITY: Record<GlassLayer, number> = {
  'frame':           0.08,  // L1 — barely there, structural
  'base':            0.62,  // L2 — primary surface, grounded
  'panel-hero':      0.48,  // L3 — hero content panels
  'panel-secondary': 0.38,  // L3 — secondary content panels
  'panel-tertiary':  0.28,  // L3 — tertiary panels
  'seal':            0.18,  // L6 — brand badge
};

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

// ─── L3: Glass Panel Surface ──────────────────────────────────────────
/**
 * Draws a glass panel with:
 *  - Distinct fill opacity per tier
 *  - Top-left directional inner light
 *  - Bottom inner shadow for depth
 *  - Luminous border with directional gradient
 *  - Soft drop shadow beneath (panel floats above base)
 */
function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  envTone: EnvironmentTone,
  layer: GlassLayer = 'panel-secondary',
) {
  ctx.save();

  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;
  const opacity = GLASS_OPACITY[layer];
  const depthShift = layer === 'panel-hero' ? 6 : layer === 'panel-secondary' ? 4 : 2;
  const bR = Math.round(8 + tr * ta * depthShift);
  const bG = Math.round(12 + tg * ta * depthShift);
  const bB = Math.round(22 + tb * ta * depthShift);

  // ── Drop shadow beneath panel (creates floating separation from base) ──
  if (layer === 'panel-hero' || layer === 'panel-secondary') {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = layer === 'panel-hero' ? 24 : 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
    ctx.fillStyle = 'rgba(0,0,0,0.01)'; // invisible fill to trigger shadow
    ctx.fill();
    ctx.restore();
  }

  // ── Glass fill — deep obsidian with directional internal gradient ──
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const baseGrad = ctx.createLinearGradient(
    panel.x + panel.width * LIGHT_ANGLE.x,
    panel.y,
    panel.x + panel.width * (1 - LIGHT_ANGLE.x),
    panel.y + panel.height,
  );
  baseGrad.addColorStop(0, `rgba(${bR + 18}, ${bG + 20}, ${bB + 26}, ${opacity * 0.85})`);
  baseGrad.addColorStop(0.4, `rgba(${bR + 8}, ${bG + 10}, ${bB + 16}, ${opacity})`);
  baseGrad.addColorStop(1, `rgba(${bR}, ${bG + 2}, ${bB + 6}, ${opacity * 1.08})`);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // ── Directional inner light — top-left highlight (consistent light source) ──
  const lumIntensity = layer === 'panel-hero' ? 0.11 : layer === 'panel-secondary' ? 0.07 : 0.04;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const innerLight = ctx.createLinearGradient(
    panel.x, panel.y,
    panel.x + panel.width * 0.55, panel.y + panel.height * 0.35,
  );
  innerLight.addColorStop(0, `rgba(255, 255, 255, ${lumIntensity})`);
  innerLight.addColorStop(0.25, `rgba(255, 255, 255, ${lumIntensity * 0.35})`);
  innerLight.addColorStop(0.6, `rgba(255, 255, 255, ${lumIntensity * 0.08})`);
  innerLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerLight;
  ctx.fill();

  // ── Bottom inner shadow — creates concavity, glass depth ──
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const bottomShadow = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.7,
    panel.x, panel.y + panel.height,
  );
  const shadowDepth = layer === 'panel-hero' ? 0.16 : layer === 'panel-secondary' ? 0.12 : 0.08;
  bottomShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomShadow.addColorStop(0.6, `rgba(0, 0, 0, ${shadowDepth * 0.3})`);
  bottomShadow.addColorStop(1, `rgba(0, 0, 0, ${shadowDepth})`);
  ctx.fillStyle = bottomShadow;
  ctx.fill();

  // ── Directional border — lit on top-left, dark on bottom-right ──
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const borderGrad = ctx.createLinearGradient(
    panel.x, panel.y,
    panel.x + panel.width, panel.y + panel.height,
  );
  const borderPeak = layer === 'panel-hero' ? 0.18 : layer === 'panel-secondary' ? 0.13 : 0.08;
  borderGrad.addColorStop(0, `rgba(255, 255, 255, ${borderPeak})`);          // top-left: bright
  borderGrad.addColorStop(0.3, `rgba(255, 255, 255, ${borderPeak * 0.45})`); // fade
  borderGrad.addColorStop(0.7, `rgba(255, 255, 255, ${borderPeak * 0.12})`); // dim
  borderGrad.addColorStop(1, `rgba(255, 255, 255, ${borderPeak * 0.06})`);   // bottom-right: near invisible
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Top edge highlight — sharp catch light along top rim ──
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(panel.x + radius, panel.y + 0.5);
  ctx.lineTo(panel.x + panel.width - radius, panel.y + 0.5);
  const topHighlight = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y);
  const highlightPeak = layer === 'panel-hero' ? 0.22 : layer === 'panel-secondary' ? 0.15 : 0.09;
  topHighlight.addColorStop(0, `rgba(255, 255, 255, ${highlightPeak * 0.3})`);
  topHighlight.addColorStop(0.3, `rgba(255, 255, 255, ${highlightPeak})`);
  topHighlight.addColorStop(0.7, `rgba(255, 255, 255, ${highlightPeak * 0.5})`);
  topHighlight.addColorStop(1, `rgba(255, 255, 255, ${highlightPeak * 0.1})`);
  ctx.strokeStyle = topHighlight;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();

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

// ─── L4: Image Panel (Glass-Housed Media) ─────────────────────────────

function drawMediaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  img: HTMLImageElement | null,
  envTone: EnvironmentTone,
) {
  if (!panel.visible || !img) return;

  ctx.save();

  // ── Drop shadow for the image housing ──
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  ctx.fillStyle = 'rgba(0,0,0,0.01)';
  ctx.fill();
  ctx.restore();

  // ── Draw image within rounded glass housing ──
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

  // Cinematic vignette
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

  // Bottom gradient for cinematic depth
  const bottomFade = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.6,
    panel.x, panel.y + panel.height,
  );
  bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomFade.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = bottomFade;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  ctx.restore();

  // ── Glass housing border — edge highlight + inner shadow (drawn outside clip) ──
  ctx.save();
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  const mediaBorder = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  mediaBorder.addColorStop(0, 'rgba(255, 255, 255, 0.20)');
  mediaBorder.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  mediaBorder.addColorStop(0.7, 'rgba(255, 255, 255, 0.03)');
  mediaBorder.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
  ctx.strokeStyle = mediaBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Inner shadow at top edge of image (glass depth) ──
  ctx.beginPath();
  ctx.moveTo(panel.x + spec.panelRadius, panel.y + 1);
  ctx.lineTo(panel.x + panel.width - spec.panelRadius, panel.y + 1);
  const innerShadow = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y);
  innerShadow.addColorStop(0, 'rgba(255,255,255,0.04)');
  innerShadow.addColorStop(0.4, 'rgba(255,255,255,0.12)');
  innerShadow.addColorStop(0.7, 'rgba(255,255,255,0.06)');
  innerShadow.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.strokeStyle = innerShadow;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();

  // Image count badge
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

  // Cinematic atmospheric overlay
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  overlayGrad.addColorStop(0, `rgba(4, 6, 14, 0.50)`);
  overlayGrad.addColorStop(0.35, `rgba(4, 6, 14, ${spec.backgroundOverlayOpacity * 1.1})`);
  overlayGrad.addColorStop(0.65, `rgba(4, 6, 14, ${Math.min(spec.backgroundOverlayOpacity * 1.2, 0.88)})`);
  overlayGrad.addColorStop(1, `rgba(4, 6, 14, 0.90)`);
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  ctx.restore();
}

// ─── L5: Typography Overlay — Insight Panel ───────────────────────────

function drawInsightPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible || !content.aiInsight) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-hero');

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

  // ── "REFLECTION" label ──
  const labelY = ruleY + 16;
  ctx.font = `600 ${11}px ${FONT_FAMILY}`;
  ctx.fillStyle = theme.accentHex;
  ctx.globalAlpha = 0.7;
  (ctx as any).letterSpacing = '4px';
  ctx.fillText('REFLECTION', ruleX + 18, labelY);
  (ctx as any).letterSpacing = '0px';
  ctx.globalAlpha = 1;

  // ── Thin separator below label ──
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

  // ── L5: Insight text — floating ON the glass with subtle glow ──
  ctx.font = `italic 400 ${fontSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.97, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
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

// ─── L5: Typography Overlay — Text Panel ──────────────────────────────

function drawTextPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-hero');

  const pad = 34;

  ctx.save();

  // ── Decorative accent line ──
  const accentLineW = Math.min(60, panel.width * 0.15);
  const accentGrad = ctx.createLinearGradient(panel.x + pad, panel.y + pad, panel.x + pad + accentLineW, panel.y + pad);
  accentGrad.addColorStop(0, content.theme.accentHex);
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(panel.x + pad, panel.y + pad, accentLineW, 2);

  // ── L5: Title — floating above glass, high-contrast ──
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `700 ${titleSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 1, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
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

  // Subtitle
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

// ─── L3: Momentum Panel ──────────────────────────────────────────────

function drawMomentumPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-secondary');

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

    // ── L5: Stat value — floating above glass with warm glow ──
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

  // Phrase — philosophical anchor
  const phraseY = panel.y + panel.height - pad;
  if (phraseY - cursorY > 16) {
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

// ─── L3: Meta Panel ──────────────────────────────────────────────────

function drawMetaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-tertiary');

  const pad = 26;
  const theme = content.theme;

  ctx.save();

  const metaSize = spec.typography.metaFontSize;
  const lineGap = 14;

  // ── Small accent diamond ──
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

// ─── L6: Brand Seal Panel ─────────────────────────────────────────────

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

  // ── L6: Micro glass badge — distinct from all other layers ──
  const sealOpacity = GLASS_OPACITY['seal'];
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, Math.min(spec.panelRadius, panel.height / 2));
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width * 0.4, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${bR + 14}, ${bG + 12}, ${bB + 8}, ${sealOpacity * 1.1})`);
  grad.addColorStop(0.5, `rgba(${bR + 6}, ${bG + 6}, ${bB + 6}, ${sealOpacity})`);
  grad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB}, ${sealOpacity * 0.9})`);
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Directional border — consistent with global light ──
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, Math.min(spec.panelRadius, panel.height / 2));
  const borderGrad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width, panel.y + panel.height);
  borderGrad.addColorStop(0, 'rgba(255,255,255,0.10)');
  borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  borderGrad.addColorStop(1, 'rgba(255,255,255,0.015)');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // ── Top edge highlight ──
  ctx.beginPath();
  const halfR = Math.min(spec.panelRadius, panel.height / 2);
  ctx.moveTo(panel.x + halfR, panel.y + 0.5);
  ctx.lineTo(panel.x + panel.width - halfR, panel.y + 0.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // ── Seal icon — refined golden emblem with glow ──
  const iconSize = 28;
  const brandSize = spec.typography.brandFontSize;

  ctx.font = `300 ${brandSize - 1}px ${FONT_FAMILY}`;
  const prefixW = ctx.measureText('Posted from ').width;
  ctx.font = `600 ${brandSize}px ${SERIF_FAMILY}`;
  const nameW = ctx.measureText('LifeStack').width;
  const gap = 12;
  const totalContentW = iconSize + gap + prefixW + nameW;
  const startX = panel.x + (panel.width - totalContentW) / 2;
  const iconX = startX;
  const iconY = panel.y + (panel.height - iconSize) / 2;

  // Icon glow
  ctx.shadowColor = 'rgba(200, 164, 106, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 0;

  // Circular seal
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

  // Inner ring
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

  // ── Brand text ──
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

  ctx.save();

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-tertiary');

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

// ─── L2: Card Base — Primary Glass Plane ──────────────────────────────

function drawCardBase(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
) {
  const shellRadius = Math.max(spec.panelRadius, 34);
  const inset = 0; // base fills the entire card

  ctx.save();

  // ── L2: Primary glass plane — deep obsidian with internal gradient ──
  const baseOpacity = GLASS_OPACITY['base'];
  const { r: tr, g: tg, b: tb, alpha: ta } = envTone.panelTint;
  const bR = Math.round(6 + tr * ta * 4);
  const bG = Math.round(8 + tg * ta * 4);
  const bB = Math.round(18 + tb * ta * 4);

  drawRoundedRect(ctx, inset, inset, spec.width - inset * 2, spec.height - inset * 2, shellRadius);
  const baseGrad = ctx.createLinearGradient(
    spec.width * LIGHT_ANGLE.x, 0,
    spec.width * (1 - LIGHT_ANGLE.x), spec.height,
  );
  // Top slightly lighter than bottom (internal gradient)
  baseGrad.addColorStop(0, `rgba(${bR + 12}, ${bG + 14}, ${bB + 20}, ${baseOpacity * 0.7})`);
  baseGrad.addColorStop(0.3, `rgba(${bR + 6}, ${bG + 8}, ${bB + 14}, ${baseOpacity * 0.85})`);
  baseGrad.addColorStop(0.7, `rgba(${bR + 2}, ${bG + 4}, ${bB + 8}, ${baseOpacity})`);
  baseGrad.addColorStop(1, `rgba(${bR}, ${bG}, ${bB + 4}, ${baseOpacity * 1.05})`);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // ── Inner shadow — creates depth, grounded pane feel ──
  drawRoundedRect(ctx, inset, inset, spec.width - inset * 2, spec.height - inset * 2, shellRadius);
  const innerShadow = ctx.createLinearGradient(0, 0, 0, spec.height);
  innerShadow.addColorStop(0, 'rgba(255,255,255,0.04)');
  innerShadow.addColorStop(0.05, 'rgba(255,255,255,0.01)');
  innerShadow.addColorStop(0.95, 'rgba(0,0,0,0.06)');
  innerShadow.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = innerShadow;
  ctx.fill();

  ctx.restore();
}

// ─── Background — Cinematic LifeStack Environment ─────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
  envTone: EnvironmentTone,
) {
  const colors = parseGradient(theme.bgGradient);

  // ── Base environment ──
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

  // Key light
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

  // Fill light
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

  // Ambient warmth
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

  // Secondary warm bloom
  const bloom2 = ctx.createRadialGradient(
    spec.width * 0.72, spec.height * 0.18, 0,
    spec.width * 0.72, spec.height * 0.18, spec.width * 0.65,
  );
  bloom2.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.08})`));
  bloom2.addColorStop(0.4, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.02})`));
  bloom2.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Cool accent
  const coolAccent = ctx.createRadialGradient(
    spec.width * 0.85, spec.height * 0.75, 0,
    spec.width * 0.85, spec.height * 0.75, spec.width * 0.5,
  );
  coolAccent.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.06})`));
  coolAccent.addColorStop(0.5, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.015})`));
  coolAccent.addColorStop(1, 'transparent');
  ctx.fillStyle = coolAccent;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fine grain texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.003)';
  for (let i = 0; i < 180; i++) {
    const nx = Math.random() * spec.width;
    const ny = Math.random() * spec.height;
    ctx.fillRect(nx, ny, 1, 1);
  }

  // Vignette
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

// ─── L1: Outer Frame — Structural Glass Shell ─────────────────────────

function drawOuterFrame(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
  accentHex: string,
) {
  const shellRadius = Math.max(spec.panelRadius, 34);

  ctx.save();

  // ── Warm gold-tinted structural frame border ──
  drawRoundedRect(ctx, 1, 1, spec.width - 2, spec.height - 2, shellRadius - 1);
  const frameBorder = ctx.createLinearGradient(0, 0, spec.width * 0.5, spec.height);
  // Directional: bright top-left → dim bottom-right (consistent light)
  frameBorder.addColorStop(0, 'rgba(255, 245, 225, 0.18)');   // warm gold tint
  frameBorder.addColorStop(0.12, 'rgba(255, 248, 230, 0.10)');
  frameBorder.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
  frameBorder.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
  frameBorder.addColorStop(1, 'rgba(255, 250, 235, 0.04)');    // subtle warmth returns
  ctx.strokeStyle = frameBorder;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // ── Inner contour line — secondary edge definition ──
  drawRoundedRect(ctx, 3.5, 3.5, spec.width - 7, spec.height - 7, shellRadius - 3);
  const innerContour = ctx.createLinearGradient(0, 0, 0, spec.height * 0.2);
  innerContour.addColorStop(0, 'rgba(255, 250, 235, 0.06)');
  innerContour.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  innerContour.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = innerContour;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // ── Soft outer glow — extremely restrained, warm gold ──
  // (This is drawn as a subtle fill around the edge zone)
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  const edgeGlow = ctx.createLinearGradient(0, 0, spec.width, spec.height);
  edgeGlow.addColorStop(0, `rgba(200, 170, 110, ${GLASS_OPACITY['frame']})`);
  edgeGlow.addColorStop(0.3, 'rgba(200, 170, 110, 0.02)');
  edgeGlow.addColorStop(0.7, 'rgba(200, 170, 110, 0.01)');
  edgeGlow.addColorStop(1, `rgba(200, 170, 110, ${GLASS_OPACITY['frame'] * 0.5})`);
  ctx.fillStyle = edgeGlow;
  // Only fill the edge band (not the interior)
  ctx.lineWidth = 6;
  ctx.strokeStyle = edgeGlow;
  ctx.stroke();

  ctx.restore();
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

  // ═══════════════════════════════════════════════════════════════
  // LAYER STACK — rendered bottom-to-top
  // ═══════════════════════════════════════════════════════════════

  // ENVIRONMENT — cinematic background
  drawBackground(ctx, spec, content.theme, envTone);

  // Background image (if background treatment)
  if (content.imageTreatment === 'background') {
    drawBackgroundImage(ctx, spec, content, mediaImg);
  }

  // L2 — CARD BASE — primary glass plane (sits above environment)
  drawCardBase(ctx, spec, envTone);

  // L3/L4/L5 — CONTENT PANELS (in z-order)
  const panelDrawOrder: [PanelSpec, (ctx: CanvasRenderingContext2D, panel: PanelSpec) => void][] = [
    [spec.panels.media, (c, p) => drawMediaPanel(c, p, content, spec, content.imageTreatment !== 'background' ? mediaImg : null, envTone)],
    [spec.panels.insight, (c, p) => drawInsightPanel(c, p, content, spec, envTone)],
    [spec.panels.text, (c, p) => drawTextPanel(c, p, content, spec, envTone)],
    [spec.panels.momentum, (c, p) => drawMomentumPanel(c, p, content, spec, envTone)],
    [spec.panels.meta, (c, p) => drawMetaPanel(c, p, content, spec, envTone)],
    [spec.panels.sponsor, (c, p) => drawSponsorPanel(c, p, content, spec, envTone)],
    [spec.panels.brand, (c, p) => drawBrandPanel(c, p, content, spec, envTone)],
  ];

  panelDrawOrder.sort((a, b) => a[0].zIndex - b[0].zIndex);

  for (const [panel, draw] of panelDrawOrder) {
    if (panel.visible) {
      draw(ctx, panel);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FINAL SHELL — rounded clip + outer frame
  // ═══════════════════════════════════════════════════════════════

  const shellRadius = Math.max(spec.panelRadius, 34);

  // Apply rounded clip
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  // L1 — OUTER FRAME — structural glass shell with warm gold tint
  drawOuterFrame(ctx, spec, envTone, content.theme.accentHex);

  return canvas;
}
