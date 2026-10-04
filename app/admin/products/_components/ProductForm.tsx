'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import ImageUploader from './ImageUploader'
import {
  CONDITIONS,
  CONDITION_LABELS,
  DISPOSITION_LABELS,
  DISPOSITIONS,
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
  price_mxn: string | number | null
  original_price_mxn: string | number | null
  category_id: string | null
  brand_id?: string | null
  sku: string | null
  material: string | null
  made_in: string
  is_featured: boolean
  is_new: boolean
  sold_out: boolean
  listed?: boolean
  owner?: string | null
  cost_mxn?: string | number | null
  acquired_on?: string | null
  disposition?: string | null
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

/**
 * Alto y tipografía de todo control del formulario.
 *
 * `text-base` (16px) en móvil no es estética: por debajo de 16px, Safari en iOS
 * hace zoom automático al enfocar el campo, y capturar decenas de prendas con
 * la pantalla saltando en cada input es inviable. En `md` vuelve a 11px.
 * `min-h-[44px]` es el objetivo táctil mínimo.
 */
const CONTROL_CLASS =
  'w-full border-b border-gray-200 bg-transparent py-2.5 min-h-[44px] md:min-h-0 text-base md:text-[11px] focus:outline-none focus:border-black transition-colors'

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={CONTROL_CLASS} style={font} />
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest w-full sm:w-auto px-8 py-4 sm:py-3 min-h-[48px] hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '11px', fontWeight: 500 }}
    >
      {pending ? 'Guardando…' : isEdit ? 'Guardar' : 'Registrar'}
    </button>
  )
}

