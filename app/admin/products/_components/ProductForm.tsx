'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageUploader from './ImageUploader'
import {
  CONDITIONS,
  CONDITION_LABELS,
  GARMENT_TYPES,
  GARMENT_TYPE_LABELS,
  MEASUREMENT_LABELS,
  MEASUREMENT_MAX_CM,
  MEASUREMENT_MIN_CM,
  OWNERS,
  requiredMeasurements,
} from '@/lib/garments'

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
  brand_id?: string | null
  sku: string | null
  material: string | null
  made_in: string
  is_featured: boolean
  is_new: boolean
  sold_out: boolean
  owner?: string | null
  cost_mxn?: string | number | null
  garment_type?: string | null
  chest_cm?: number | null
  length_cm?: number | null
  sleeve_cm?: number | null
  waist_cm?: number | null
  rise_cm?: number | null
  inseam_cm?: number | null
  condition?: string | null
  defect_notes?: string | null
  product_images: ExistingImage[]
  product_attributes?: { key: string; value: string }[]
}

export type AdminBrand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

// 'marca' was replaced by dedicated brands system (BR-03).
// 'Talla' es fijo a propósito: es la FUENTE DE VERDAD de la talla que lee
// lib/products.ts (extractSize). Si se captura con otra clave, no se muestra.
const FIXED_ATTRS = ['Talla', 'color']
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
  brands = [],
  product,
  action,
}: {
  categories: Category[]
  brands?: AdminBrand[]
  product?: AdminProduct
  action: FormAction
}) {
  const [state, formAction] = useFormState(action, null)
  const [name, setName]               = useState(product?.name ?? '')
  const [slug, setSlug]               = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!product)

  // Build initial attrs: fixed keys first, then any extras from DB.
  // 'marca' is now handled via brand_id (legacy values are ignored here).
  const initAttrs = (): { key: string; value: string }[] => {
    const existing = (product?.product_attributes ?? []).filter(a => a.key.toLowerCase() !== 'marca')
    // Comparación case-insensitive: filas viejas pueden traer 'talla' o 'Color'
    // y no deben duplicar la fila fija.
    const isFixed = (key: string) =>
      FIXED_ATTRS.some(f => f.toLowerCase() === key.trim().toLowerCase())
    const fixed = FIXED_ATTRS.map(k => ({
      key: k,
      value: existing.find(a => a.key.trim().toLowerCase() === k.toLowerCase())?.value ?? '',
    }))
    const custom = existing.filter(a => !isFixed(a.key))
    return [...fixed, ...custom]
  }
  const [attrs, setAttrs] = useState<{ key: string; value: string }[]>(initAttrs)
  const [garmentType, setGarmentType] = useState(product?.garment_type ?? '')
  const [condition, setCondition]     = useState(product?.condition ?? '')

  // Solo estas medidas se montan y se exigen. Las demás no existen en el DOM,
  // para que `required` nunca bloquee el submit en un campo invisible.
  const visibleMeasurements = requiredMeasurements(garmentType)

  function addAttr() {
    setAttrs(prev => [...prev, { key: '', value: '' }])
  }
  function removeAttr(i: number) {
    setAttrs(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateAttr(i: number, field: 'key' | 'value', val: string) {
    setAttrs(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a))
  }

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

            {/* Brand Selector (BR-03) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel>Brand</FieldLabel>
                <button
                  type="button"
                  onClick={() => {
                    // Opens the brand creation in a new tab for now (simple & safe)
                    window.open('/admin/brands/new', '_blank')
                  }}
                  className="uppercase tracking-widest text-[10px] text-gray-400 hover:text-black"
                  style={font}
                >
                  + Create new brand
                </button>
              </div>

              <select
                name="brand_id"
                defaultValue={product?.brand_id ?? ''}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                <option value="">— No brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 text-[10px] mt-1" style={font}>
                Select from managed brands. Logos will appear in the public filters.
              </p>
            </div>

            {/* Tipo de prenda — define qué medidas se piden abajo */}
            <div>
              <FieldLabel>Tipo de prenda *</FieldLabel>
              <select
                name="garment_type"
                required
                value={garmentType}
                onChange={e => setGarmentType(e.target.value)}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                <option value="">— Selecciona tipo —</option>
                {GARMENT_TYPES.map(t => (
                  <option key={t} value={t}>{GARMENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Medidas — solo las que aplican al tipo elegido */}
            {garmentType && (
              <div>
                <FieldLabel>Medidas en cm (prenda en plano) *</FieldLabel>
                {visibleMeasurements.length === 0 ? (
                  <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
                    El tipo «Otro» no exige medidas. Si la prenda las necesita, agrégalas en Características.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {visibleMeasurements.map(key => (
                        <div key={key}>
                          <label
                            className="block uppercase tracking-widest text-gray-400 mb-1"
                            style={{ ...font, fontSize: '10px' }}
                          >
                            {MEASUREMENT_LABELS[key]}
                          </label>
                          <FieldInput
                            type="number"
                            name={key}
                            required
                            min={MEASUREMENT_MIN_CM}
                            max={MEASUREMENT_MAX_CM}
                            step="1"
                            defaultValue={product?.[key]?.toString() ?? ''}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 mt-2" style={{ ...font, fontSize: '10px' }}>
                      El pecho se mide de axila a axila, no es el contorno.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Estado */}
            <div>
              <FieldLabel>Estado *</FieldLabel>
              <select
                name="condition"
                required
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                <option value="">— Selecciona estado —</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {condition === 'con_detalles' && (
              <div>
                <FieldLabel>Detalles de la prenda *</FieldLabel>
                <textarea
                  name="defect_notes"
                  required
                  defaultValue={product?.defect_notes ?? ''}
                  rows={3}
                  placeholder="Ej. Pequeña mancha en el puño izquierdo, 1 cm. Sin agujeros."
                  className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors resize-none"
                  style={{ ...font, fontSize: '11px' }}
                />
                <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
                  Se muestra al cliente con la misma prominencia que las medidas.
                </p>
              </div>
            )}

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
                <FieldLabel>SKU (automático)</FieldLabel>
                {/* Se genera en el servidor al crear. Aquí solo se muestra;
                    readOnly (no disabled) para que siga viajando en el submit. */}
                <input
                  type="text"
                  name="sku"
                  readOnly
                  tabIndex={-1}
                  defaultValue={product?.sku ?? ''}
                  placeholder="Se genera al guardar"
                  className="w-full border-b border-gray-100 bg-transparent py-2.5 text-gray-400 cursor-default focus:outline-none"
                  style={{ ...font, fontSize: '11px' }}
                />
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

            {/* Características */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <FieldLabel>Características</FieldLabel>
                <button
                  type="button"
                  onClick={addAttr}
                  className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                  style={{ ...font, fontSize: '10px' }}
                >
                  <span className="text-base leading-none">+</span> Agregar
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {attrs.map((attr, i) => {
                  const isFixed = i < FIXED_ATTRS.length
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        name="attr_key"
                        value={attr.key}
                        onChange={e => updateAttr(i, 'key', e.target.value)}
                        placeholder="Característica"
                        readOnly={isFixed}
                        className={`w-32 border-b bg-transparent py-2 focus:outline-none transition-colors ${
                          isFixed
                            ? 'border-gray-100 text-gray-400 cursor-default'
                            : 'border-gray-200 focus:border-black'
                        }`}
                        style={{ ...font, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                      />
                      <input
                        type="text"
                        name="attr_value"
                        value={attr.value}
                        onChange={e => updateAttr(i, 'value', e.target.value)}
                        placeholder="Valor"
                        className="flex-1 border-b border-gray-200 bg-transparent py-2 focus:outline-none focus:border-black transition-colors"
                        style={{ ...font, fontSize: '11px' }}
                      />
                      {!isFixed && (
                        <button
                          type="button"
                          onClick={() => removeAttr(i)}
                          className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── INTERNO — no se muestra nunca en la tienda ────────────── */}
            <div className="border border-gray-200 bg-gray-50 p-4">
              <p
                className="uppercase tracking-widest text-gray-400 mb-1"
                style={{ ...font, fontSize: '10px', fontWeight: 500 }}
              >
                Interno · no visible para el cliente
              </p>
              <p className="text-gray-400 mb-4" style={{ ...font, fontSize: '10px' }}>
                Propiedad y costo. Se usa para repartir utilidad y calcular margen.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Propietario *</FieldLabel>
                  <select
                    name="owner"
                    required
                    defaultValue={product?.owner ?? ''}
                    className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                    style={{ ...font, fontSize: '11px' }}
                  >
                    <option value="">— Selecciona —</option>
                    {OWNERS.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Costo de adquisición MXN</FieldLabel>
                  <FieldInput
                    type="number"
                    name="cost_mxn"
                    min="0"
                    step="0.01"
                    defaultValue={product?.cost_mxn?.toString() ?? ''}
                  />
                </div>
              </div>
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
