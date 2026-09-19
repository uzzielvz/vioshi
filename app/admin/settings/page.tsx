import { createAdminClient } from '@/lib/supabase/admin'
import SettingsForm, { type Settings } from './_components/SettingsForm'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

const BASE_COLUMNS =
  'card_only_threshold_mxn, card_reserve_minutes, spei_reserve_minutes, voucher_hours, manual_hold_days'

export default async function AdminSettingsPage() {
  const supabase = createAdminClient()

  // `home_shipping_mxn` (paquete A1) todavía no tiene migración con número
  // asignado — ver BLOQUEO en docs/agents/STATUS.md. Se intenta leerla y, si
  // la columna no existe aún, se cae al set de columnas de siempre sin tirar
  // el resto de /admin/settings.
  const withShipping = await supabase
    .from('settings')
    .select(`${BASE_COLUMNS}, home_shipping_mxn`)
    .eq('id', true)
    .single()

  const homeShippingAvailable = !withShipping.error
  const data = homeShippingAvailable
    ? withShipping.data
    : (await supabase.from('settings').select(BASE_COLUMNS).eq('id', true).single()).data

  const settings: Settings = {
    card_only_threshold_mxn: Number(data?.card_only_threshold_mxn ?? 500),
    card_reserve_minutes: Number(data?.card_reserve_minutes ?? 30),
    spei_reserve_minutes: Number(data?.spei_reserve_minutes ?? 30),
    voucher_hours: Number(data?.voucher_hours ?? 24),
    manual_hold_days: Number(data?.manual_hold_days ?? 3),
    home_shipping_mxn: Number((data as { home_shipping_mxn?: number } | null)?.home_shipping_mxn ?? 10),
  }

  return (
    <div>
      <h1
        className="uppercase tracking-widest mb-2"
        style={{ ...font, fontSize: '13px', fontWeight: 500 }}
      >
        Parámetros de negocio
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl leading-relaxed" style={{ ...font, fontSize: '11px' }}>
        Estos números no viven en el código: se cambian aquí y aplican de inmediato, sin desplegar
        nada.
      </p>

      <SettingsForm settings={settings} homeShippingAvailable={homeShippingAvailable} />
    </div>
  )
}
