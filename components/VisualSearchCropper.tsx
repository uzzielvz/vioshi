'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export interface CropRect {
  /** All values in [0, 1] relative to the rendered image bounds */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualSearchCropperProps {
  imageUrl: string;
  onConfirm: (rect: CropRect) => void;
  onBack: () => void;
}

const HANDLE = 14;
const MIN_SIZE = 0.15;

type DragMode = null | 'move' | 'nw' | 'ne' | 'sw' | 'se';

/**
 * VisualSearchCropper (VS-12)
 * Full-screen white shell that lets the user select the garment region before
 * the API analysis kicks in. No external deps — pure pointer events so it
 * works equally well on desktop mouse and mobile touch.
 *
 * Returns a CropRect in normalized [0,1] coordinates so the parent can crop
 * the source File client-side before POSTing to /api/visual-search.
 */
export default function VisualSearchCropper({
  imageUrl,
  onConfirm,
  onBack,
}: VisualSearchCropperProps) {
  const t = useTranslations('search');
  const imgWrapperRef = useRef<HTMLDivElement | null>(null);
  // Pre-set rectangle slightly inset — works well for typical garment photos
  const [rect, setRect] = useState<CropRect>({ x: 0.12, y: 0.1, width: 0.76, height: 0.8 });
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startRect: CropRect;
    bounds: { width: number; height: number };
  } | null>(null);

  useEffect(() => {
    if (!dragMode) return;

    function onPointerMove(e: PointerEvent) {
      if (!dragRef.current) return;
      const { startX, startY, startRect, bounds } = dragRef.current;
      const dx = (e.clientX - startX) / bounds.width;
      const dy = (e.clientY - startY) / bounds.height;

      if (dragMode === 'move') {
        const nx = clamp(startRect.x + dx, 0, 1 - startRect.width);
        const ny = clamp(startRect.y + dy, 0, 1 - startRect.height);
        setRect({ ...startRect, x: nx, y: ny });
        return;
      }

      // Corner resize: opposite corner stays fixed.
      let { x, y, width, height } = startRect;
      if (dragMode === 'nw') {
        const nx = clamp(startRect.x + dx, 0, startRect.x + startRect.width - MIN_SIZE);
        const ny = clamp(startRect.y + dy, 0, startRect.y + startRect.height - MIN_SIZE);
        width = startRect.x + startRect.width - nx;
        height = startRect.y + startRect.height - ny;
        x = nx;
        y = ny;
      } else if (dragMode === 'ne') {
        const nx2 = clamp(startRect.x + startRect.width + dx, startRect.x + MIN_SIZE, 1);
        const ny = clamp(startRect.y + dy, 0, startRect.y + startRect.height - MIN_SIZE);
        width = nx2 - startRect.x;
        height = startRect.y + startRect.height - ny;
        y = ny;
      } else if (dragMode === 'sw') {
        const nx = clamp(startRect.x + dx, 0, startRect.x + startRect.width - MIN_SIZE);
        const ny2 = clamp(startRect.y + startRect.height + dy, startRect.y + MIN_SIZE, 1);
        width = startRect.x + startRect.width - nx;
        height = ny2 - startRect.y;
        x = nx;
      } else if (dragMode === 'se') {
        const nx2 = clamp(startRect.x + startRect.width + dx, startRect.x + MIN_SIZE, 1);
        const ny2 = clamp(startRect.y + startRect.height + dy, startRect.y + MIN_SIZE, 1);
        width = nx2 - startRect.x;
        height = ny2 - startRect.y;
      }
      setRect({ x, y, width, height });
    }

    function onPointerUp() {
      setDragMode(null);
      dragRef.current = null;
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [dragMode]);

  function startDrag(mode: DragMode, e: React.PointerEvent) {
    if (!imgWrapperRef.current) return;
    const bounds = imgWrapperRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
      bounds: { width: bounds.width, height: bounds.height },
    };
    setDragMode(mode);
    e.preventDefault();
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#000000',
  };

  // Convert relative rect → percentage strings for inline styles
  const left = `${rect.x * 100}%`;
  const top = `${rect.y * 100}%`;
  const width = `${rect.width * 100}%`;
  const height = `${rect.height * 100}%`;
  const right = `${(1 - rect.x - rect.width) * 100}%`;
  const bottom = `${(1 - rect.y - rect.height) * 100}%`;

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-white flex flex-col items-center justify-center vs-fade-in">
      {/* Top-left label */}
      <div
        className="absolute"
        style={{ top: '24px', left: '24px', zIndex: 30, ...labelStyle }}
      >
        {t('select_zone')}
      </div>

      {/* Top-right close button */}
      <button
        type="button"
        onClick={onBack}
        aria-label={t('back')}
        className="absolute flex items-center justify-center w-8 h-8 rounded-full border border-black/20 text-black hover:bg-black/5 transition-colors"
        style={{ top: '24px', right: '24px', zIndex: 30 }}
      >
        <span className="text-lg leading-none" style={{ transform: 'translateY(-1px)' }}>×</span>
      </button>

      {/* Image + crop overlay */}
      <div ref={imgWrapperRef} className="relative inline-block select-none" style={{ touchAction: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Imagen para búsqueda visual"
          className="block max-h-[70vh] max-w-[min(90vw,540px)]"
          draggable={false}
        />

        {/* 4 dim strips outside the crop rectangle */}
        <div className="absolute pointer-events-none bg-white/55" style={{ left: 0, right: 0, top: 0, height: top }} />
        <div className="absolute pointer-events-none bg-white/55" style={{ left: 0, right: 0, bottom: 0, height: bottom }} />
        <div className="absolute pointer-events-none bg-white/55" style={{ left: 0, top, bottom, width: left }} />
        <div className="absolute pointer-events-none bg-white/55" style={{ right: 0, top, bottom, width: right }} />

        {/* Crop body — draggable to move */}
        <div
          onPointerDown={(e) => startDrag('move', e)}
          className="absolute border border-black cursor-move"
          style={{ left, top, width, height, zIndex: 5 }}
        >
          {/* Rule-of-thirds guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 border-l border-black/30" style={{ left: '33.333%' }} />
            <div className="absolute top-0 bottom-0 border-l border-black/30" style={{ left: '66.666%' }} />
            <div className="absolute left-0 right-0 border-t border-black/30" style={{ top: '33.333%' }} />
            <div className="absolute left-0 right-0 border-t border-black/30" style={{ top: '66.666%' }} />
          </div>
        </div>

        {/* Corner handles */}
        {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
          const style: React.CSSProperties = {
            width: HANDLE,
            height: HANDLE,
            zIndex: 10,
            cursor:
              corner === 'nw' || corner === 'se'
                ? 'nwse-resize'
                : 'nesw-resize',
          };
          if (corner === 'nw') {
            style.left = `calc(${left} - ${HANDLE / 2}px)`;
            style.top = `calc(${top} - ${HANDLE / 2}px)`;
          } else if (corner === 'ne') {
            style.right = `calc(${right} - ${HANDLE / 2}px)`;
            style.top = `calc(${top} - ${HANDLE / 2}px)`;
          } else if (corner === 'sw') {
            style.left = `calc(${left} - ${HANDLE / 2}px)`;
            style.bottom = `calc(${bottom} - ${HANDLE / 2}px)`;
          } else if (corner === 'se') {
            style.right = `calc(${right} - ${HANDLE / 2}px)`;
            style.bottom = `calc(${bottom} - ${HANDLE / 2}px)`;
          }
          return (
            <div
              key={corner}
              onPointerDown={(e) => startDrag(corner, e)}
              className="absolute bg-black"
              style={style}
              aria-label={`resize-${corner}`}
            />
          );
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onConfirm(rect)}
        className="absolute bg-black text-white hover:bg-neutral-800 transition-colors"
        style={{
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '14px 36px',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
          zIndex: 30,
        }}
      >
        {t('find')}
      </button>
    </div>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
