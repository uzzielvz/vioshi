import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminActor } from '@/lib/admin/session'

/**
 * Números de inversión y ganancia del inventario.
 *
 * ⚠️ Lee `cost_mxn`, `owner`, `sold_at` y `acquired_on`: columnas INTERNAS
 * (0010/0011/0019). Este módulo corre con service role y SOLO se usa desde
 * `/admin`. Nunca lo importes desde `app/[locale]/**`.
 *
 * La ganancia es `price_mxn − cost_mxn` de lo vendido dentro del rango. Una
 * pieza sin costo capturado NO se cuenta como costo 0: se reporta aparte, para
 * que un número incompleto no se lea como un margen real.
 */

export const PERIODS = ['mes_actual', 'mes_pasado', 'dias_90', 'anio', 'todo'] as const

export type Period = (typeof PERIODS)[number]

export const PERIOD_LABELS: Record<Period, string> = {
  mes_actual: 'Este mes',
  mes_pasado: 'Mes pasado',
  dias_90: 'Últimos 90 días',
  anio: 'Este año',
  todo: 'Todo',
}

export function isPeriod(value: unknown): value is Period {
  return typeof value === 'string' && (PERIODS as readonly string[]).includes(value)
}

/** Rango [desde, hasta) en hora local del servidor. `todo` no acota. */
export function periodRange(period: Period, now = new Date()): { from: Date; to: Date } | null {
  const y = now.getFullYear()
  const m = now.getMonth()

  switch (period) {
    case 'mes_actual':
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 1) }
    case 'mes_pasado':
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 1) }
    case 'dias_90': {
      const from = new Date(now)
      from.setDate(from.getDate() - 90)
      return { from, to: new Date(now.getTime() + 1000) }
    }
    case 'anio':
      return { from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) }
    case 'todo':
      return null
  }
}

type StatsRow = {
  owner: string
  cost_mxn: number | string | null
  price_mxn: number | string | null
  listed: boolean
  sold_out: boolean
  sold_at: string | null
  sold_order_id: string | null
  acquired_on: string | null
  created_at: string
  name: string
  id: string
}

export type OwnerStats = {
  owner: 'uzziel' | 'mario'
  /** Dinero que sigue en prendas sin vender. */
  investedStanding: number
  standingPieces: number
  standingListed: number
  standingInventoryOnly: number
  /** Comprado dentro del periodo (acquired_on, o created_at si no se capturó). */
  boughtPieces: number
  boughtCost: number
  /** Vendido dentro del periodo (por sold_at). */
  soldPieces: number
  soldRevenue: number
  soldCost: number
  /** revenue − cost de lo vendido en el periodo, solo con piezas que tienen costo. */
  profit: number
  /** Vendidas en el periodo sin costo capturado: la ganancia está incompleta. */
  soldMissingCost: number
  /** Canal de la venta dentro del periodo. */
  soldWeb: number
  soldInstagram: number
  /** Vendidas en total sin fecha: históricas, no entran en ningún periodo. */
  soldWithoutDate: number
}

export type AgingItem = {
  id: string
  name: string
  owner: 'uzziel' | 'mario'
  days: number
  costMxn: number | null
  listed: boolean
}

export type InventoryStats = {
  perOwner: OwnerStats[]
  total: OwnerStats | null
  aging: AgingItem[]
  error: string | null
}

function num(value: number | string | null): number | null {
  if (value == null) return null
  const parsed = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

function emptyStats(owner: 'uzziel' | 'mario'): OwnerStats {
  return {
    owner,
    investedStanding: 0,
    standingPieces: 0,
    standingListed: 0,
    standingInventoryOnly: 0,
    boughtPieces: 0,
    boughtCost: 0,
    soldPieces: 0,
    soldRevenue: 0,
    soldCost: 0,
    profit: 0,
    soldMissingCost: 0,
    soldWeb: 0,
    soldInstagram: 0,
    soldWithoutDate: 0,
  }
}

function inRange(iso: string | null, range: { from: Date; to: Date } | null): boolean {
  if (!iso) return false
  if (!range) return true
  const t = new Date(iso).getTime()
  return t >= range.from.getTime() && t < range.to.getTime()
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

function accumulate(acc: OwnerStats, row: StatsRow, range: { from: Date; to: Date } | null): void {
  const cost = num(row.cost_mxn)
  const price = num(row.price_mxn)

  if (!row.sold_out) {
    acc.standingPieces += 1
    if (cost != null) acc.investedStanding += cost
    if (row.listed) acc.standingListed += 1
    else acc.standingInventoryOnly += 1
  }

  // Compra: acquired_on si se capturó, si no el día en que se registró.
  const boughtAt = row.acquired_on ?? row.created_at
  if (inRange(boughtAt, range)) {
    acc.boughtPieces += 1
    if (cost != null) acc.boughtCost += cost
  }

  if (row.sold_out) {
    if (!row.sold_at) {
      // Histórico anterior a 0019: se sabe que se vendió, no cuándo.
      acc.soldWithoutDate += 1
    } else if (inRange(row.sold_at, range)) {
      acc.soldPieces += 1
      if (price != null) acc.soldRevenue += price
      if (cost == null) {
        acc.soldMissingCost += 1
      } else {
        acc.soldCost += cost
        if (price != null) acc.profit += price - cost
      }
      if (row.sold_order_id) acc.soldWeb += 1
      else acc.soldInstagram += 1
    }
  }
}

/**
 * Agregados del inventario. Si el actor es Mario, el filtro por `owner` va en
 * la CONSULTA: las filas de Uzziel no llegan a este proceso, así que no hay
 * forma de que se cuelen a su pantalla por un error de render.
 */
export async function getInventoryStats(
  actor: AdminActor,
  period: Period
): Promise<InventoryStats> {
  const range = periodRange(period)

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('products')
      .select(
        'id, name, owner, cost_mxn, price_mxn, listed, sold_out, sold_at, sold_order_id, acquired_on, created_at'
      )

    if (actor === 'mario') {
      query = query.eq('owner', 'mario')
    }

    const { data, error } = await query
    if (error || !data) {
      return {
        perOwner: [],
        total: null,
        aging: [],
        error: 'No pude calcular los números. La base no respondió.',
      }
    }

    const rows = data as unknown as StatsRow[]
    const buckets = new Map<'uzziel' | 'mario', OwnerStats>()
    const total = emptyStats('uzziel')
    const aging: AgingItem[] = []

    for (const row of rows) {
      const owner = row.owner === 'mario' ? 'mario' : 'uzziel'
      let bucket = buckets.get(owner)
      if (!bucket) {
        bucket = emptyStats(owner)
        buckets.set(owner, bucket)
      }
      accumulate(bucket, row, range)
      accumulate(total, row, range)

      if (!row.sold_out) {
        aging.push({
          id: row.id,
          name: row.name,
          owner,
          days: daysSince(row.acquired_on ?? row.created_at),
          costMxn: num(row.cost_mxn),
          listed: row.listed,
        })
      }
    }

    aging.sort((a, b) => b.days - a.days)

    const perOwner = [...buckets.values()].sort((a, b) => a.owner.localeCompare(b.owner))

    return {
      perOwner,
      // Mario no necesita un "total": lo suyo ya es el total de lo que ve.
      total: actor === 'uzziel' ? total : null,
      aging: aging.slice(0, 10),
      error: null,
    }
  } catch {
    return {
      perOwner: [],
      total: null,
      aging: [],
      error: 'No pude calcular los números. La base no respondió.',
    }
  }
}
