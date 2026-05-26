'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'

type Brand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

type FormAction = (
  prevState: { error: string } | null,
  formData: FormData
) => Promise<{ error: string } | null>

const font = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block uppercase tracking-widest text-gray-400 mb-1" style={{ ...font, fontSize: '10px' }}>
      {children}
    </label>
  )
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors"
      style={{ ...font, fontSize: '13px' }}
    />
  )
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE BRAND'}
    </button>
  )
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function BrandForm({
  action,
  mode,
  brand,
}: {
  action: FormAction
  mode: 'create' | 'edit'
  brand?: Brand
}) {
  const [state, formAction] = useFormState(action, null)
  const [name, setName] = useState(brand?.name ?? '')
  const [slug, setSlug] = useState(brand?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logo_url ?? null)
  const [removeLogo, setRemoveLogo] = useState(false)

  const isEdit = mode === 'edit'

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
      setRemoveLogo(false)
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {isEdit && <input type="hidden" name="id" value={brand!.id} />}

      {/* Name */}
      <div>
        <FieldLabel>Brand Name</FieldLabel>
        <FieldInput
          type="text"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (!slugTouched) {
              setSlug(toSlug(e.target.value))
            }
          }}
          placeholder="Polo Ralph Lauren"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <FieldLabel>Slug (URL friendly)</FieldLabel>
        <FieldInput
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugTouched(true)
          }}
          placeholder="polo-ralph-lauren"
          required
        />
        <p className="text-gray-400 text-xs mt-1" style={{ ...font, fontSize: '10px' }}>
          Used in URLs. Lowercase, no spaces.
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <FieldLabel>Logo (Black &amp; White recommended)</FieldLabel>

        {logoPreview && !removeLogo && (
          <div className="mb-3 flex items-center gap-4">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-12 w-auto object-contain border border-gray-200 p-2 grayscale bg-white"
            />
            <button
              type="button"
              onClick={() => {
                setLogoPreview(null)
                setRemoveLogo(true)
              }}
              className="text-xs uppercase tracking-widest text-red-600 hover:text-red-700"
            >
              Remove logo
            </button>
          </div>
        )}

        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleLogoChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-gray-300 file:text-xs file:uppercase file:tracking-widest file:bg-white hover:file:bg-gray-50"
        />
        <p className="text-gray-400 text-xs mt-1.5" style={{ ...font, fontSize: '10px' }}>
          PNG, JPG, WebP or SVG • Max 2MB • Will be displayed in B/W in filters
        </p>

        {/* Hidden fields for edit mode */}
        {isEdit && (
          <>
            <input type="hidden" name="keep_logo" value={!removeLogo && !!brand?.logo_url ? 'on' : 'off'} />
            {removeLogo && <input type="hidden" name="remove_logo" value="on" />}
          </>
        )}
      </div>

      {/* Active */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          defaultChecked={brand?.is_active ?? true}
          className="w-4 h-4 accent-black"
        />
        <label htmlFor="is_active" className="uppercase tracking-widest text-sm" style={font}>
          Active (visible in filters)
        </label>
      </div>

      {/* Error */}
      {state?.error && (
        <div className="text-red-600 text-sm border-l-2 border-red-600 pl-3" style={font}>
          {state.error}
        </div>
      )}

      <div className="pt-4">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}
