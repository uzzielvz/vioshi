'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'

type ExistingImage = { id: string; url: string; is_primary: boolean }

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export default function ImageUploader({ existingImages = [] }: { existingImages?: ExistingImage[] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [keptIds, setKeptIds]   = useState<string[]>(existingImages.map(img => img.id))
  const [previews, setPreviews] = useState<string[]>([])

  const keptImages = existingImages.filter(img => keptIds.includes(img.id))
  const hasAnyPrimary = keptImages.length > 0

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach(URL.revokeObjectURL)
    const files = Array.from(e.target.files ?? [])
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removeExisting(id: string) {
    setKeptIds(prev => prev.filter(k => k !== id))
  }

  function clearNewFiles() {
    previews.forEach(URL.revokeObjectURL)
    setPreviews([])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      {keptIds.map(id => (
        <input key={id} type="hidden" name="keptImageIds" value={id} />
      ))}

      {/* Drop zone */}
      <div
        className="border border-dashed border-gray-300 hover:border-black transition-colors cursor-pointer flex items-center justify-center py-12"
        onClick={() => inputRef.current?.click()}
      >
        <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
          + Drop image or click
        </span>
        <input
          ref={inputRef}
          type="file"
          name="images"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Existing images */}
      {keptImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keptImages.map((img, i) => (
            <div key={img.id} className="relative w-16 h-20 group">
              <Image src={img.url} alt="" fill className="object-cover bg-gray-100" sizes="64px" />
              {i === 0 && (
                <span
                  className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center"
                  style={{ ...font, fontSize: '8px', padding: '2px 0' }}
                >
                  MAIN
                </span>
              )}
              <button
                type="button"
                onClick={() => removeExisting(img.id)}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                style={{ fontSize: '12px' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New file previews */}
      {previews.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={src} className="relative w-16 h-20">
                <Image src={src} alt="" fill className="object-cover bg-gray-100" sizes="64px" unoptimized />
                {!hasAnyPrimary && i === 0 && (
                  <span
                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center"
                    style={{ ...font, fontSize: '8px', padding: '2px 0' }}
                  >
                    MAIN
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={clearNewFiles}
            className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline text-left"
            style={{ ...font, fontSize: '10px' }}
          >
            Clear new files
          </button>
        </div>
      )}
    </div>
  )
}
