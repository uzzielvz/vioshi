'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { formatPhone, whatsappLink } from '@/lib/phone'
import {
  createManualHoldAction,
  releaseReservationAction,
  toggleSoldAction,
  clearReviewFlagAction,
  markOrderDeliveredAction,
} from '../actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export type Reserva = {
  id: string
  name: string
  slug: string
  price_mxn: number
  reserved_until: string
  reservation_kind: 'card' | 'spei' | 'voucher' | 'manual'
  reserved_contact_name: string | null
  reserved_contact_phone: string | null
  order_number: string | null
  order_email: string | null
  order_phone: string | null
  payment_status: string | null
}

export type Disponible = { id: string; name: string; price_mxn: number }

export type RevisionManual = {
  id: string
  order_number: string
  email: string
  phone: string | null
  total_mxn: number
  review_reason: string | null
  created_at: string
}

export type PedidoPorEntregar = {
  id: string
  order_number: string
  email: string
  phone: string | null
  total_mxn: number
  delivery_method: string
  created_at: string
}

const ETIQUETA_ENTREGA: Record<string, string> = {
  home: 'A domicilio',
  pickup: 'Recolección',
}

const ETIQUETA_TIPO: Record<Reserva['reservation_kind'], string> = {
  card: 'Tarjeta',
  spei: 'SPEI',
  voucher: 'OXXO',
  manual: 'Apartado por DM',
}

function tiempoRestante(hasta: string): { texto: string; urgente: boolean; vencida: boolean } {
  const ms = new Date(hasta).getTime() - Date.now()
  if (ms <= 0) return { texto: 'vencida', urgente: false, vencida: true }
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return { texto: `${mins} min`, urgente: mins <= 10, vencida: false }
  const horas = Math.floor(mins / 60)
  if (horas < 24) return { texto: `${horas} h`, urgente: horas <= 2, vencida: false }
  return { texto: `${Math.floor(horas / 24)} d`, urgente: false, vencida: false }
}

/** Texto listo para copiar y pegar en WhatsApp. */
function recordatorio(r: Reserva): string {
  const { texto } = tiempoRestante(r.reserved_until)
  const nombre = r.reserved_contact_name ? `Hola ${r.reserved_contact_name}` : 'Hola'
  return (
    `${nombre}, te escribo de VIOGI. Tu ${r.name} sigue apartada, ` +
    `pero el apartado vence en ${texto}. Es pieza única, así que si no completas ` +
    `el pago vuelve a quedar disponible para alguien más. ¿Te ayudo con algo?`
  )
}

function Boton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity disabled:opacity-30"
      style={{ ...font, fontSize: '10px' }}
    >
      {children}
    </button>
  )
}

function SubmitApartado() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white uppercase tracking-widest px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
      style={{ ...font, fontSize: '10px', fontWeight: 500 }}
    >
      {pending ? 'APARTANDO…' : 'APARTAR'}
    </button>
  )
}

