'use client';

import { useEffect, useRef } from 'react';

export interface DotFieldCropRect {
  /** All values in [0, 1] relative to the canvas. Dots render only inside this box. */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualSearchDotFieldProps {
  /** Object URL or remote URL of the image whose silhouette drives the dots */
  imageUrl: string;
  /** Spacing between grid points in CSS pixels */
  gridSize?: number;
  /** Minimum dot radius (low-density / background areas) */
  baseRadius?: number;
  /** Maximum dot radius (high-density / garment areas) */
  peakRadius?: number;
  /** Spatial frequency of the breathing noise */
  noiseScale?: number;
  /** Time multiplier for the breathing */
  noiseSpeed?: number;
  /** Max pixel offset for direction-shifting jitter */
  jitterMag?: number;
  /** Size multiplier added at image contours (edge detection) */
  contourBoost?: number;
  /** Dot color (ignored when `rainbow` is on) */
  color?: string;
  /**
   * Iridescent mode: instead of a flat color, each dot is tinted with a
   * flowing rainbow whose hue travels diagonally while a brightness wave
   * sweeps the silhouette — "arcoíris recorriendo el contorno de la prenda".
   */
  rainbow?: boolean;
  /** If provided, restrict dots to this sub-rectangle of the canvas (relative coords). */
  cropRect?: DotFieldCropRect;
  /** Passed through to the canvas element */
  className?: string;
}

/** Inline 3D value noise — no deps, smooth in time so the field breathes. */
function hash(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}
function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
function valueNoise(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const a = hash(ix, iy, iz);
  const b = hash(ix + 1, iy, iz);
  const c = hash(ix, iy + 1, iz);
  const d = hash(ix + 1, iy + 1, iz);
  const e = hash(ix, iy, iz + 1);
  const f = hash(ix + 1, iy, iz + 1);
  const g = hash(ix, iy + 1, iz + 1);
  const h = hash(ix + 1, iy + 1, iz + 1);

  const sx = smooth(fx);
  const sy = smooth(fy);
  const sz = smooth(fz);

  const x0 = a * (1 - sx) + b * sx;
  const x1 = c * (1 - sx) + d * sx;
  const x2 = e * (1 - sx) + f * sx;
  const x3 = g * (1 - sx) + h * sx;
  const y0 = x0 * (1 - sy) + x1 * sy;
  const y1 = x2 * (1 - sy) + x3 * sy;
  return y0 * (1 - sz) + y1 * sz;
}

/**
 * VisualSearchDotField
 *
 * Canvas dot field driven by the uploaded image itself:
 *   - density (size + opacity)  → derived from luminance of the source pixel
 *     (darker pixels ≈ garment → bigger, brighter dots)
 *   - contour boost              → simple gradient magnitude makes edge dots pop,
 *     tracing the silhouette of the prenda
 *   - breathing                  → 3D value noise modulates size + brightness over time
 *   - direction-shifting jitter  → each dot is offset by a noise-driven angle that
 *     drifts slowly, so the swarm "changes direction" without a uniform sweep
 *
 * Designed to be absolutely-positioned over the rendered <img> so the dot
 * cloud is bounded exactly by the image box (no dots over background).
 */
export default function VisualSearchDotField({
  imageUrl,
  gridSize = 14,
  baseRadius = 0.5,
  peakRadius = 2.6,
  noiseScale = 0.05,
  noiseSpeed = 0.00085,
  jitterMag = 4,
  contourBoost = 2.4,
  color = '#ffffff',
  rainbow = false,
  cropRect,
  className,
}: VisualSearchDotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const sampleRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let cancelled = false;

    // Offscreen sampling canvas — moderate resolution keeps getImageData cheap.
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    // Low-res field used by `rainbow` mode: we paint soft blobs here, then
    // upscale onto the main canvas so they melt into a diffused cloud.
    const fieldCanvas = document.createElement('canvas');
    const fctx = fieldCanvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled || !offCtx) return;
      const SAMPLE_W = 220;
      const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
      const SAMPLE_H = Math.max(1, Math.round(SAMPLE_W * ratio));
      offscreen.width = SAMPLE_W;
      offscreen.height = SAMPLE_H;
      offCtx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      sampleRef.current = offCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
    };
    img.src = imageUrl;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /**
     * Density at (u, v) in [0, 1] across the image. Higher = more "stuff" at that pixel.
     * Strategy: darker pixels = garment ⇒ higher density. Alpha gates transparent areas.
     */
    function sampleDensity(u: number, v: number): number {
      const data = sampleRef.current;
      if (!data) return 0.45; // neutral while image is loading
      const sx = Math.max(0, Math.min(data.width - 1, Math.floor(u * (data.width - 1))));
      const sy = Math.max(0, Math.min(data.height - 1, Math.floor(v * (data.height - 1))));
      const idx = (sy * data.width + sx) * 4;
      const r = data.data[idx];
      const g = data.data[idx + 1];
      const b = data.data[idx + 2];
      const a = data.data[idx + 3] / 255;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // (1 - lum) so dark = high density; floor at 0.05 so background isn't fully empty
      return a * Math.max(0.05, 1 - lum);
    }

    /** Cheap gradient magnitude → boosts dots that sit on contour lines. */
    function sampleEdge(u: number, v: number): number {
      const eps = 0.012;
      const c = sampleDensity(u, v);
      const r = sampleDensity(Math.min(1, u + eps), v);
      const d = sampleDensity(u, Math.min(1, v + eps));
      return Math.abs(r - c) + Math.abs(d - c);
    }

    function frame(t: number) {
      if (!ctx) return;

      const z = t * noiseSpeed;
      const slowZ = t * 0.00022; // slow direction-shift clock
      const flow = t * 0.00010; // hue travels diagonally across the prenda
      // Brightness wave that sweeps top→bottom and loops, tracing the contour.
      const sweepY = ((t * 0.00035) % 1.4) - 0.2;

      // If a cropRect is provided, dots render only inside that sub-box.
      const cx0 = cropRect ? cropRect.x * width : 0;
      const cy0 = cropRect ? cropRect.y * height : 0;
      const cx1 = cropRect ? (cropRect.x + cropRect.width) * width : width;
      const cy1 = cropRect ? (cropRect.y + cropRect.height) * height : height;

      // ── Rainbow mode: diffused iridescent cloud ──────────────────────────
      // Paint soft blobs onto a low-res field, then upscale with bilinear
      // smoothing so they blend into a cloud (no visible dots) that follows
      // the garment contour and breathes with the sweeping wave.
      if (rainbow && fctx) {
        const FS = 0.3; // field scale → how much it blurs when upscaled
        const fw = Math.max(1, Math.round(width * FS));
        const fh = Math.max(1, Math.round(height * FS));
        if (fieldCanvas.width !== fw || fieldCanvas.height !== fh) {
          fieldCanvas.width = fw;
          fieldCanvas.height = fh;
        }
        fctx.clearRect(0, 0, fw, fh);
        const blobR = gridSize * FS * 1.4;

        for (let x = cx0 + gridSize / 2; x < cx1; x += gridSize) {
          for (let y = cy0 + gridSize / 2; y < cy1; y += gridSize) {
            const u = x / width;
            const v = y / height;
            const density = sampleDensity(u, v);
            const edge = sampleEdge(u, v);
            // Skip empty background so the cloud hugs the garment only.
            if (density < 0.1 && edge < 0.015) continue;

            const n = valueNoise(x * noiseScale, y * noiseScale, z);
            const contour = Math.min(1, edge * 6);
            const band = Math.max(0, 1 - Math.abs(v - sweepY) * 4);

            // Flowing hue: diagonal position + time → the rainbow travels.
            const hue = ((((u * 0.45 + v * 1.0 + flow) % 1) + 1) % 1) * 360;
            const light = Math.min(78, 54 + contour * 12 + band * 14 + n * 6);
            const alpha = Math.min(
              1,
              0.12 + density * 0.4 + contour * 0.5 + band * 0.25 + n * 0.15
            );
            const r = blobR * (0.8 + density * 0.5 + contour * 0.6 + band * 0.4);

            fctx.globalAlpha = alpha;
            fctx.fillStyle = `hsl(${hue.toFixed(0)}, 92%, ${light.toFixed(0)}%)`;
            fctx.beginPath();
            fctx.arc(x * FS, y * FS, Math.max(0.6, r), 0, Math.PI * 2);
            fctx.fill();
          }
        }
        fctx.globalAlpha = 1;

        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(fieldCanvas, 0, 0, fw, fh, 0, 0, width, height);

        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // ── Default mode: crisp dot field ────────────────────────────────────
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (let x = cx0 + gridSize / 2; x < cx1; x += gridSize) {
        for (let y = cy0 + gridSize / 2; y < cy1; y += gridSize) {
          // Sample density relative to the rendered image (canvas spans the
          // image), so u/v always map back to the image pixels even when
          // restricted to the crop sub-region.
          const u = x / width;
          const v = y / height;

          // Image-driven density (this is what gives the swarm its silhouette)
          const density = sampleDensity(u, v);
          const edge = sampleEdge(u, v);

          // Breathing noise — modulates size + opacity
          const n = valueNoise(x * noiseScale, y * noiseScale, z);

          // Direction-shifting jitter: each dot offset by an angle that drifts slowly
          const dirN = valueNoise(x * 0.012, y * 0.012, slowZ);
          const angle = dirN * Math.PI * 4; // rotates as slowZ advances
          const mag = jitterMag * (0.4 + n * 0.7);
          const dx = Math.cos(angle) * mag;
          const dy = Math.sin(angle) * mag;

          // Final radius: base + density ramp + breathing + contour boost
          const radius =
            baseRadius +
            density * (peakRadius - baseRadius) * (0.55 + n * 0.7) +
            edge * contourBoost;

          // Final opacity: bias by density so background is faint, garment is bold
          const opacity = Math.min(1, 0.08 + density * 0.65 + n * 0.25);

          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, Math.max(0.2, radius), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // We intentionally key on the individual cropRect fields instead of the
    // object identity so parents can pass new {x,y,w,h} literals every render
    // without forcing the effect to teardown each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, gridSize, baseRadius, peakRadius, noiseScale, noiseSpeed, jitterMag, contourBoost, color, rainbow, cropRect?.x, cropRect?.y, cropRect?.width, cropRect?.height]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
