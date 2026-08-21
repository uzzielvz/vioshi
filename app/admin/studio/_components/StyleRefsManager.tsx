'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStyleRef, uploadStyleRef } from '../actions'
import { MAX_STYLE_REFS, MIN_STYLE_REFS } from '@/lib/studio/constants'
import { font } from './studioUi'

type StyleRef = { id: string; signedUrl: string | null; sort_order: number }

export default function StyleRefsManager({ refs }: { refs: StyleRef[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const canAdd = refs.length < MAX_STYLE_REFS

  function onFile(file: File | undefined) {
    if (!file) return
    const fd = new FormData()
    fd.set('file', file)
    setError(null)
    startTransition(async () => {
      const result = await uploadStyleRef(fd)
      if (result?.error) setError(result.error)
      else router.refresh()
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  function onDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteStyleRef(id)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="uppercase tracking-widest" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Style refs ({refs.length}/{MAX_STYLE_REFS})
        </h2>
        <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
          {refs.length < MIN_STYLE_REFS
            ? `Sube ${MIN_STYLE_REFS}–${MAX_STYLE_REFS} fotos del look de modelo`
            : 'Look de modelo (no salen en la tienda)'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {refs.map((ref) => (
          <div key={ref.id} className="relative w-16 h-20 group bg-gray-100">
            {ref.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ref.signedUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => onDelete(ref.id)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none disabled:opacity-50"
              style={{ fontSize: '12px' }}
            >
              ×
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="w-16 h-20 border border-dashed border-gray-300 hover:border-black transition-colors flex items-center justify-center text-gray-400 disabled:opacity-50"
          >
            <span className="uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
              {pending ? '...' : '+'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {error && (
        <p className="text-red-500 mt-2" style={{ ...font, fontSize: '11px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
