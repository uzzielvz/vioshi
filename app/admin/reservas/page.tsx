import { createAdminClient } from '@/lib/supabase/admin'
import ReservasClient, {
  type Reserva,
  type Disponible,
  type RevisionManual,
  type PedidoPorEntregar,
} from './_components/ReservasClient'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export default async function AdminReservasPage() {
  const supabase = createAdminClient()

  // Se filtra por reserved_until > now() en vez de por reserved_order_id: una
  // reserva vencida que el cron no limpió no es una reserva activa.
  const ahora = new Date().toISOString()

  const [{ data: apartadas }, { data: libres }, { data: revisar }, { data: entregar }] =
    await Promise.all([
      supabase
        .from('products')
        .select(
          'id, name, slug, price_mxn, reserved_until, reservation_kind, reserved_contact_name, reserved_contact_phone, reserved_order_id'
        )
        .not('reserved_order_id', 'is', null)
        .gt('reserved_until', ahora)
        .eq('sold_out', false)
        .order('reserved_until', { ascending: true }),
      supabase
        .from('products')
        .select('id, name, price_mxn')
        .eq('sold_out', false)
        .or(`reserved_order_id.is.null,reserved_until.lt.${ahora}`)
        .order('name'),
      supabase
        .from('orders')
        .select('id, order_number, email, phone, total_mxn, review_reason, created_at')
        .eq('needs_review', true)
        .order('created_at', { ascending: false }),
      // Pagados y aún no entregados: lo que falta por recoger/enviar.
      supabase
        .from('orders')
        .select('id, order_number, email, phone, total_mxn, delivery_method, created_at')
        .eq('payment_status', 'completed')
        .not('status', 'in', '(delivered,cancelled)')
        .order('created_at', { ascending: false }),
    ])

  // Datos del pedido detrás de cada reserva, para poder contactar al cliente.
  const orderIds = (apartadas ?? []).map((p) => p.reserved_order_id).filter(Boolean)
  const { data: pedidos } = orderIds.length
    ? await supabase
        .from('orders')
        .select('id, order_number, email, phone, payment_status')
        .in('id', orderIds)
    : { data: [] }

  const porId = new Map((pedidos ?? []).map((o) => [o.id, o]))

  const reservas: Reserva[] = (apartadas ?? []).map((p) => {
    const o = porId.get(p.reserved_order_id as string)
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price_mxn: Number(p.price_mxn),
      reserved_until: p.reserved_until as string,
      reservation_kind: p.reservation_kind as Reserva['reservation_kind'],
      reserved_contact_name: p.reserved_contact_name,
      reserved_contact_phone: p.reserved_contact_phone,
      order_number: o?.order_number ?? null,
      order_email: o?.email ?? null,
      order_phone: o?.phone ?? null,
      payment_status: o?.payment_status ?? null,
    }
  })

  const disponibles: Disponible[] = (libres ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price_mxn: Number(p.price_mxn),
  }))

  const revisiones: RevisionManual[] = (revisar ?? []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    email: o.email,
    phone: o.phone,
    total_mxn: Number(o.total_mxn),
    review_reason: o.review_reason,
    created_at: o.created_at,
  }))

  const porEntregar: PedidoPorEntregar[] = (entregar ?? []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    email: o.email,
    phone: o.phone,
    total_mxn: Number(o.total_mxn),
    delivery_method: o.delivery_method,
    created_at: o.created_at,
  }))

  return (
    <div>
      <h1
        className="uppercase tracking-widest mb-2"
        style={{ ...font, fontSize: '13px', fontWeight: 500 }}
      >
        Reservas
      </h1>
      <p className="text-gray-500 mb-10" style={{ ...font, fontSize: '11px' }}>
        Inventario de pieza única: cada prenda es una sola unidad.
      </p>

      <ReservasClient
        reservas={reservas}
        disponibles={disponibles}
        revisiones={revisiones}
        porEntregar={porEntregar}
      />
    </div>
  )
}
