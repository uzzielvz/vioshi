import { NextRequest, NextResponse } from 'next/server'
import { getAdminActor } from '@/lib/admin/session'
import { getMovements, isPeriod, PERIOD_LABELS, type Period } from '@/lib/admin/stats'

/**
 * Descarga del reporte en CSV.
 *
 * El actor sale de la cookie firmada, no de la URL: Mario descarga lo suyo
 * aunque escriba otra cosa. El filtro por `owner` vive en la consulta de
 * `getMovements`, igual que en el resto del panel.
 */
export const dynamic = 'force-dynamic'

/** Excel abre CSV en la codificación del sistema: sin BOM se rompen los acentos. */
const BOM = '﻿'

function cell(value: string | number | null): string {
  if (value == null) return ''
  const s = String(value)
  // El separador es `;` porque Excel en español lo espera; y se escapan las
  // comillas duplicándolas, como manda el formato.
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const actor = await getAdminActor()

  const pedido = req.nextUrl.searchParams.get('periodo')
  const period: Period = isPeriod(pedido) ? pedido : 'mes_actual'

  const movimientos = await getMovements(actor, period)

  const encabezado = [
    'Movimiento',
    'Fecha',
    'Prenda',
    'Dueño',
    'Costo MXN',
    'Precio MXN',
    'Margen MXN',
    'Canal',
    'Destino',
  ]

  const filas = movimientos.map((m) => [
    m.kind === 'venta' ? 'Venta' : 'Compra',
    m.date.slice(0, 10),
    m.name,
    m.owner === 'mario' ? 'Mario' : 'Uzziel',
    m.costMxn,
    m.priceMxn,
    m.marginMxn,
    m.channel === 'web' ? 'Web' : m.channel === 'instagram' ? 'Instagram' : '',
    m.disposition,
  ])

  const csv =
    BOM + [encabezado, ...filas].map((f) => f.map(cell).join(';')).join('\r\n') + '\r\n'

  const hoy = new Date().toISOString().slice(0, 10)
  const nombre = `viogi-${PERIOD_LABELS[period].toLowerCase().replace(/\s+/g, '-')}-${hoy}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
