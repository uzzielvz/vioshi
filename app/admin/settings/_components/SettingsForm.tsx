'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateSettingsAction } from '../actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export type Settings = {
  card_only_threshold_mxn: number
  card_reserve_minutes: number
  spei_reserve_minutes: number
  voucher_hours: number
  manual_hold_days: number
}

function Campo({
  name,
  label,
  hint,
  defaultValue,
  min,
  max,
  step = '1',
}: {
  name: string
  label: string
  hint: string
  defaultValue: number | string
  min: number
  max: number
  step?: string
}) {
  return (
    <div>
      <label
        className="block uppercase tracking-widest text-gray-400 mb-1"
        style={{ ...font, fontSize: '10px' }}
      >
        {label}
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        required
        className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black transition-colors"
        style={{ ...font, fontSize: '11px' }}
      />
      <p className="text-gray-400 mt-1 leading-relaxed" style={{ ...font, fontSize: '10px' }}>
        {hint}
      </p>
    </div>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'GUARDANDO…' : 'GUARDAR'}
    </button>
  )
}

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useFormState(updateSettingsAction, null)

  return (
    <form action={action} className="max-w-2xl space-y-8">
      <Campo
        name="card_only_threshold_mxn"
        label="Umbral solo tarjeta (MXN)"
        hint="Arriba de este monto no se ofrecen OXXO ni SPEI. Se valida en el servidor, no solo escondiendo el botón."
        defaultValue={settings.card_only_threshold_mxn}
        min={0}
        max={100000}
        step="0.01"
      />
      <Campo
        name="card_reserve_minutes"
        label="Reserva con tarjeta (minutos)"
        hint="Mínimo 30: Stripe Checkout no permite que la sesión expire antes, y reserva y sesión deben vencer juntas."
        defaultValue={settings.card_reserve_minutes}
        min={30}
        max={240}
      />
      <Campo
        name="spei_reserve_minutes"
        label="Reserva con SPEI (minutos, día hábil)"
        hint="Solo aplica en días hábiles. En fin de semana o festivo la reserva se extiende sola al cierre del siguiente día hábil, porque Citibanamex confirma hasta entonces."
        defaultValue={settings.spei_reserve_minutes}
        min={15}
        max={1440}
      />
      <Campo
        name="voucher_hours"
        label="Vigencia de ficha OXXO (horas)"
        hint="Stripe solo acepta días enteros para OXXO, así que este valor se redondea hacia arriba al configurar el voucher (24 h → 1 día)."
        defaultValue={settings.voucher_hours}
        min={1}
        max={168}
      />
      <Campo
        name="manual_hold_days"
        label="Apartado manual por DM (días)"
        hint="Duración por defecto de un apartado creado a mano desde Reservas."
        defaultValue={settings.manual_hold_days}
        min={1}
        max={30}
      />

      {state && 'error' in state && (
        <p className="text-red-600" style={{ ...font, fontSize: '11px' }}>
          {state.error}
        </p>
      )}
      {state && 'ok' in state && (
        <p className="text-green-700" style={{ ...font, fontSize: '11px' }}>
          {state.ok}
        </p>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Submit />
      </div>
    </form>
  )
}
