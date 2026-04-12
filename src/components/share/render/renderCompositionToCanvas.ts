/**
 * Deterministic Canvas Renderer — LifeStack Optical Glass System.
 *
 * COLOR DOCTRINE: The card has NO independent color identity.
 * Color is EXTRACTED from the embedded media and PROPAGATED through
 * every glass layer using a "fibre optic" distribution model.
 *
 * LAYER ARCHITECTURE:
 *   L1  Outer Frame    — faintest media tint, specular highlights
 *   L2  Card Base      — deep desaturated version of primary media color
 *   L3  Content Panels — increasing media color intensity per depth tier
 *   L4  Image Panel    — glass-housed media (color source)
 *   L5  Typography     — floating signal with adaptive contrast
 *   L6  Brand Seal     — etched glass with accent from media
 *
 * Light direction: top-left → bottom-right (unified specular system).
 */

import type { CompositionSpec, PanelSpec } from '../composition/computeCompositionSpec';
import type { NormalizedShareContent } from '../composition/normalizeShareContent';
import type { ThemeDefinition, SponsorData } from '@/services/shareService';
import { getEnvironmentTone, type EnvironmentTone } from '../environmentTone';

const FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const SERIF_FAMILY = '"Playfair Display", Georgia, serif';

// ─── Light direction constants ────────────────────────────────────────
const LIGHT_ANGLE = { x: 0.12, y: 0.06 };

// ─── TRUE GLASS OPACITY HIERARCHY ────────────────────────────────────
type GlassLayer = 'frame' | 'base' | 'panel-hero' | 'panel-secondary' | 'panel-tertiary' | 'seal';

const GLASS_OPACITY: Record<GlassLayer, number> = {
  'frame':           0.04,
  'base':            0.32,
  'panel-hero':      0.26,
  'panel-secondary': 0.20,
  'panel-tertiary':  0.14,
  'seal':            0.10,
};

// ─── Media Color Palette ──────────────────────────────────────────────
/** Colors extracted from embedded media, normalized for premium glass use */
interface MediaPalette {
  /** Most dominant color — used for card base, deep desaturated */
  primary: { r: number; g: number; b: number };
  /** Supporting tone — blended into panels */
  secondary: { r: number; g: number; b: number };
  /** Highlight tone — used for edge glow, accent lines */
  accent: { r: number; g: number; b: number };
  /** Whether we successfully extracted from a real image */
  extracted: boolean;
}

const FALLBACK_PALETTE: MediaPalette = {
  primary:   { r: 14, g: 18, b: 32 },
  secondary: { r: 20, g: 26, b: 42 },
  accent:    { r: 200, g: 164, b: 106 },
  extracted: false,
};

// ─── Color Extraction Engine ──────────────────────────────────────────

function extractMediaPalette(img: HTMLImageElement): MediaPalette {
  const sampleSize = 64;
  const sCanvas = document.createElement('canvas');
  sCanvas.width = sampleSize;
  sCanvas.height = sampleSize;
  const sCtx = sCanvas.getContext('2d');
  if (!sCtx) return FALLBACK_PALETTE;

  sCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
  let data: Uint8ClampedArray;
  try {
    data = sCtx.getImageData(0, 0, sampleSize, sampleSize).data;
  } catch {
    return FALLBACK_PALETTE;
  }

  // Bucket colors into clusters using simplified k-means-ish approach
  // Sample every 4th pixel for speed
  const pixels: { r: number; g: number; b: number; weight: number }[] = [];
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    // Skip near-black and near-white (not useful for tinting)
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    if (lum < 12 || lum > 245) continue;
    // Saturation weight — more saturated pixels are more "interesting"
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    pixels.push({ r, g, b, weight: 0.3 + sat * 0.7 });
  }

  if (pixels.length < 3) return FALLBACK_PALETTE;

  // Sort by weight and cluster into 3 groups
  pixels.sort((a, b) => b.weight - a.weight);

  const clusters = [
    { rSum: 0, gSum: 0, bSum: 0, count: 0 },
    { rSum: 0, gSum: 0, bSum: 0, count: 0 },
    { rSum: 0, gSum: 0, bSum: 0, count: 0 },
  ];

  // Simple distance-based assignment
  const seeds = [pixels[0], pixels[Math.floor(pixels.length * 0.33)], pixels[Math.floor(pixels.length * 0.66)]];
  for (const p of pixels) {
    let bestDist = Infinity, bestIdx = 0;
    for (let c = 0; c < 3; c++) {
      const dr = p.r - seeds[c].r, dg = p.g - seeds[c].g, db = p.b - seeds[c].b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) { bestDist = dist; bestIdx = c; }
    }
    const cl = clusters[bestIdx];
    cl.rSum += p.r * p.weight;
    cl.gSum += p.g * p.weight;
    cl.bSum += p.b * p.weight;
    cl.count += p.weight;
  }

  const resolved = clusters.map(c => {
    if (c.count === 0) return { r: 14, g: 18, b: 32 };
    return {
      r: Math.round(c.rSum / c.count),
      g: Math.round(c.gSum / c.count),
      b: Math.round(c.bSum / c.count),
    };
  });

  // Sort clusters by luminance — darkest = primary, brightest = accent
  resolved.sort((a, b) => (a.r * 0.299 + a.g * 0.587 + a.b * 0.114) - (b.r * 0.299 + b.g * 0.587 + b.b * 0.114));

  // Normalize for premium feel — desaturate and darken for glass use
  const normalize = (c: { r: number; g: number; b: number }, desat: number, darken: number) => {
    const avg = (c.r + c.g + c.b) / 3;
    return {
      r: Math.round((c.r + (avg - c.r) * desat) * darken),
      g: Math.round((c.g + (avg - c.g) * desat) * darken),
      b: Math.round((c.b + (avg - c.b) * desat) * darken),
    };
  };

  return {
    primary:   normalize(resolved[0], 0.35, 0.28),   // deep, heavily desaturated
    secondary: normalize(resolved[1], 0.30, 0.35),   // mid, moderate desat
    accent:    normalize(resolved[2], 0.15, 0.85),    // retain more color for highlights
    extracted: true,
  };
}

