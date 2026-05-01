'use client'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updatePickupPoint } from '../actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

type PickupPoint = {
  id: string
  name: string
  address: string
  city: string
  state: string
  type: string
  additional_cost_mxn: number | string
  available_hours: string | null
  estimated_days: string | null
  is_active: boolean
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
      style={{ ...font, fontSize: '11px' }}
    />
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'SAVING...' : 'SAVE CHANGES'}
    </button>
  )
}

const TYPE_OPTIONS = [
  { value: 'flagship', label: 'Flagship' },
  { value: 'retail',   label: 'Retail' },
  { value: 'partner',  label: 'Partner' },
]

export default function PickupPointForm({ point }: { point: PickupPoint }) {
  const [state, formAction] = useFormState(updatePickupPoint, null)

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/pickup-points"
          className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          style={{ ...font, fontSize: '10px' }}
        >
          ← Back to pickup points
        </Link>
      </div>

      <h1 className="uppercase tracking-widest mb-2" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        {point.name}
      </h1>
      <p className="mb-10 text-gray-400 uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
        ID: {point.id}
      </p>

      <form action={formAction} className="max-w-2xl">
        <input type="hidden" name="id" value={point.id} />

        <div className="flex flex-col gap-6">
          <div>
            <FieldLabel>Name</FieldLabel>
            <FieldInput type="text" name="name" defaultValue={point.name} required />
          </div>

          <div>
            <FieldLabel>Address</FieldLabel>
            <FieldInput type="text" name="address" defaultValue={point.address} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>City</FieldLabel>
              <FieldInput type="text" name="city" defaultValue={point.city} required />
            </div>
            <div>
              <FieldLabel>State</FieldLabel>
              <FieldInput type="text" name="state" defaultValue={point.state} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Type</FieldLabel>
              <select
                name="type"
                defaultValue={point.type}
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Costo adicional MXN</FieldLabel>
              <FieldInput
                type="number"
                name="additional_cost_mxn"
                defaultValue={point.additional_cost_mxn?.toString() ?? '0'}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Horarios disponibles</FieldLabel>
            <textarea
              name="available_hours"
              defaultValue={point.available_hours ?? ''}
              rows={3}
              placeholder="Ej: Lun-Vie 10:00-19:00, Sáb 11:00-18:00"
              className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors resize-none"
              style={{ ...font, fontSize: '11px' }}
            />
          </div>

          <div>
            <FieldLabel>Días estimados de entrega</FieldLabel>
            <FieldInput
              type="text"
              name="estimated_days"
              defaultValue={point.estimated_days ?? ''}
              placeholder="Ej: Disponible en 2-3 días"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={point.is_active}
                className="w-3.5 h-3.5 accent-black border border-black"
              />
              <span className="uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
                Activo (visible en checkout)
              </span>
            </label>
          </div>
        </div>

        {state?.error && (
          <div className="mt-8 bg-red-50 border border-red-200 px-4 py-3 text-red-600" style={{ ...font, fontSize: '11px' }}>
            {state.error}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
          <Link
            href="/admin/pickup-points"
            className="border border-black uppercase tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors"
            style={{ ...font, fontSize: '10px' }}
          >
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