export default function ReservasClient({
  reservas,
  disponibles,
  revisiones,
  pedidosPorEntregar,
}: {
  reservas: Reserva[]
  disponibles: Disponible[]
  revisiones: RevisionManual[]
  pedidosPorEntregar: PedidoPorEntregar[]
}) {
  const [state, formAction] = useFormState(createManualHoldAction, null)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [entregados, setEntregados] = useState<Set<string>>(new Set())

  const marcarEntregado = (id: string) => {
    setEntregados((prev) => new Set(prev).add(id))
    markOrderDeliveredAction(id)
  }

  const copiar = async (r: Reserva) => {
    await navigator.clipboard.writeText(recordatorio(r))
    setCopiado(r.id)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="space-y-12">
      {/* ── Pedidos que requieren revisión manual ──────────────────────────── */}
      {revisiones.length > 0 && (
        <section>
          <h2
            className="uppercase tracking-widest mb-1 text-red-600"
            style={{ ...font, fontSize: '12px', fontWeight: 600 }}
          >
            Requieren revisión ({revisiones.length})
          </h2>
          <p className="text-gray-500 mb-4" style={{ ...font, fontSize: '10px' }}>
            El cliente pagó pero la prenda ya no estaba disponible. Hay que devolverle o darle
            una alternativa.
          </p>
          <div className="border border-red-200 bg-red-50 divide-y divide-red-100">
            {revisiones.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0" style={{ ...font, fontSize: '11px' }}>
                  <p className="font-medium">
                    #{o.order_number} · ${Number(o.total_mxn).toFixed(2)} MXN
                  </p>
                  <p className="text-gray-600">{o.email}</p>
                  <p className="text-red-700 mt-1" style={{ fontSize: '10px' }}>
                    {o.review_reason}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {o.phone && (
                    <a
                      href={whatsappLink(o.phone) ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="uppercase tracking-widest border-b border-black hover:opacity-50"
                      style={{ ...font, fontSize: '10px' }}
                    >
                      WhatsApp
                    </a>
                  )}
                  <Boton onClick={() => clearReviewFlagAction(o.id)}>Resuelto</Boton>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Pedidos pagados por entregar ───────────────────────────────────── */}
      {pedidosPorEntregar.length > 0 && (
        <section>
          <h2
            className="uppercase tracking-widest mb-1"
            style={{ ...font, fontSize: '12px', fontWeight: 600 }}
          >
            Por entregar ({pedidosPorEntregar.filter((o) => !entregados.has(o.id)).length})
          </h2>
          <p className="text-gray-500 mb-4" style={{ ...font, fontSize: '10px' }}>
            Pedidos ya pagados. Marca entregado cuando el cliente reciba o recoja su pieza.
          </p>
          <div className="border border-gray-200 divide-y divide-gray-100">
            {pedidosPorEntregar
              .filter((o) => !entregados.has(o.id))
              .map((o) => (
                <div key={o.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0" style={{ ...font, fontSize: '11px' }}>
                    <p className="font-medium">
                      #{o.order_number} · ${Number(o.total_mxn).toFixed(2)} MXN
                    </p>
                    <p className="text-gray-600">{o.email}</p>
                    <p className="text-gray-400 mt-1" style={{ fontSize: '10px' }}>
                      {ETIQUETA_ENTREGA[o.delivery_method] ?? o.delivery_method}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {o.phone && (
                      <a
                        href={whatsappLink(o.phone) ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="uppercase tracking-widest border-b border-black hover:opacity-50"
                        style={{ ...font, fontSize: '10px' }}
                      >
                        WhatsApp
                      </a>
                    )}
                    <Boton onClick={() => marcarEntregado(o.id)}>Entregado</Boton>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── Reservas activas ───────────────────────────────────────────────── */}
      <section>
        <h2
          className="uppercase tracking-widest mb-1"
          style={{ ...font, fontSize: '12px', fontWeight: 600 }}
        >
          Reservas activas ({reservas.length})
        </h2>
        <p className="text-gray-500 mb-4" style={{ ...font, fontSize: '10px' }}>
          Ordenadas por vencimiento. Las que están por vencer van primero.
        </p>

        {reservas.length === 0 ? (
          <p className="text-gray-400 py-8" style={{ ...font, fontSize: '11px' }}>
            Ninguna prenda apartada ahora mismo.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {['Prenda', 'Tipo', 'Vence', 'Cliente', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                    style={{ ...font, fontSize: '10px' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => {
                const t = tiempoRestante(r.reserved_until)
                const tel = r.reserved_contact_phone ?? r.order_phone
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-6" style={{ ...font, fontSize: '11px' }}>
                      {r.name}
                      <span className="text-gray-400 ml-2">
                        ${Number(r.price_mxn).toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-gray-600" style={{ ...font, fontSize: '11px' }}>
                      {ETIQUETA_TIPO[r.reservation_kind]}
                    </td>
                    <td className="py-3 pr-6" style={{ ...font, fontSize: '11px' }}>
                      <span
                        className={
                          t.vencida
                            ? 'text-gray-400'
                            : t.urgente
                              ? 'text-red-600 font-medium'
                              : 'text-black'
                        }
                      >
                        {t.texto}
                      </span>
                    </td>
                    <td className="py-3 pr-6" style={{ ...font, fontSize: '11px' }}>
                      <div className="text-gray-700">
                        {r.reserved_contact_name ?? r.order_email ?? '—'}
                      </div>
                      {tel && <div className="text-gray-400">{formatPhone(tel)}</div>}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        {tel && (
                          <a
                            href={whatsappLink(tel, recordatorio(r)) ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="uppercase tracking-widest border-b border-black hover:opacity-50"
                            style={{ ...font, fontSize: '10px' }}
                          >
                            WhatsApp
                          </a>
                        )}
                        <Boton onClick={() => copiar(r)}>
                          {copiado === r.id ? '¡Copiado!' : 'Copiar texto'}
                        </Boton>
                        <Boton onClick={() => releaseReservationAction(r.id)}>Liberar</Boton>
                        <Boton onClick={() => toggleSoldAction(r.id, true)}>Vendida</Boton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Apartado manual ────────────────────────────────────────────────── */}
      <section>
        <h2
          className="uppercase tracking-widest mb-1"
          style={{ ...font, fontSize: '12px', fontWeight: 600 }}
        >
          Apartar por DM
        </h2>
        <p className="text-gray-500 mb-4" style={{ ...font, fontSize: '10px' }}>
          Para ventas por Instagram o WhatsApp con anticipo. La prenda deja de ser comprable en
          la tienda mientras dure el apartado.
        </p>

        <form action={formAction} className="border border-gray-200 p-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block uppercase tracking-widest text-gray-400 mb-1"
                style={{ ...font, fontSize: '10px' }}
              >
                Prenda
              </label>
              <select
                name="product_id"
                required
                defaultValue=""
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black appearance-none"
                style={{ ...font, fontSize: '11px' }}
              >
                <option value="">— Selecciona —</option>
                {disponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${Number(p.price_mxn).toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block uppercase tracking-widest text-gray-400 mb-1"
                style={{ ...font, fontSize: '10px' }}
              >
                Hasta (opcional)
              </label>
              <input
                type="datetime-local"
                name="until"
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black"
                style={{ ...font, fontSize: '11px' }}
              />
            </div>

            <div>
              <label
                className="block uppercase tracking-widest text-gray-400 mb-1"
                style={{ ...font, fontSize: '10px' }}
              >
                Nombre del cliente
              </label>
              <input
                type="text"
                name="contact_name"
                required
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black"
                style={{ ...font, fontSize: '11px' }}
              />
            </div>

            <div>
              <label
                className="block uppercase tracking-widest text-gray-400 mb-1"
                style={{ ...font, fontSize: '10px' }}
              >
                WhatsApp
              </label>
              <input
                type="tel"
                name="contact_phone"
                required
                placeholder="55 1234 5678"
                className="w-full border-b border-gray-200 bg-transparent py-2.5 focus:outline-none focus:border-black"
                style={{ ...font, fontSize: '11px' }}
              />
            </div>
          </div>

          {state && 'error' in state && (
            <p className="text-red-600 mt-4" style={{ ...font, fontSize: '11px' }}>
              {state.error}
            </p>
          )}
          {state && 'ok' in state && (
            <p className="text-green-700 mt-4" style={{ ...font, fontSize: '11px' }}>
              {state.ok}
            </p>
          )}

          <div className="mt-6">
            <SubmitApartado />
          </div>
        </form>
      </section>
    </div>
  )
}