/** Blend a media palette color with an environment tint */
function blendPaletteWithEnv(
  palette: MediaPalette,
  tier: 'primary' | 'secondary' | 'accent',
  envTint: { r: number; g: number; b: number; alpha: number },
  paletteStrength: number = 0.6,
): { r: number; g: number; b: number } {
  const c = palette[tier];
  const e = envTint;
  const ps = palette.extracted ? paletteStrength : 0;
  const es = 1 - ps;
  return {
    r: Math.round(c.r * ps + (12 + e.r * e.alpha * 5) * es),
    g: Math.round(c.g * ps + (16 + e.g * e.alpha * 5) * es),
    b: Math.round(c.b * ps + (24 + e.b * e.alpha * 4) * es),
  };
}

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

function envWhite(envTone: EnvironmentTone, alpha: number = 1, tier: 'primary' | 'secondary' | 'meta' = 'primary'): string {
  const { r, g, b, alpha: ta } = envTone.panelTint;
  const warmShift = ta * 1.8;
  
  if (tier === 'primary') {
    const rr = Math.round(250 + r * warmShift * 0.03);
    const gg = Math.round(248 + g * warmShift * 0.02);
    const bb = 244;
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  if (tier === 'secondary') {
    const rr = Math.round(215 + r * warmShift * 0.04);
    const gg = Math.round(218 + g * warmShift * 0.03);
    const bb = 224;
    return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
  }
  const rr = Math.round(140 + r * warmShift * 0.05);
  const gg = Math.round(148 + g * warmShift * 0.04);
  const bb = 164;
  return `rgba(${Math.min(rr, 255)}, ${Math.min(gg, 255)}, ${bb}, ${alpha})`;
}

/** Produce an accent color string — prefer media-derived accent if available */
function paletteAccent(palette: MediaPalette, themeAccent: string, alpha: number = 1): string {
  if (!palette.extracted) return themeAccent;
  const a = palette.accent;
  return `rgba(${a.r}, ${a.g}, ${a.b}, ${alpha})`;
}

// ─── SPECULAR HIGHLIGHT ──────────────────────────────────────────────

function drawSpecularStreak(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, radius: number,
  intensity: number = 0.08,
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const streakGrad = ctx.createLinearGradient(
    x + w * 0.05, y + h * 0.02,
    x + w * 0.55, y + h * 0.15,
  );
  streakGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
  streakGrad.addColorStop(0.3, `rgba(255, 255, 255, ${intensity * 0.3})`);
  streakGrad.addColorStop(0.45, `rgba(255, 255, 255, ${intensity})`);
  streakGrad.addColorStop(0.55, `rgba(255, 255, 255, ${intensity * 0.6})`);
  streakGrad.addColorStop(0.7, `rgba(255, 255, 255, ${intensity * 0.1})`);
  streakGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
  ctx.fillStyle = streakGrad;
  ctx.fillRect(x, y, w, h * 0.2);

  ctx.restore();
}

// ─── EDGE HIGHLIGHT SYSTEM ───────────────────────────────────────────

function drawGlassEdges(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, radius: number,
  intensity: number = 0.16,
  palette?: MediaPalette,
) {
  ctx.save();

  // Use media accent for edge tint if available
  const edgeR = palette?.extracted ? palette.accent.r : 255;
  const edgeG = palette?.extracted ? palette.accent.g : 255;
  const edgeB = palette?.extracted ? palette.accent.b : 255;
  // Blend media accent with white for subtle color-aware edges
  const eR = palette?.extracted ? Math.round(edgeR * 0.3 + 255 * 0.7) : 255;
  const eG = palette?.extracted ? Math.round(edgeG * 0.3 + 255 * 0.7) : 255;
  const eB = palette?.extracted ? Math.round(edgeB * 0.3 + 255 * 0.7) : 255;

  drawRoundedRect(ctx, x, y, w, h, radius);
  const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  borderGrad.addColorStop(0, `rgba(${eR}, ${eG}, ${eB}, ${intensity})`);
  borderGrad.addColorStop(0.15, `rgba(${eR}, ${eG}, ${eB}, ${intensity * 0.7})`);
  borderGrad.addColorStop(0.4, `rgba(${eR}, ${eG}, ${eB}, ${intensity * 0.2})`);
  borderGrad.addColorStop(0.7, `rgba(255, 255, 255, ${intensity * 0.06})`);
  borderGrad.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.03})`);
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top-edge catch light
  ctx.beginPath();
  ctx.moveTo(x + radius, y + 0.5);
  ctx.lineTo(x + w - radius, y + 0.5);
  const topHL = ctx.createLinearGradient(x, y, x + w, y);
  topHL.addColorStop(0, `rgba(${eR}, ${eG}, ${eB}, ${intensity * 0.2})`);
  topHL.addColorStop(0.2, `rgba(${eR}, ${eG}, ${eB}, ${intensity * 0.9})`);
  topHL.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.5})`);
  topHL.addColorStop(0.8, `rgba(255, 255, 255, ${intensity * 0.15})`);
  topHL.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.05})`);
  ctx.strokeStyle = topHL;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Left-edge catch light
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y + radius);
  ctx.lineTo(x + 0.5, y + h * 0.4);
  const leftHL = ctx.createLinearGradient(x, y + radius, x, y + h * 0.4);
  leftHL.addColorStop(0, `rgba(${eR}, ${eG}, ${eB}, ${intensity * 0.5})`);
  leftHL.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.15})`);
  leftHL.addColorStop(1, `rgba(255, 255, 255, 0)`);
  ctx.strokeStyle = leftHL;
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.restore();
}