export default function ProductForm({
  categories,
  brands = [],
  product,
  action,
  actor = 'uzziel',
}: {
  categories: Category[]
  brands?: AdminBrand[]
  product?: AdminProduct
  action: FormAction
  actor?: 'uzziel' | 'mario'
}) {
  const [state, formAction] = useFormState(action, null)
  const [garmentType, setGarmentType] = useState(product?.garment_type ?? '')
  const [condition, setCondition] = useState(product?.condition ?? '')
  const [listed, setListed] = useState(product?.listed ?? false)
  const initialBrand = brands.find((b) => b.id === product?.brand_id)?.name ?? ''
  const visibleMeasurements = requiredMeasurements(garmentType)
  const isEdit = !!product

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          style={{ ...font, fontSize: '10px' }}
        >
          ← Inventario
        </Link>
      </div>

      <h1 className="uppercase tracking-widest mb-2" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        {isEdit ? 'Editar prenda' : 'Registrar prenda'}
      </h1>
      <p className="text-gray-400 mb-10" style={{ ...font, fontSize: '11px' }}>
        Registro interno. No sale en la tienda hasta que lo marques abajo.
      </p>

      <form action={formAction} className="flex flex-col gap-6">
        {isEdit && <input type="hidden" name="id" value={product.id} />}

        <div>
          <FieldLabel>Nombre *</FieldLabel>
          <FieldInput type="text" name="name" defaultValue={product?.name ?? ''} required />
        </div>

        <div>
          <FieldLabel>Marca</FieldLabel>
          <FieldInput
            type="text"
            name="brand_name"
            list="brand-names"
            defaultValue={initialBrand}
            placeholder="Adidas, Nike…"
            autoComplete="off"
          />
          <datalist id="brand-names">
            {brands.map((b) => (
              <option key={b.id} value={b.name} />
            ))}
          </datalist>
          <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
            Si no existe, se crea. La siguiente vez ya sale en la lista.
          </p>
        </div>

        <div>
          <FieldLabel>Tipo de prenda *</FieldLabel>
          <select
            name="garment_type"
            required
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
            className={`${CONTROL_CLASS} appearance-none`}
            style={font}
          >
            <option value="">— Selecciona —</option>
            {GARMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {GARMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Estado</FieldLabel>
          <select
            name="condition"
            required={listed}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={`${CONTROL_CLASS} appearance-none`}
            style={font}
          >
            <option value="">— Selecciona —</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        {condition === 'con_detalles' && (
          <div>
            <FieldLabel>Detalles *</FieldLabel>
            <textarea
              name="defect_notes"
              required
              defaultValue={product?.defect_notes ?? ''}
              rows={3}
              placeholder="Mancha en el puño, 1 cm. Sin agujeros."
              className={`${CONTROL_CLASS} resize-none`}
              style={font}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>{listed ? 'Precio MXN *' : 'Precio MXN'}</FieldLabel>
            <FieldInput
              type="number"
              name="price_mxn"
              defaultValue={product?.price_mxn?.toString() ?? ''}
              required={listed}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <FieldLabel>Costo de adquisición</FieldLabel>
            <FieldInput
              type="number"
              name="cost_mxn"
              min="0"
              step="0.01"
              defaultValue={product?.cost_mxn?.toString() ?? ''}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Fecha de compra</FieldLabel>
            <FieldInput
              type="date"
              name="acquired_on"
              defaultValue={product?.acquired_on ?? ''}
            />
            <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
              Cuándo la compraste, no cuándo la registras. Si la dejas vacía, no cuenta
              como compra del mes.
            </p>
          </div>
          <div>
            <FieldLabel>Destino</FieldLabel>
            <select
              name="disposition"
              defaultValue={product?.disposition ?? 'activa'}
              className={`${CONTROL_CLASS} appearance-none`}
              style={font}
            >
              {DISPOSITIONS.map((d) => (
                <option key={d} value={d}>
                  {DISPOSITION_LABELS[d]}
                </option>
              ))}
            </select>
            <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
              Lo que no es inventario activo sale del capital y no se puede publicar.
            </p>
          </div>
        </div>

        <div>
          <FieldLabel>Propietario *</FieldLabel>
          {actor === 'mario' ? (
            <>
              <input type="hidden" name="owner" value="mario" />
              <p className="py-2.5" style={{ ...font, fontSize: '11px' }}>
                Mario
              </p>
            </>
          ) : (
            <select
              name="owner"
              required
              defaultValue={product?.owner ?? ''}
              className={`${CONTROL_CLASS} appearance-none`}
              style={font}
            >
              <option value="">— Selecciona —</option>
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o === 'mario' ? 'Mario' : 'Uzziel'}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            name="listed"
            checked={listed}
            onChange={(e) => setListed(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 accent-black border border-black"
          />
          <span style={{ ...font, fontSize: '11px' }}>
            <span className="uppercase tracking-widest" style={{ fontSize: '10px' }}>
              Publicar en la tienda
            </span>
            <span className="block text-gray-400 mt-1" style={{ fontSize: '10px' }}>
              Ahí sí pedimos foto, medidas y categoría. Mientras no, es solo inventario.
            </span>
          </span>
        </label>

        {listed && (
          <div className="border border-gray-200 bg-white p-4 flex flex-col gap-6">
            <div>
              <FieldLabel>Fotos *</FieldLabel>
              <ImageUploader existingImages={product?.product_images ?? []} />
            </div>

            <div>
              <FieldLabel>Categoría</FieldLabel>
              <select
                name="category_id"
                defaultValue={product?.category_id ?? ''}
                className={`${CONTROL_CLASS} appearance-none`}
                style={font}
              >
                <option value="">— Sin categoría —</option>
                {categories
                  .filter((c) => c.slug !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_es}
                    </option>
                  ))}
              </select>
              <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
                Pasillo de la tienda (filtros). El tipo de arriba es qué es la prenda.
              </p>
            </div>

            {garmentType && visibleMeasurements.length > 0 && (
              <div>
                <FieldLabel>Medidas en cm (prenda en plano) *</FieldLabel>
                <div className="grid grid-cols-3 gap-4">
                  {visibleMeasurements.map((key) => (
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
              </div>
            )}
          </div>
        )}

        {state?.error && (
          <div
            className="bg-red-50 border border-red-200 px-4 py-3 text-red-600"
            style={{ ...font, fontSize: '11px' }}
          >
            {state.error}
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="border border-black uppercase tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors"
            style={{ ...font, fontSize: '10px' }}
          >
            Cancelar
          </Link>
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </div>
  )
}
