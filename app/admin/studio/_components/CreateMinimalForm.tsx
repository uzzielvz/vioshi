'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createMinimalProduct } from '../actions'
import { font } from './studioUi'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'CREATING...' : '+ CREATE'}
    </button>
  )
}

export default function CreateMinimalForm() {
  const [state, formAction] = useFormState(createMinimalProduct, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-4 items-end">
        <div>
          <label className="block uppercase tracking-widest text-gray-400 mb-1" style={{ ...font, fontSize: '10px' }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Pieza única"
            className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors"
            style={{ ...font, fontSize: '11px' }}
          />
        </div>
        <div>
          <label className="block uppercase tracking-widest text-gray-400 mb-1" style={{ ...font, fontSize: '10px' }}>
            Price MXN
          </label>
          <input
            type="number"
            name="price_mxn"
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors"
            style={{ ...font, fontSize: '11px' }}
          />
        </div>
        <SubmitButton />
      </div>
      {state?.error && (
        <p className="text-red-500" style={{ ...font, fontSize: '11px' }}>
          {state.error}
        </p>
      )}
    </form>
  )
}
