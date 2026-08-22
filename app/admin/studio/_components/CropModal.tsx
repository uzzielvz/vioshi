'use client'

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { IG_POST_HEIGHT, IG_POST_WIDTH } from '@/lib/studio/constants'
import { font } from './studioUi'

const BOX_W = 320
const BOX_H = 400

export default function CropModal({
  generationId,
  onCancel,
  onApply,
}: {
  generationId: string
  onCancel: () => void
  onApply: (file: File) => void
}) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    fetch(`/api/admin/studio/generation-file?id=${encodeURIComponent(generationId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('load_failed')
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la imagen')
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [generationId])

  function coverScale(nw: number, nh: number) {
    return Math.max(BOX_W / nw, BOX_H / nh)
  }

  function displaySize() {
    const img = imgRef.current
    if (!img) return { w: BOX_W, h: BOX_H, cover: 1 }
    const cover = coverScale(img.naturalWidth, img.naturalHeight)
    return { w: img.naturalWidth * cover * zoom, h: img.naturalHeight * cover * zoom, cover }
  }

  function clampPan(next: { x: number; y: number }, z = zoom) {
    const img = imgRef.current
    if (!img) return next
    const cover = coverScale(img.naturalWidth, img.naturalHeight)
    const w = img.naturalWidth * cover * z
    const h = img.naturalHeight * cover * z
    return {
      x: Math.min(0, Math.max(BOX_W - w, next.x)),
      y: Math.min(0, Math.max(BOX_H - h, next.y)),
    }
  }

  function onImgLoad() {
    const img = imgRef.current
    if (!img) return
    const cover = coverScale(img.naturalWidth, img.naturalHeight)
    const w = img.naturalWidth * cover
    const h = img.naturalHeight * cover
    setZoom(1)
    setPan({ x: (BOX_W - w) / 2, y: (BOX_H - h) / 2 })
    setReady(true)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    setPan(
      clampPan({
        x: drag.current.panX + (e.clientX - drag.current.x),
        y: drag.current.panY + (e.clientY - drag.current.y),
      })
    )
  }

  function onPointerUp() {
    drag.current = null
  }

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault()
    const img = imgRef.current
    if (!img) return
    const next = Math.min(4, Math.max(1, zoom * (e.deltaY > 0 ? 0.92 : 1.08)))
    const { w, h } = displaySize()
    const cx = BOX_W / 2
    const cy = BOX_H / 2
    const relX = (cx - pan.x) / w
    const relY = (cy - pan.y) / h
    const cover = coverScale(img.naturalWidth, img.naturalHeight)
    const nw = img.naturalWidth * cover * next
    const nh = img.naturalHeight * cover * next
    setZoom(next)
    setPan(clampPan({ x: cx - relX * nw, y: cy - relY * nh }, next))
  }

  async function apply() {
    const img = imgRef.current
    if (!img || saving) return
    setSaving(true)
    const { w, h } = displaySize()
    const sx = (-pan.x / w) * img.naturalWidth
    const sy = (-pan.y / h) * img.naturalHeight
    const sw = (BOX_W / w) * img.naturalWidth
    const sh = (BOX_H / h) * img.naturalHeight

    const canvas = document.createElement('canvas')
    canvas.width = IG_POST_WIDTH
    canvas.height = IG_POST_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setSaving(false)
      setError('No se pudo recortar')
      return
    }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, IG_POST_WIDTH, IG_POST_HEIGHT)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, IG_POST_WIDTH, IG_POST_HEIGHT)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    setSaving(false)
    if (!blob) {
      setError('No se pudo recortar')
      return
    }
    onApply(new File([blob], 'crop.jpg', { type: 'image/jpeg' }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[8vh] px-4">
      <div className="bg-white w-full max-w-md p-6 flex flex-col gap-4">
        <p className="uppercase tracking-widest" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Recortar · {IG_POST_WIDTH}×{IG_POST_HEIGHT} (IG 4:5)
        </p>
        <p className="text-gray-400" style={{ ...font, fontSize: '10px' }}>
          Arrastra para encuadrar. Rueda para zoom. El recuadro es el post vertical.
        </p>
        <div
          className="relative overflow-hidden bg-gray-100 mx-auto touch-none cursor-grab active:cursor-grabbing"
          style={{ width: BOX_W, height: BOX_H }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              className="absolute max-w-none select-none pointer-events-none"
              style={{
                width: ready ? displaySize().w : undefined,
                height: ready ? displaySize().h : undefined,
                transform: `translate(${pan.x}px, ${pan.y}px)`,
              }}
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center uppercase tracking-widest text-gray-400"
              style={{ ...font, fontSize: '10px' }}
            >
              {error ?? '...'}
            </span>
          )}
          <div className="absolute inset-0 pointer-events-none border border-black/40" />
        </div>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              const img = imgRef.current
              if (!img) return
              const next = Math.max(1, zoom * 0.9)
              const { w, h } = displaySize()
              const cover = coverScale(img.naturalWidth, img.naturalHeight)
              const nw = img.naturalWidth * cover * next
              const nh = img.naturalHeight * cover * next
              setZoom(next)
              setPan(
                clampPan(
                  {
                    x: BOX_W / 2 - ((BOX_W / 2 - pan.x) / w) * nw,
                    y: BOX_H / 2 - ((BOX_H / 2 - pan.y) / h) * nh,
                  },
                  next
                )
              )
            }}
            className="uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-50"
            style={{ ...font, fontSize: '10px' }}
          >
            − Zoom
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              const img = imgRef.current
              if (!img) return
              const next = Math.min(4, zoom * 1.12)
              const { w, h } = displaySize()
              const cover = coverScale(img.naturalWidth, img.naturalHeight)
              const nw = img.naturalWidth * cover * next
              const nh = img.naturalHeight * cover * next
              setZoom(next)
              setPan(
                clampPan(
                  {
                    x: BOX_W / 2 - ((BOX_W / 2 - pan.x) / w) * nw,
                    y: BOX_H / 2 - ((BOX_H / 2 - pan.y) / h) * nh,
                  },
                  next
                )
              )
            }}
            className="uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-50"
            style={{ ...font, fontSize: '10px' }}
          >
            + Zoom
          </button>
        </div>
        {error && src && (
          <p className="text-red-500" style={{ ...font, fontSize: '10px' }}>
            {error}
          </p>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            disabled={!ready || saving}
            onClick={apply}
            className="bg-black text-white uppercase tracking-widest px-4 py-2 disabled:opacity-50"
            style={{ ...font, fontSize: '10px', fontWeight: 500 }}
          >
            {saving ? '...' : 'Apply crop'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="uppercase tracking-widest text-gray-400 hover:text-black"
            style={{ ...font, fontSize: '10px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
