'use client'

import { useRef, useState, useTransition, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  approveGeneration,
  copyRawPhoto,
  deleteRawPhoto,
  discardGeneration,
  uploadRawPhoto,
} from '../actions'
import {
  DEFAULT_MODEL_COUNT,
  MAX_MODEL_COUNT,
  SHOT_LABELS,
  SHOT_TYPES,
  type GenerationKind,
  type ImageQuality,
  type ModelGender,
  type ShotType,
} from '@/lib/studio/constants'
import { font } from './studioUi'

type RawPhoto = { id: string; shot_type: ShotType; signedUrl: string | null }

type Generation = {
  id: string
  kind: GenerationKind
  status: 'pending' | 'approved' | 'discarded'
  model: string
  clean_wear: boolean
  signedUrl: string | null
  created_at: string
}

type LocalCell = Generation & { error?: string; busy?: boolean }

export default function StudioWorkspace({
  product,
  rawPhotos,
  generations,
}: {
  product: { id: string; name: string; slug: string; price_mxn: string | number }
  rawPhotos: RawPhoto[]
  generations: Generation[]
}) {
  const router = useRouter()
  const [includeCatalog, setIncludeCatalog] = useState(true)
  const [includeBack, setIncludeBack] = useState(true)
  const [modelCount, setModelCount] = useState(DEFAULT_MODEL_COUNT)
  const [quality, setQuality] = useState<ImageQuality>('flash')
  const [gender, setGender] = useState<ModelGender>('male')
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [localCells, setLocalCells] = useState<LocalCell[]>([])
  const [pending, startTransition] = useTransition()
  const [regenCell, setRegenCell] = useState<LocalCell | null>(null)
  const [regenNote, setRegenNote] = useState('')
  const [regenBack, setRegenBack] = useState(false)
  const poseTick = useRef(0)

  const rawByType = new Map(rawPhotos.map((p) => [p.shot_type, p]))
  const visibleGens: LocalCell[] = [
    ...generations.filter((g) => g.status !== 'discarded'),
    ...localCells.filter((c) => !generations.some((g) => g.id === c.id)),
  ]

  async function handleGenerate() {
    if (rawPhotos.length === 0) {
      setError('Sube al menos una foto real de la prenda')
      return
    }
    if (!includeCatalog && modelCount < 1 && !includeBack) {
      setError('Elige catálogo, fotos de modelo, o espalda')
      return
    }

    setError(null)
    setGenerating(true)

    try {
      const descRes = await fetch('/api/admin/studio/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const descJson = await descRes.json()
      if (!descRes.ok) {
        setError(describeError(descJson.error))
        return
      }

      const jobs: { kind: GenerationKind; poseIndex: number; lookIndex: number; view: 'front' | 'back' }[] = []
      if (includeCatalog) jobs.push({ kind: 'catalog', poseIndex: 0, lookIndex: 0, view: 'front' })
      for (let i = 0; i < modelCount; i++) {
        jobs.push({ kind: 'model', poseIndex: i, lookIndex: i, view: 'front' })
      }
      if (includeBack) {
        jobs.push({ kind: 'model', poseIndex: 0, lookIndex: modelCount, view: 'back' })
      }

      const placeholders: LocalCell[] = jobs.map((job, i) => ({
        id: `tmp-${Date.now()}-${i}`,
        kind: job.kind,
        status: 'pending',
        model: quality === 'pro' && job.kind === 'model' ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image',
        clean_wear: true,
        signedUrl: null,
        created_at: new Date().toISOString(),
        busy: true,
      }))
      setLocalCells((prev) => [...placeholders, ...prev])

      await Promise.all(
        jobs.map(async (job, i) => {
          const tempId = placeholders[i].id
          try {
            const res = await fetch('/api/admin/studio/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                kind: job.kind,
                quality: job.kind === 'model' ? quality : 'flash',
                gender,
                cleanWear: true,
                description: descJson.description,
                poseIndex: job.poseIndex,
                lookIndex: job.lookIndex,
                view: job.view,
              }),
            })
            const json = await res.json()
            if (!res.ok || !json.generation) {
              setLocalCells((prev) =>
                prev.map((c) =>
                  c.id === tempId ? { ...c, busy: false, error: describeError(json.error) } : c
                )
              )
              return
            }
            const g = json.generation as Generation
            setLocalCells((prev) => prev.map((c) => (c.id === tempId ? { ...g, busy: false } : c)))
          } catch {
            setLocalCells((prev) =>
              prev.map((c) => (c.id === tempId ? { ...c, busy: false, error: 'Error de red' } : c))
            )
          }
        })
      )

      router.refresh()
    } finally {
      setGenerating(false)
    }
  }

  function openRegen(cell: LocalCell) {
    if (cell.status === 'approved') return
    setRegenNote('')
    setRegenBack(false)
    setRegenCell(cell)
  }

  async function handleRegenerate(cell: LocalCell, changeNote: string, fromBack: boolean) {
    if (cell.status === 'approved') return
    setError(null)
    setGenerating(true)
    setRegenCell(null)
    try {
      const descRes = await fetch('/api/admin/studio/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const descJson = await descRes.json()
      if (!descRes.ok) {
        setError(describeError(descJson.error))
        return
      }

      if (!cell.id.startsWith('tmp-')) {
        await discardGeneration(cell.id, product.id)
      }

      poseTick.current += 1
      const res = await fetch('/api/admin/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          kind: cell.kind,
          quality: cell.kind === 'model' ? quality : 'flash',
          gender,
          cleanWear: true,
          description: descJson.description,
          poseIndex: poseTick.current,
          lookIndex: poseTick.current + 3,
          view: fromBack ? 'back' : 'front',
          changeNote: changeNote.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.generation) {
        setError(describeError(json.error))
        return
      }
      setLocalCells((prev) => [
        json.generation as Generation,
        ...prev.filter((c) => c.id !== cell.id),
      ])
      router.refresh()
    } finally {
      setGenerating(false)
    }
  }

  function runApprove(id: string) {
    startTransition(async () => {
      const result = await approveGeneration(id, product.id)
      if (result?.error) setError(result.error)
      else {
        setLocalCells((prev) => prev.filter((c) => c.id !== id))
        router.refresh()
      }
    })
  }

  function runDiscard(id: string) {
    startTransition(async () => {
      if (id.startsWith('tmp-')) {
        setLocalCells((prev) => prev.filter((c) => c.id !== id))
        return
      }
      const result = await discardGeneration(id, product.id)
      if (result?.error) setError(result.error)
      else {
        setLocalCells((prev) => prev.filter((c) => c.id !== id))
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <Link
            href="/admin/studio"
            className="uppercase tracking-widest text-gray-400 hover:text-black"
            style={{ ...font, fontSize: '10px' }}
          >
            ← Studio
          </Link>
          <h1 className="uppercase tracking-widest mt-2" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
            {product.name}
          </h1>
        </div>
        <Link
          href={`/admin/products/${product.id}`}
          className="uppercase tracking-widest border-b border-black hover:opacity-50"
          style={{ ...font, fontSize: '10px' }}
        >
          Edit product
        </Link>
      </div>

      <section>
        <h2 className="uppercase tracking-widest mb-4" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Raw photos
        </h2>
        <p className="text-gray-400 mb-4" style={{ ...font, fontSize: '10px' }}>
          Fotos reales. Arrastra, pega (Ctrl+V) o copia entre slots. No salen en la tienda.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SHOT_TYPES.map((shot) => (
            <RawSlot
              key={shot}
              productId={product.id}
              shot={shot}
              photo={rawByType.get(shot)}
              disabled={pending || generating}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 max-w-xl">
        <h2 className="uppercase tracking-widest" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Generate
        </h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCatalog}
            onChange={(e) => setIncludeCatalog(e.target.checked)}
          />
          <span className="uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
            Catalog (white 4:5, flat-lay)
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeBack}
            onChange={(e) => setIncludeBack(e.target.checked)}
          />
          <span className="uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
            Foto de espalda
          </span>
        </label>

        <div>
          <label className="block uppercase tracking-widest text-gray-400 mb-1" style={{ ...font, fontSize: '10px' }}>
            Model shots
          </label>
          <input
            type="number"
            min={0}
            max={MAX_MODEL_COUNT}
            value={modelCount}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              setModelCount(Number.isFinite(n) ? Math.min(MAX_MODEL_COUNT, Math.max(0, n)) : 0)
            }}
            className="w-24 border-b border-gray-200 bg-transparent py-2 focus:outline-none focus:border-black"
            style={{ ...font, fontSize: '11px' }}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
            Model
          </span>
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`uppercase tracking-widest ${gender === 'male' ? 'text-black border-b border-black' : 'text-gray-400'}`}
            style={{ ...font, fontSize: '10px' }}
          >
            Hombre
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`uppercase tracking-widest ${gender === 'female' ? 'text-black border-b border-black' : 'text-gray-400'}`}
            style={{ ...font, fontSize: '10px' }}
          >
            Mujer
          </button>
        </div>

        <p className="text-gray-400" style={{ ...font, fontSize: '10px' }}>
          Modelo joven y delgado, lookbook Supreme / Yeezy / Dior. Fondo blanco. La prenda es lo que más se ve.
        </p>

        <div className="flex items-center gap-4">
          <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
            Quality
          </span>
          <button
            type="button"
            onClick={() => setQuality('flash')}
            className={`uppercase tracking-widest ${quality === 'flash' ? 'text-black border-b border-black' : 'text-gray-400'}`}
            style={{ ...font, fontSize: '10px' }}
          >
            Flash
          </button>
          <button
            type="button"
            onClick={() => setQuality('pro')}
            className={`uppercase tracking-widest ${quality === 'pro' ? 'text-black border-b border-black' : 'text-gray-400'}`}
            style={{ ...font, fontSize: '10px' }}
            title="gemini-3-pro-image — solo fotos de modelo"
          >
            Pro (model only)
          </button>
        </div>

        <button
          type="button"
          disabled={generating || pending}
          onClick={handleGenerate}
          className="self-start bg-black text-white uppercase tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
          style={{ ...font, fontSize: '10px', fontWeight: 500 }}
        >
          {generating ? 'GENERATING...' : 'GENERATE'}
        </button>
      </section>

      {error && (
        <p className="text-red-500" style={{ ...font, fontSize: '11px' }}>
          {error}
        </p>
      )}

      <section>
        <h2 className="uppercase tracking-widest mb-4" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Grid
        </h2>
        {visibleGens.length === 0 ? (
          <p className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '11px' }}>
            No generations yet
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleGens.map((cell) => (
              <div key={cell.id} className="flex flex-col gap-2">
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  {cell.signedUrl && !cell.error ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cell.signedUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
                        {cell.busy ? '...' : cell.error ? 'Error' : '—'}
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center uppercase tracking-widest"
                    style={{ ...font, fontSize: '8px', padding: '2px 0' }}
                  >
                    {cell.kind}
                    {cell.status === 'approved' ? ' · live' : ''}
                  </span>
                </div>
                {cell.error && (
                  <p className="text-red-500" style={{ ...font, fontSize: '10px' }}>
                    {cell.error}
                  </p>
                )}
                {cell.status !== 'approved' && !cell.busy && (
                  <div className="flex gap-3">
                    {!cell.id.startsWith('tmp-') && !cell.error && (
                      <button
                        type="button"
                        disabled={pending || generating}
                        onClick={() => runApprove(cell.id)}
                        className="uppercase tracking-widest border-b border-black hover:opacity-50 disabled:opacity-50"
                        style={{ ...font, fontSize: '10px' }}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pending || generating}
                      onClick={() => openRegen(cell)}
                      className="uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-50"
                      style={{ ...font, fontSize: '10px' }}
                    >
                      Regen
                    </button>
                    <button
                      type="button"
                      disabled={pending || generating}
                      onClick={() => runDiscard(cell.id)}
                      className="uppercase tracking-widest text-gray-400 hover:text-red-500 disabled:opacity-50"
                      style={{ ...font, fontSize: '10px' }}
                    >
                      Discard
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {regenCell && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[20vh] px-4">
          <div className="bg-white w-full max-w-md p-6 flex flex-col gap-4">
            <p className="uppercase tracking-widest" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
              Regen {regenCell.kind}
            </p>
            <textarea
              autoFocus
              value={regenNote}
              onChange={(e) => setRegenNote(e.target.value)}
              placeholder="Qué quieres cambiar? (pose, crop, más logo, menos sombra…)"
              rows={4}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:border-black resize-none"
              style={{ ...font, fontSize: '11px' }}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={regenBack}
                onChange={(e) => setRegenBack(e.target.checked)}
              />
              <span className="uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
                Vista de espalda
              </span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                disabled={generating}
                onClick={() => handleRegenerate(regenCell, regenNote, regenBack)}
                className="bg-black text-white uppercase tracking-widest px-4 py-2 disabled:opacity-50"
                style={{ ...font, fontSize: '10px', fontWeight: 500 }}
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() => setRegenCell(null)}
                className="uppercase tracking-widest text-gray-400 hover:text-black"
                style={{ ...font, fontSize: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const STUDIO_SHOT_DRAG = 'application/x-viogi-shot'

function fileFromClipboard(data: DataTransfer | null): File | undefined {
  if (!data) return undefined
  if (data.files?.[0]?.type.startsWith('image/')) return data.files[0]
  for (const item of Array.from(data.items ?? [])) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) return file
    }
  }
  return undefined
}

function RawSlot({
  productId,
  shot,
  photo,
  disabled,
}: {
  productId: string
  shot: ShotType
  photo?: RawPhoto
  disabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [over, setOver] = useState(false)
  const [copied, setCopied] = useState(false)

  function onFile(file: File | undefined) {
    if (!file) return
    const fd = new FormData()
    fd.set('productId', productId)
    fd.set('shotType', shot)
    fd.set('file', file)
    setError(null)
    startTransition(async () => {
      const result = await uploadRawPhoto(fd)
      if (result?.error) setError(result.error)
      else router.refresh()
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setOver(false)
    if (disabled || pending) return
    const fromShot = e.dataTransfer.getData(STUDIO_SHOT_DRAG) as ShotType | ''
    if (fromShot && SHOT_TYPES.includes(fromShot) && fromShot !== shot) {
      startTransition(async () => {
        const result = await copyRawPhoto(productId, fromShot, shot)
        if (result?.error) setError(result.error)
        else router.refresh()
      })
      return
    }
    onFile(e.dataTransfer.files?.[0])
  }

  function onDelete() {
    if (!photo) return
    startTransition(async () => {
      const result = await deleteRawPhoto(photo.id, productId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  async function onCopy() {
    if (!photo?.signedUrl) return
    try {
      const res = await fetch(photo.signedUrl)
      const blob = await res.blob()
      const type = blob.type.startsWith('image/') ? blob.type : 'image/png'
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('No se pudo copiar. Arrastra la foto o usa clic derecho.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
        {SHOT_LABELS[shot]}
      </span>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!disabled && !pending) inputRef.current?.click()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled && !pending) inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onPaste={(e) => {
          e.preventDefault()
          onFile(fileFromClipboard(e.clipboardData))
        }}
        className={`relative aspect-[4/5] border border-dashed overflow-hidden bg-gray-50 transition-colors outline-none ${
          over ? 'border-black' : 'border-gray-300 hover:border-black'
        } ${disabled || pending ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
      >
        {photo?.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.signedUrl}
            alt=""
            draggable
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => {
              e.dataTransfer.setData(STUDIO_SHOT_DRAG, shot)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            className="w-full h-full object-cover cursor-grab"
          />
        ) : (
          <span className="uppercase tracking-widest text-gray-400 flex items-center justify-center h-full px-2 text-center" style={{ ...font, fontSize: '10px' }}>
            {pending ? '...' : 'Arrastra o +'}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="flex gap-3">
        {photo && (
          <button
            type="button"
            disabled={disabled || pending}
            onClick={onCopy}
            className="uppercase tracking-widest text-gray-400 hover:text-black text-left disabled:opacity-50"
            style={{ ...font, fontSize: '10px' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        {photo && (
          <button
            type="button"
            disabled={disabled || pending}
            onClick={onDelete}
            className="uppercase tracking-widest text-gray-400 hover:text-red-500 text-left disabled:opacity-50"
            style={{ ...font, fontSize: '10px' }}
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500" style={{ ...font, fontSize: '10px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function describeError(code: unknown): string {
  const value = typeof code === 'string' ? code : 'error'
  const map: Record<string, string> = {
    unauthorized: 'Sesión expirada. Vuelve a entrar al admin.',
    missing_gemini_key: 'Falta GEMINI_API_KEY en el servidor.',
    no_raw_photos: 'Sube fotos reales de la prenda.',
    missing_description: 'Falló la descripción de la prenda.',
    description_failed: 'Gemini no devolvió descripción (visión).',
    image_failed: 'Gemini Image no devolvió foto. ¿La key tiene cuota Image?',
    rate_limited: 'Demasiadas generaciones. Espera un momento.',
    product_not_found: 'Producto no encontrado.',
  }
  return map[value] ?? value
}
