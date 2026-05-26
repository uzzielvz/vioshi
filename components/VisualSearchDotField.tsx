'use client';

import { useEffect, useRef } from 'react';

interface VisualSearchDotFieldProps {
  /** Spacing between dots in CSS pixels */
  gridSize?: number;
  /** Radius of each dot in CSS pixels */
  dotRadius?: number;
  /** Spatial frequency of the noise (higher = more chaotic) */
  noiseScale?: number;
  /** Time multiplier; lower = slower breath */
  noiseSpeed?: number;
  /** [min, max] opacity for each dot */
  opacityRange?: [number, number];
  /** Dot color (any CSS color) */
  color?: string;
  /** Optional className passed to the canvas */
  className?: string;
}

/**
 * Hash-based 2D value noise. No deps. Returns a value in [0, 1].
 * Smooth + tileable enough for our diffusion-style brightness field.
 */
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

  // 8 corner samples for trilinear interp (3D = ruido continuo en el tiempo)
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
 * Canvas-based diffusion dot field inspired by ChatGPT's "creating image"
 * indicator. Each dot's opacity is driven by a 3D value-noise sample
 * (x, y, time) so the field "breathes" as a continuous neural-style mask
 * without any sweeping line or visible pattern.
 *
 * Tuned for Viogi's minimalism: white dots over black, subtle contrast,
 * no animations beyond brightness modulation.
 */
export default function VisualSearchDotField({
  gridSize = 16,
  dotRadius = 1.3,
  noiseScale = 0.07,
  noiseSpeed = 0.0007,
  opacityRange = [0.12, 0.9],
  color = '#ffffff',
  className,
}: VisualSearchDotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

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

    const [minA, maxA] = opacityRange;
    const range = maxA - minA;

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      const z = t * noiseSpeed;

      for (let x = gridSize / 2; x < width; x += gridSize) {
        for (let y = gridSize / 2; y < height; y += gridSize) {
          const n = valueNoise(x * noiseScale, y * noiseScale, z);
          ctx.globalAlpha = minA + n * range;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [gridSize, dotRadius, noiseScale, noiseSpeed, opacityRange, color]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
