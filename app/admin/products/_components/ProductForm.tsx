'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageUploader from './ImageUploader'

type Category = { id: string; slug: string; name_es: string }
type ExistingImage = { id: string; url: string; is_primary: boolean; sort_order: number }
export type AdminProduct = {
  id: string
  slug: string
  name: string
  description: string | null
  price_mxn: string | number
  original_price_mxn: string | number | null
  category_id: string | null
  sku: string | null
  material: string | null
  made_in: string
  is_featured: boolean
  is_new: boolean
  sold_out: boolean
  product_images: ExistingImage[]
}
type FormAction = (
  prevState: { error: string } | null,
  formData: FormData
) => Promise<{ error: string } | null>

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

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
      style={{ ...font, fontSize: '11px' }}
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
      {pending ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'SAVE PRODUCT'}
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

export default function ProductForm({
  categories,
  product,
  action,
}: {
  categories: Category[]
  product?: AdminProduct
  action: FormAction
}) {
  const [state, formAction] = useFormState(action, null)
  const [name, setName]               = useState(product?.name ?? '')
  const [slug, setSlug]               = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!product)

  useEffect(() => {
    if (!slugTouched) setSlug(toSlug(name))
  }, [name, slugTouched])

  const isEdit = !!product

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          style={{ ...font, fontSize: '10px' }}
        >
          ← Back to products
        </Link>
      </div>

      <h1 className="uppercase tracking-widest mb-10" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>

      <form action={formAction}>
        {isEdit && <input type="hidden" name="id" value={product.id} />}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
          {/* Left — Images */}
          <div>
            <FieldLabel>Images</FieldLabel>
            <ImageUploader existingImages={product?.product_images ?? []} />
          </div>

          {/* Right — Fields */}
          <div className="flex flex-col gap-6">
            <div>
              <FieldLabel>Name</FieldLabel>
              <FieldInput
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <FieldLabel>Slug</FieldLabel>
              <FieldInput
                type="text"
                name="slug"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
                required
              />
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <select
                name="category_id"
                defaultValue={product?.category_id ?? ''}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                <option value="">— Sin categoría —</option>
                {categories.filter(c => c.slug !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name_es}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Price MXN</FieldLabel>
                <FieldInput
                  type="number"
                  name="price_mxn"
                  defaultValue={product?.price_mxn?.toString() ?? ''}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <FieldLabel>Original Price MXN (opcional)</FieldLabel>
                <FieldInput
                  type="number"
                  name="original_price_mxn"
                  defaultValue={product?.original_price_mxn?.toString() ?? ''}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>SKU (opcional)</FieldLabel>
                <FieldInput type="text" name="sku" defaultValue={product?.sku ?? ''} />
              </div>
              <div>
                <FieldLabel>Made In</FieldLabel>
                <FieldInput type="text" name="made_in" defaultValue={product?.made_in ?? 'México'} />
              </div>
            </div>

            <div>
              <FieldLabel>Material (opcional)</FieldLabel>
              <FieldInput type="text" name="material" defaultValue={product?.material ?? ''} />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                name="description"
                defaultValue={product?.description ?? ''}
                rows={4}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors resize-none"
                style={{ ...font, fontSize: '11px' }}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex gap-8">
              {[
                { name: 'is_new',      label: 'Is New',      checked: product?.is_new },
                { name: 'is_featured', label: 'Is Featured', checked: product?.is_featured },
                { name: 'sold_out',    label: 'Sold Out',    checked: product?.sold_out },
              ].map(({ name: n, label, checked }) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer" style={{ ...font, fontSize: '11px' }}>
                  <input
                    type="checkbox"
                    name={n}
                    defaultChecked={checked ?? false}
                    className="w-3.5 h-3.5 accent-black border border-black"
                  />
                  <span className="uppercase tracking-widest" style={{ fontSize: '10px' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {state?.error && (
          <div
            className="mt-8 bg-red-50 border border-red-200 px-4 py-3 text-red-600"
            style={{ ...font, fontSize: '11px' }}
          >
            {state.error}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="border border-black uppercase tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors"
            style={{ ...font, fontSize: '10px' }}
          >
            Cancel
          </Link>
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </div>
  )
}