// ─── L3: Glass Panel Surface — Media-Color-Tinted ─────────────────────

function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  radius: number,
  envTone: EnvironmentTone,
  layer: GlassLayer = 'panel-secondary',
  palette: MediaPalette = FALLBACK_PALETTE,
) {
  ctx.save();

  const opacity = GLASS_OPACITY[layer];

  // COLOR PROPAGATION: blend media palette with environment
  // Stronger media influence on inner panels, fainter on outer
  const paletteStrength = layer === 'panel-hero' ? 0.65 :
                          layer === 'panel-secondary' ? 0.55 :
                          layer === 'panel-tertiary' ? 0.40 : 0.30;
  const blended = blendPaletteWithEnv(palette, 'primary', envTone.panelTint, paletteStrength);
  const blendedSec = blendPaletteWithEnv(palette, 'secondary', envTone.panelTint, paletteStrength * 0.7);

  // Soft diffused shadow
  if (layer === 'panel-hero' || layer === 'panel-secondary') {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${layer === 'panel-hero' ? 0.22 : 0.14})`;
    ctx.shadowBlur = layer === 'panel-hero' ? 28 : 18;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
    ctx.fillStyle = 'rgba(0,0,0,0.01)';
    ctx.fill();
    ctx.restore();
  }

  // Translucent glass fill — media-derived colors
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const baseGrad = ctx.createLinearGradient(
    panel.x + panel.width * LIGHT_ANGLE.x, panel.y,
    panel.x + panel.width * (1 - LIGHT_ANGLE.x), panel.y + panel.height,
  );
  baseGrad.addColorStop(0, `rgba(${blendedSec.r + 20}, ${blendedSec.g + 22}, ${blendedSec.b + 24}, ${opacity * 0.65})`);
  baseGrad.addColorStop(0.3, `rgba(${blended.r + 10}, ${blended.g + 12}, ${blended.b + 14}, ${opacity * 0.85})`);
  baseGrad.addColorStop(0.7, `rgba(${blended.r + 4}, ${blended.g + 5}, ${blended.b + 8}, ${opacity})`);
  baseGrad.addColorStop(1, `rgba(${blended.r}, ${blended.g + 2}, ${blended.b + 4}, ${opacity * 1.05})`);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Refraction illusion
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const refractionGrad = ctx.createRadialGradient(
    panel.x + panel.width * 0.35, panel.y + panel.height * 0.25, 0,
    panel.x + panel.width * 0.5, panel.y + panel.height * 0.5,
    Math.max(panel.width, panel.height) * 0.7,
  );
  const refrIntensity = layer === 'panel-hero' ? 0.06 : layer === 'panel-secondary' ? 0.04 : 0.025;
  refractionGrad.addColorStop(0, `rgba(255, 255, 255, ${refrIntensity})`);
  refractionGrad.addColorStop(0.3, `rgba(255, 255, 255, ${refrIntensity * 0.4})`);
  refractionGrad.addColorStop(0.6, `rgba(255, 255, 255, ${refrIntensity * 0.1})`);
  refractionGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = refractionGrad;
  ctx.fill();

  // Bottom depth fade
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, radius);
  const bottomFade = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.75,
    panel.x, panel.y + panel.height,
  );
  const depthAlpha = layer === 'panel-hero' ? 0.08 : 0.05;
  bottomFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomFade.addColorStop(0.5, `rgba(0, 0, 0, ${depthAlpha * 0.4})`);
  bottomFade.addColorStop(1, `rgba(0, 0, 0, ${depthAlpha})`);
  ctx.fillStyle = bottomFade;
  ctx.fill();

  // Edge highlights — media-tinted
  const edgeIntensity = layer === 'panel-hero' ? 0.20 : layer === 'panel-secondary' ? 0.14 : 0.09;
  drawGlassEdges(ctx, panel.x, panel.y, panel.width, panel.height, radius, edgeIntensity, palette);

  // Specular streak
  const specIntensity = layer === 'panel-hero' ? 0.07 : layer === 'panel-secondary' ? 0.05 : 0.03;
  drawSpecularStreak(ctx, panel.x, panel.y, panel.width, panel.height, radius, specIntensity);

  ctx.restore();
}

// ─── L4: Image Panel (Glass-Housed Media) ─────────────────────────────

function drawMediaPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  img: HTMLImageElement | null,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  if (!panel.visible || !img) return;

  ctx.save();

  // Diffused shadow with media color bleed
  ctx.save();
  const shadowColor = palette.extracted
    ? `rgba(${palette.primary.r}, ${palette.primary.g}, ${palette.primary.b}, 0.35)`
    : 'rgba(0, 0, 0, 0.25)';
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  ctx.fillStyle = 'rgba(0,0,0,0.01)';
  ctx.fill();
  ctx.restore();

  // Draw image within rounded glass housing
  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const panelAspect = panel.width / panel.height;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > panelAspect) {
    sw = img.naturalHeight * panelAspect;
    // Apply image position offset (0-100 mapped to available crop range)
    const maxOffset = img.naturalWidth - sw;
    sx = maxOffset * ((content.imagePosition?.x ?? 50) / 100);
  } else {
    sh = img.naturalWidth / panelAspect;
    const maxOffset = img.naturalHeight - sh;
    sy = maxOffset * ((content.imagePosition?.y ?? 50) / 100);
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
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.10)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  // Bottom gradient
  const bottomFade = ctx.createLinearGradient(
    panel.x, panel.y + panel.height * 0.65,
    panel.x, panel.y + panel.height,
  );
  bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomFade.addColorStop(1, 'rgba(0,0,0,0.20)');
  ctx.fillStyle = bottomFade;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  // Color bleed near image edges — fibre optic emission
  if (palette.extracted) {
    const a = palette.accent;
    const s = palette.secondary;
    // Bottom edge color emission
    const emitGrad = ctx.createLinearGradient(panel.x, panel.y + panel.height * 0.85, panel.x, panel.y + panel.height);
    emitGrad.addColorStop(0, 'rgba(0,0,0,0)');
    emitGrad.addColorStop(0.5, `rgba(${s.r}, ${s.g}, ${s.b}, 0.06)`);
    emitGrad.addColorStop(1, `rgba(${a.r}, ${a.g}, ${a.b}, 0.12)`);
    ctx.fillStyle = emitGrad;
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
  }

  ctx.restore();

  // Glass housing edges — media-tinted
  drawGlassEdges(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius, 0.22, palette);
  drawSpecularStreak(ctx, panel.x, panel.y, panel.width, panel.height, spec.panelRadius, 0.06);

  // Image count badge
  if (content.showImageCountBadge && content.mediaCount > 1) {
    const badgeText = `+${content.mediaCount - 1}`;
    ctx.font = `600 ${18}px ${FONT_FAMILY}`;
    const bw = ctx.measureText(badgeText).width + 26;
    const bh = 32;
    const bx = panel.x + panel.width - bw - 16;
    const by = panel.y + 16;

    drawRoundedRect(ctx, bx, by, bw, bh, 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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
  palette: MediaPalette,
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

  const scale = 1.08;
  const sdw = dw * scale;
  const sdh = dh * scale;
  const sdx = dx - (sdw - dw) / 2;
  const sdy = dy - (sdh - dh) / 2;

  // Apply image position offset for background
  const posX = (content.imagePosition?.x ?? 50) / 100;
  const posY = (content.imagePosition?.y ?? 50) / 100;
  const offsetX = (sdw - spec.width) * (posX - 0.5) * -1;
  const offsetY = (sdh - spec.height) * (posY - 0.5) * -1;

  // Lighter blur + brighter for atmos — image is the main event
  ctx.filter = 'blur(6px) brightness(0.55) saturate(1.3)';
  ctx.drawImage(img, sdx + offsetX, sdy + offsetY, sdw, sdh);
  ctx.filter = 'none';

  // Much lighter overlay — let the image shine through
  const p = palette.primary;
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, spec.height);
  overlayGrad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, 0.15)`);
  overlayGrad.addColorStop(0.35, `rgba(${p.r}, ${p.g}, ${p.b}, ${spec.backgroundOverlayOpacity * 0.6})`);
  overlayGrad.addColorStop(0.65, `rgba(${p.r}, ${p.g}, ${p.b}, ${spec.backgroundOverlayOpacity * 0.7})`);
  overlayGrad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0.45)`);
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  ctx.restore();
}

// ─── L5: Insight Panel ────────────────────────────────────────────────

function drawInsightPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  if (!panel.visible || !content.aiInsight) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-hero', palette);

  const pad = 32;
  const accentColor = paletteAccent(palette, content.theme.accentHex);

  ctx.save();

  // Vertical accent rule — uses media accent
  const ruleH = panel.height - pad * 2;
  const ruleX = panel.x + pad;
  const ruleY = panel.y + pad;
  const ruleGrad = ctx.createLinearGradient(ruleX, ruleY, ruleX, ruleY + ruleH);
  ruleGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
  ruleGrad.addColorStop(0.2, accentColor);
  ruleGrad.addColorStop(0.8, accentColor);
  ruleGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
  ctx.fillStyle = ruleGrad;
  drawRoundedRect(ctx, ruleX, ruleY, 3, ruleH, 1.5);
  ctx.fill();

  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, ruleX, ruleY, 3, ruleH, 1.5);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // "REFLECTION" label
  const labelY = ruleY + 16;
  ctx.font = `600 ${11}px ${FONT_FAMILY}`;
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.7;
  (ctx as any).letterSpacing = '4px';
  ctx.fillText('REFLECTION', ruleX + 18, labelY);
  (ctx as any).letterSpacing = '0px';
  ctx.globalAlpha = 1;

  // Separator
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

  ctx.font = `italic 400 ${fontSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.97, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
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

// ─── L5: Text Panel ───────────────────────────────────────────────────

function drawTextPanel(
  ctx: CanvasRenderingContext2D,
  panel: PanelSpec,
  content: NormalizedShareContent,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-hero', palette);

  const pad = 34;
  const accentColor = paletteAccent(palette, content.theme.accentHex);

  ctx.save();

  // Decorative accent line — media-derived
  const accentLineW = Math.min(60, panel.width * 0.15);
  const accentGrad = ctx.createLinearGradient(panel.x + pad, panel.y + pad, panel.x + pad + accentLineW, panel.y + pad);
  accentGrad.addColorStop(0, accentColor);
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(panel.x + pad, panel.y + pad, accentLineW, 2);

  // Title
  const titleSize = spec.typography.titleFontSize;
  ctx.font = `700 ${titleSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 1, 'primary');
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 12;
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
  palette: MediaPalette,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-secondary', palette);

  const pad = 26;
  const accentColor = paletteAccent(palette, content.theme.accentHex);

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

    ctx.font = `700 ${statSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
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

  // Phrase
  const phraseY = panel.y + panel.height - pad;
  if (phraseY - cursorY > 16) {
    const sepW = Math.min(40, panel.width * 0.1);
    const sepGrad = ctx.createLinearGradient(panel.x + pad, phraseY - phraseSize - 14, panel.x + pad + sepW, phraseY - phraseSize - 14);
    sepGrad.addColorStop(0, accentColor);
    sepGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sepGrad;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(panel.x + pad, phraseY - phraseSize - 14, sepW, 1);
    ctx.globalAlpha = 1;

    ctx.font = `italic 400 ${phraseSize}px ${SERIF_FAMILY}`;
    ctx.fillStyle = accentColor;
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
  palette: MediaPalette,
) {
  if (!panel.visible) return;

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-tertiary', palette);

  const pad = 26;
  const accentColor = paletteAccent(palette, content.theme.accentHex);

  ctx.save();

  const metaSize = spec.typography.metaFontSize;
  const lineGap = 14;

  // Accent diamond — media-derived
  const diamondSize = 6;
  const diamondX = panel.x + pad;
  const diamondCY = panel.y + pad + metaSize * 0.4;
  ctx.save();
  ctx.translate(diamondX + diamondSize / 2, diamondCY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
  ctx.restore();

  let cursorY = panel.y + pad + metaSize;

  ctx.font = `600 ${metaSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = accentColor;
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
  palette: MediaPalette,
  logoImg: HTMLImageElement | null = null,
) {
  if (!panel.visible) return;

  ctx.save();

  const blended = blendPaletteWithEnv(palette, 'primary', envTone.panelTint, 0.5);
  const sealOpacity = GLASS_OPACITY['seal'];
  const sealRadius = Math.min(spec.panelRadius, panel.height / 2);

  drawRoundedRect(ctx, panel.x, panel.y, panel.width, panel.height, sealRadius);
  const grad = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.width * 0.4, panel.y + panel.height);
  grad.addColorStop(0, `rgba(${blended.r + 14}, ${blended.g + 12}, ${blended.b + 8}, ${sealOpacity * 1.1})`);
  grad.addColorStop(0.5, `rgba(${blended.r + 6}, ${blended.g + 6}, ${blended.b + 6}, ${sealOpacity})`);
  grad.addColorStop(1, `rgba(${blended.r}, ${blended.g}, ${blended.b}, ${sealOpacity * 0.9})`);
  ctx.fillStyle = grad;
  ctx.fill();

  drawGlassEdges(ctx, panel.x, panel.y, panel.width, panel.height, sealRadius, 0.08, palette);

  // Seal icon — uses media accent for warmth
  const iconSize = 32;
  const brandSize = spec.typography.brandFontSize + 2;
  const accentColor = paletteAccent(palette, content.theme.accentHex);

  ctx.font = `400 ${brandSize - 1}px ${FONT_FAMILY}`;
  const prefixW = ctx.measureText('Posted from ').width;
  ctx.font = `700 ${brandSize}px ${SERIF_FAMILY}`;
  const nameW = ctx.measureText('LifeStack').width;
  const gap = 14;
  const totalContentW = iconSize + gap + prefixW + nameW;
  const startX = panel.x + (panel.width - totalContentW) / 2;
  const iconX = startX;
  const iconY = panel.y + (panel.height - iconSize) / 2;

  // Seal glow — media-aware
  const a = palette.extracted ? palette.accent : { r: 200, g: 164, b: 106 };
  ctx.shadowColor = `rgba(${a.r}, ${a.g}, ${a.b}, 0.25)`;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 0;

  // Circular seal — gradient from media accent
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  const iconGrad = ctx.createRadialGradient(
    iconX + iconSize * 0.4, iconY + iconSize * 0.35, 0,
    iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2,
  );
  if (palette.extracted) {
    iconGrad.addColorStop(0, `rgba(${Math.min(a.r + 40, 255)}, ${Math.min(a.g + 30, 255)}, ${Math.min(a.b + 20, 255)}, 1)`);
    iconGrad.addColorStop(0.6, `rgba(${a.r}, ${a.g}, ${a.b}, 1)`);
    iconGrad.addColorStop(1, `rgba(${Math.max(a.r - 40, 0)}, ${Math.max(a.g - 35, 0)}, ${Math.max(a.b - 30, 0)}, 1)`);
  } else {
    iconGrad.addColorStop(0, 'hsl(43, 74%, 62%)');
    iconGrad.addColorStop(0.6, 'hsl(43, 70%, 50%)');
    iconGrad.addColorStop(1, 'hsl(40, 55%, 34%)');
  }
  ctx.fillStyle = iconGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Inner ring
  ctx.beginPath();
  ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // LS mark
  ctx.font = `800 ${12}px ${FONT_FAMILY}`;
  ctx.fillStyle = 'rgb(14, 12, 20)';
  ctx.textAlign = 'center';
  ctx.fillText('LS', iconX + iconSize / 2, iconY + iconSize / 2 + 4);
  ctx.textAlign = 'left';

  // Brand text — more prominent
  const textX = iconX + iconSize + gap;
  const textY = panel.y + panel.height / 2 + brandSize * 0.3;

  ctx.font = `400 ${brandSize - 1}px ${FONT_FAMILY}`;
  ctx.fillStyle = envWhite(envTone, 0.50, 'meta');
  (ctx as any).letterSpacing = '0.8px';
  ctx.fillText('Posted from ', textX, textY);

  ctx.font = `700 ${brandSize}px ${SERIF_FAMILY}`;
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.80;
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
  palette: MediaPalette,
) {
  if (!panel.visible || !content.sponsor) return;

  const sponsor = content.sponsor;
  const pad = 22;

  ctx.save();

  drawGlassPanel(ctx, panel, spec.panelRadius, envTone, 'panel-tertiary', palette);

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

// ─── L2: Card Base — Media-Derived Translucent Glass Plane ────────────

function drawCardBase(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  const shellRadius = Math.max(spec.panelRadius, 34);

  ctx.save();

  const baseOpacity = GLASS_OPACITY['base'];
  // Card base uses deep desaturated primary from media
  const blended = blendPaletteWithEnv(palette, 'primary', envTone.panelTint, 0.7);
  const blendedSec = blendPaletteWithEnv(palette, 'secondary', envTone.panelTint, 0.5);

  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  const baseGrad = ctx.createLinearGradient(
    spec.width * LIGHT_ANGLE.x, 0,
    spec.width * (1 - LIGHT_ANGLE.x), spec.height,
  );
  baseGrad.addColorStop(0, `rgba(${blendedSec.r + 18}, ${blendedSec.g + 20}, ${blendedSec.b + 22}, ${baseOpacity * 0.6})`);
  baseGrad.addColorStop(0.25, `rgba(${blended.r + 8}, ${blended.g + 10}, ${blended.b + 14}, ${baseOpacity * 0.8})`);
  baseGrad.addColorStop(0.6, `rgba(${blended.r + 3}, ${blended.g + 4}, ${blended.b + 8}, ${baseOpacity})`);
  baseGrad.addColorStop(1, `rgba(${blended.r}, ${blended.g + 2}, ${blended.b + 4}, ${baseOpacity * 1.08})`);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Refraction glow
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  const refrGlow = ctx.createRadialGradient(
    spec.width * 0.38, spec.height * 0.22, 0,
    spec.width * 0.5, spec.height * 0.4, spec.width * 0.8,
  );
  refrGlow.addColorStop(0, 'rgba(255, 255, 255, 0.035)');
  refrGlow.addColorStop(0.2, 'rgba(255, 255, 255, 0.015)');
  refrGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.005)');
  refrGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = refrGlow;
  ctx.fill();

  // Media color diffusion — radial bleed from center simulating fibre optic spread
  if (palette.extracted) {
    const s = palette.secondary;
    drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
    const colorBleed = ctx.createRadialGradient(
      spec.width * 0.5, spec.height * 0.35, 0,
      spec.width * 0.5, spec.height * 0.5, spec.width * 0.9,
    );
    colorBleed.addColorStop(0, `rgba(${s.r}, ${s.g}, ${s.b}, 0.06)`);
    colorBleed.addColorStop(0.4, `rgba(${s.r}, ${s.g}, ${s.b}, 0.025)`);
    colorBleed.addColorStop(1, `rgba(${s.r}, ${s.g}, ${s.b}, 0)`);
    ctx.fillStyle = colorBleed;
    ctx.fill();
  }

  // Bottom depth
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  const bottomDepth = ctx.createLinearGradient(0, spec.height * 0.8, 0, spec.height);
  bottomDepth.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomDepth.addColorStop(0.5, 'rgba(0, 0, 0, 0.03)');
  bottomDepth.addColorStop(1, 'rgba(0, 0, 0, 0.07)');
  ctx.fillStyle = bottomDepth;
  ctx.fill();

  ctx.restore();
}

// ─── Background — Media-Aware Environment ─────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  theme: ThemeDefinition,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  // Start with theme gradient but allow media palette to influence
  const colors = parseGradient(theme.bgGradient);

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

  // Media-derived atmosphere overlay — color bleed into environment
  if (palette.extracted) {
    const p = palette.primary;
    const s = palette.secondary;
    // Subtle warm wash from media primary
    const mediaWash = ctx.createRadialGradient(
      spec.width * 0.5, spec.height * 0.4, 0,
      spec.width * 0.5, spec.height * 0.4, spec.width * 1.2,
    );
    mediaWash.addColorStop(0, `rgba(${p.r + 20}, ${p.g + 15}, ${p.b + 10}, 0.12)`);
    mediaWash.addColorStop(0.3, `rgba(${s.r + 10}, ${s.g + 8}, ${s.b + 5}, 0.06)`);
    mediaWash.addColorStop(0.7, `rgba(${p.r}, ${p.g}, ${p.b}, 0.02)`);
    mediaWash.addColorStop(1, 'transparent');
    ctx.fillStyle = mediaWash;
    ctx.fillRect(0, 0, spec.width, spec.height);
  }

  // Key light
  const kl = envTone.keyLight;
  const keyGrad = ctx.createRadialGradient(
    spec.width * kl.x, spec.height * kl.y, 0,
    spec.width * kl.x, spec.height * kl.y, spec.width * 2.0,
  );
  keyGrad.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.35})`));
  keyGrad.addColorStop(0.08, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.22})`));
  keyGrad.addColorStop(0.25, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.10})`));
  keyGrad.addColorStop(0.5, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.04})`));
  keyGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Fill light
  const fl = envTone.fillLight;
  const fillGrad = ctx.createRadialGradient(
    spec.width * fl.x, spec.height * fl.y, 0,
    spec.width * fl.x, spec.height * fl.y, spec.width * 1.2,
  );
  fillGrad.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.16})`));
  fillGrad.addColorStop(0.3, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.06})`));
  fillGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Ambient warmth
  const aw = envTone.ambientWarmth;
  const centerGrad = ctx.createRadialGradient(
    spec.width * 0.45, spec.height * 0.30, 0,
    spec.width * 0.45, spec.height * 0.30, spec.width * 1.0,
  );
  centerGrad.addColorStop(0, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.14})`));
  centerGrad.addColorStop(0.35, aw.color.replace(/[\d.]+\)$/, `${aw.intensity * 0.05})`));
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Secondary bloom
  const bloom2 = ctx.createRadialGradient(
    spec.width * 0.72, spec.height * 0.18, 0,
    spec.width * 0.72, spec.height * 0.18, spec.width * 0.65,
  );
  bloom2.addColorStop(0, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.09})`));
  bloom2.addColorStop(0.4, kl.color.replace(/[\d.]+\)$/, `${kl.intensity * 0.025})`));
  bloom2.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, spec.width, spec.height);

  // Cool accent
  const coolAccent = ctx.createRadialGradient(
    spec.width * 0.85, spec.height * 0.75, 0,
    spec.width * 0.85, spec.height * 0.75, spec.width * 0.5,
  );
  coolAccent.addColorStop(0, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.07})`));
  coolAccent.addColorStop(0.5, fl.color.replace(/[\d.]+\)$/, `${fl.intensity * 0.018})`));
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

