import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminActor } from '@/lib/admin/session'
import { DISPOSITION_LABELS, isDisposition } from '@/lib/garments'

export type InventoryItem = {
  id: string
  name: string
  slug: string
  sku: string | null
  owner: 'uzziel' | 'mario'
  costMxn: number | null
  priceMxn: number | null
  listed: boolean
  disposition: string
  soldOut: boolean
  garmentType: string | null
  image: string | null
  reservedUntil: string | null
  createdAt: string
}

type ImageRow = { url: string; is_primary: boolean; sort_order: number }

type ProductRow = {
  id: string
  name: string
  slug: string
  sku: string | null
  owner: string
  cost_mxn: string | number | null
  price_mxn: string | number | null
  listed: boolean
  disposition: string
  sold_out: boolean
  garment_type: string | null
  reserved_until: string | null
  created_at: string
  product_images: ImageRow[] | null
}

function money(value: string | number | null): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : null
}

function primaryImage(images: ImageRow[] | null): string | null {
  const sorted = [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  return sorted.find((img) => img.is_primary)?.url ?? sorted[0]?.url ?? null
}

function toItem(row: ProductRow): InventoryItem {
  const owner = row.owner === 'mario' ? 'mario' : 'uzziel'
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    owner,
    costMxn: money(row.cost_mxn),
    priceMxn: money(row.price_mxn),
    listed: row.listed,
    disposition: row.disposition,
    soldOut: row.sold_out,
    garmentType: row.garment_type,
    image: primaryImage(row.product_images),
    reservedUntil: row.reserved_until,
    createdAt: row.created_at,
  }
}

/** Inventario interno. Mario solo recibe filas con owner = mario. */
export async function listInventory(
  actor: AdminActor
): Promise<{ items: InventoryItem[]; error: string | null }> {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('products')
      .select(`
        id, name, slug, sku, owner, cost_mxn, price_mxn, listed, disposition, sold_out,
        garment_type, reserved_until, created_at,
        product_images (url, is_primary, sort_order)
      `)
      .order('created_at', { ascending: false })

    if (actor === 'mario') {
      query = query.eq('owner', 'mario')
    }

    const { data, error } = await query
    if (error || !data) {
      return { items: [], error: 'No pude leer el inventario. La base no respondió.' }
    }
    return { items: (data as unknown as ProductRow[]).map(toItem), error: null }
  } catch {
    return { items: [], error: 'No pude leer el inventario. La base no respondió.' }
  }
}

export type OwnerTotals = {
  pieces: number
  costMxn: number
  missingCost: number
  listed: number
  inventoryOnly: number
  sold: number
}

export function totalsFor(items: InventoryItem[]): OwnerTotals {
  let costMxn = 0
  let missingCost = 0
  let listed = 0
  let sold = 0
  for (const item of items) {
    if (item.costMxn == null) missingCost += 1
    else costMxn += item.costMxn
    if (item.listed) listed += 1
    if (item.soldOut) sold += 1
  }
  return {
    pieces: items.length,
    costMxn,
    missingCost,
    listed,
    inventoryOnly: items.length - listed,
    sold,
  }
}

/**
 * Dónde está la prenda, en una palabra. Una pieza fuera de inventario activo
 * (0020) se nombra por su destino: decir "Inventario" de una merma haría creer
 * que todavía es capital vendible.
 */
export function whereLabel(disposition: string, listed: boolean): string {
  if (isDisposition(disposition) && disposition !== 'activa') {
    return DISPOSITION_LABELS[disposition]
  }
  return listed ? 'Tienda' : 'Inventario'
}
