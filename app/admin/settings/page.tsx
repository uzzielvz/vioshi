import { createAdminClient } from '@/lib/supabase/admin'
import SettingsForm, { type Settings } from './_components/SettingsForm'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export default async function AdminSettingsPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('settings')
    .select(
      'card_only_threshold_mxn, card_reserve_minutes, spei_reserve_minutes, voucher_hours, manual_hold_days'
    )
    .eq('id', true)
    .single()

  const settings: Settings = {
    card_only_threshold_mxn: Number(data?.card_only_threshold_mxn ?? 500),
    card_reserve_minutes: Number(data?.card_reserve_minutes ?? 30),
    spei_reserve_minutes: Number(data?.spei_reserve_minutes ?? 30),
    voucher_hours: Number(data?.voucher_hours ?? 24),
    manual_hold_days: Number(data?.manual_hold_days ?? 3),
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

      <SettingsForm settings={settings} />
    </div>
  )
}
