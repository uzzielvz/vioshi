'use client'

import { useState } from 'react'
import { resolveOrphanFundAction } from '../../reservas/actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

export type Fondo = {
  id: string
  stripe_transaction_id: string
  stripe_customer_id: string | null
  amount_mxn: number
  received_at: string
  dias_transcurridos: number
  dias_para_devolucion_auto: number
  dias_para_barrido: number
}

export default function FondosClient({ fondos }: { fondos: Fondo[] }) {
  const [ocupado, setOcupado] = useState<string | null>(null)

  const resolver = async (
    id: string,
    estado: 'reembolsado' | 'aplicado' | 'ignorado'
  ) => {
    setOcupado(id)
    await resolveOrphanFundAction(id, estado)
    setOcupado(null)
  }

  if (fondos.length === 0) {
    return (
      <p className="text-gray-400 py-12" style={{ ...font, fontSize: '11px' }}>
        No hay dinero sin aplicar. Todo lo recibido corresponde a un pedido.
      </p>
    )
  }

  return (
    <div className="border border-gray-200 divide-y divide-gray-100">
      {fondos.map((f) => {
        const urgente = f.dias_para_barrido <= 20
        return (
          <div
            key={f.id}
            className={`px-5 py-4 flex items-start justify-between gap-6 ${urgente ? 'bg-red-50' : ''}`}
          >
            <div className="min-w-0" style={{ ...font, fontSize: '11px' }}>
              <p className="font-medium" style={{ fontSize: '13px' }}>
                ${f.amount_mxn.toFixed(2)} MXN
              </p>
              <p className="text-gray-500 mt-0.5">
                Recibido hace {f.dias_transcurridos}{' '}
                {f.dias_transcurridos === 1 ? 'día' : 'días'} ·{' '}
                {new Date(f.received_at).toLocaleDateString('es-MX')}
              </p>
              <p className="text-gray-400 font-mono mt-1" style={{ fontSize: '10px' }}>
                {f.stripe_transaction_id}
                {f.stripe_customer_id ? ` · ${f.stripe_customer_id}` : ''}
              </p>
              <p
                className={`mt-2 ${urgente ? 'text-red-700 font-medium' : 'text-gray-600'}`}
                style={{ fontSize: '10px' }}
              >
                Stripe intenta devolverlo en {f.dias_para_devolucion_auto} días · pasa a tu
                balance en {f.dias_para_barrido}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0" style={{ ...font, fontSize: '10px' }}>
              <a
                href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(f.stripe_transaction_id)}`}
                target="_blank"
                rel="noreferrer"
                className="uppercase tracking-widest border-b border-black hover:opacity-50"
              >
                Ver en Stripe
              </a>
              <button
                disabled={ocupado === f.id}
                onClick={() => resolver(f.id, 'reembolsado')}
                className="uppercase tracking-widest border-b border-black hover:opacity-50 disabled:opacity-30"
              >
                Devuelto
              </button>
              <button
                disabled={ocupado === f.id}
                onClick={() => resolver(f.id, 'aplicado')}
                className="uppercase tracking-widest border-b border-black hover:opacity-50 disabled:opacity-30"
              >
                Aplicado
              </button>
              <button
                disabled={ocupado === f.id}
                onClick={() => resolver(f.id, 'ignorado')}
                className="uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-30"
              >
                Ignorar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
