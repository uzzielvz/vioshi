import { createAdminClient } from '@/lib/supabase/admin'
import FondosClient, { type Fondo } from './_components/FondosClient'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export default async function AdminFondosPage() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('orphan_funds_pending')
    .select('*')
    .order('received_at', { ascending: true })

  const fondos: Fondo[] = (data ?? []).map((f) => ({
    id: f.id,
    stripe_transaction_id: f.stripe_transaction_id,
    stripe_customer_id: f.stripe_customer_id,
    amount_mxn: Number(f.amount_mxn),
    received_at: f.received_at,
    dias_transcurridos: Number(f.dias_transcurridos),
    dias_para_devolucion_auto: Number(f.dias_para_devolucion_auto),
    dias_para_barrido: Number(f.dias_para_barrido),
  }))

  return (
    <div>
      <h1
        className="uppercase tracking-widest mb-2"
        style={{ ...font, fontSize: '13px', fontWeight: 500 }}
      >
        Dinero sin pedido
      </h1>
      <p className="text-gray-500 mb-8 max-w-3xl leading-relaxed" style={{ ...font, fontSize: '11px' }}>
        Transferencias SPEI que llegaron sin un pedido vivo al cual aplicarlas. Ese dinero{' '}
        <strong>no rebota al banco del cliente</strong>: se queda como saldo suyo en Stripe. A los{' '}
        <strong>75 días</strong> Stripe intenta devolverlo solo; a los <strong>90</strong>, si no
        pudo identificar la cuenta, lo pasa a tu balance — o sea, te quedas con dinero de alguien a
        quien no le entregaste nada.
      </p>

      <FondosClient fondos={fondos} />
    </div>
  )
}