// ─── L1: Outer Frame — Media-Tinted Structural Shell ──────────────────

function drawOuterFrame(
  ctx: CanvasRenderingContext2D,
  spec: CompositionSpec,
  envTone: EnvironmentTone,
  palette: MediaPalette,
) {
  const shellRadius = Math.max(spec.panelRadius, 34);

  ctx.save();

  // Specular streak
  drawSpecularStreak(ctx, 0, 0, spec.width, spec.height, shellRadius, 0.10);

  // Primary glass edge — tinted by media accent
  const a = palette.extracted ? palette.accent : { r: 255, g: 248, b: 230 };
  const edgeR = Math.round(a.r * 0.4 + 255 * 0.6);
  const edgeG = Math.round(a.g * 0.4 + 250 * 0.6);
  const edgeB = Math.round(a.b * 0.4 + 240 * 0.6);

  drawRoundedRect(ctx, 1, 1, spec.width - 2, spec.height - 2, shellRadius - 1);
  const frameBorder = ctx.createLinearGradient(0, 0, spec.width * 0.5, spec.height);
  frameBorder.addColorStop(0, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.22)`);
  frameBorder.addColorStop(0.10, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.14)`);
  frameBorder.addColorStop(0.3, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.06)`);
  frameBorder.addColorStop(0.6, `rgba(255, 255, 255, 0.025)`);
  frameBorder.addColorStop(1, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.04)`);
  ctx.strokeStyle = frameBorder;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Inner contour
  drawRoundedRect(ctx, 3, 3, spec.width - 6, spec.height - 6, shellRadius - 2.5);
  const innerContour = ctx.createLinearGradient(0, 0, 0, spec.height * 0.15);
  innerContour.addColorStop(0, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.05)`);
  innerContour.addColorStop(0.5, `rgba(255, 255, 255, 0.015)`);
  innerContour.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = innerContour;
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Corner glint — media-tinted
  const glintGrad = ctx.createRadialGradient(
    shellRadius * 1.2, shellRadius * 0.8, 0,
    shellRadius * 1.2, shellRadius * 0.8, shellRadius * 2.5,
  );
  glintGrad.addColorStop(0, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.12)`);
  glintGrad.addColorStop(0.15, `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.04)`);
  glintGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.008)');
  glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  ctx.fillStyle = glintGrad;
  ctx.fill();

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

  // Load media image
  let mediaImg: HTMLImageElement | null = null;
  if (content.hasMedia && content.mediaUrl) {
    try {
      mediaImg = await loadImage(content.mediaUrl);
    } catch {
      // Continue without media
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COLOR EXTRACTION — Media is the source of truth
  // ═══════════════════════════════════════════════════════════════
  const palette: MediaPalette = mediaImg
    ? extractMediaPalette(mediaImg)
    : FALLBACK_PALETTE;

  // ═══════════════════════════════════════════════════════════════
  // LAYER STACK — rendered bottom-to-top
  // ═══════════════════════════════════════════════════════════════

  // ENVIRONMENT — media-aware cinematic background
  drawBackground(ctx, spec, content.theme, envTone, palette);

  // Background image (if background treatment)
  if (content.imageTreatment === 'background') {
    drawBackgroundImage(ctx, spec, content, mediaImg, palette);
  }

  // L2 — CARD BASE — media-derived translucent glass plane
  drawCardBase(ctx, spec, envTone, palette);

  // L3/L4/L5 — CONTENT PANELS
  const panelDrawOrder: [PanelSpec, (ctx: CanvasRenderingContext2D, panel: PanelSpec) => void][] = [
    [spec.panels.media, (c, p) => drawMediaPanel(c, p, content, spec, content.imageTreatment !== 'background' ? mediaImg : null, envTone, palette)],
    [spec.panels.insight, (c, p) => drawInsightPanel(c, p, content, spec, envTone, palette)],
    [spec.panels.text, (c, p) => drawTextPanel(c, p, content, spec, envTone, palette)],
    [spec.panels.momentum, (c, p) => drawMomentumPanel(c, p, content, spec, envTone, palette)],
    [spec.panels.meta, (c, p) => drawMetaPanel(c, p, content, spec, envTone, palette)],
    [spec.panels.sponsor, (c, p) => drawSponsorPanel(c, p, content, spec, envTone, palette)],
    [spec.panels.brand, (c, p) => drawBrandPanel(c, p, content, spec, envTone, palette)],
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

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  drawRoundedRect(ctx, 0, 0, spec.width, spec.height, shellRadius);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  // L1 — OUTER FRAME — media-tinted structural glass edge
  drawOuterFrame(ctx, spec, envTone, palette);

  return canvas;
}
