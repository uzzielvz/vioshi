'use client'

import { useState, useTransition } from 'react'
import { toggleSoldAction } from '../reservas/actions'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

/** Marcar vendida / disponible en UN clic. Para ventas presenciales. */
export default function SoldToggle({
  id,
  vendida,
  apartada,
}: {
  id: string
  vendida: boolean
  apartada: boolean
}) {
  const [pending, start] = useTransition()
  const [optimista, setOptimista] = useState(vendida)

  const alternar = () => {
    const nuevo = !optimista
    setOptimista(nuevo)
    start(() => {
      toggleSoldAction(id, nuevo)
    })
  }

  const etiqueta = optimista ? 'VENDIDA' : apartada ? 'APARTADA' : 'DISPONIBLE'
  const estilo = optimista
    ? 'bg-black text-white border-black'
    : apartada
      ? 'bg-white text-black border-black'
      : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'

  return (
    <button
      onClick={alternar}
      disabled={pending}
      title={optimista ? 'Clic para volver a ponerla disponible' : 'Clic para marcar vendida'}
      className={`uppercase tracking-widest border px-2 py-1 transition-colors disabled:opacity-40 ${estilo}`}
      style={{ ...font, fontSize: '9px', fontWeight: 500 }}
    >
      {pending ? '…' : etiqueta}
    </button>
  )
}
