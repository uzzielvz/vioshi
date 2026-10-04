import Link from 'next/link'
import { getAdminActor } from '@/lib/admin/session'
import { listInventory, totalsFor, type InventoryItem, type OwnerTotals } from '@/lib/admin/inventory'
import { formatPrice } from '@/lib/formatters'
import { GARMENT_TYPE_LABELS, isGarmentType } from '@/lib/garments'

export const dynamic = 'force-dynamic'

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

function money(value: number) {
  return formatPrice(value, 'es', false)
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-gray-200 bg-white px-4 py-4">
      <p className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
        {label}
      </p>
      <p className="mt-2" style={{ ...font, fontSize: '22px', fontWeight: 500 }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-gray-400" style={{ ...font, fontSize: '10px' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function Block({ title, totals }: { title: string; totals: OwnerTotals }) {
  return (
    <section>
      <h2 className="uppercase tracking-widest mb-3" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Prendas" value={String(totals.pieces)} />
        <Stat
          label="Costo"
          value={money(totals.costMxn)}
          hint={totals.missingCost > 0 ? `${totals.missingCost} sin costo` : undefined}
        />
        <Stat label="En la tienda" value={String(totals.listed)} />
        <Stat label="Solo inventario" value={String(totals.inventoryOnly)} />
      </div>
    </section>
  )
}

function garmentLabel(type: string | null) {
  return isGarmentType(type) ? GARMENT_TYPE_LABELS[type] : '—'
}

function Row({ item, showOwner }: { item: InventoryItem; showOwner: boolean }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-4" style={{ ...font, fontSize: '11px' }}>
        <Link href={`/admin/products/${item.id}`} className="border-b border-black hover:opacity-50">
          {item.name}
        </Link>
      </td>
      <td className="py-3 pr-4 text-gray-500" style={{ ...font, fontSize: '11px' }}>
        {garmentLabel(item.garmentType)}
      </td>
      {showOwner && (
        <td className="py-3 pr-4 uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
          {item.owner}
        </td>
      )}
      <td className="py-3 pr-4 font-mono" style={{ ...font, fontSize: '11px' }}>
        {item.costMxn == null ? '—' : money(item.costMxn)}
      </td>
      <td className="py-3 uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
        {item.listed ? 'En tienda' : 'Inventario'}
      </td>
    </tr>
  )
}

export default async function AdminDashboardPage() {
  const actor = await getAdminActor()
  const { items, error } = await listInventory(actor)
  const mine = actor === 'uzziel' ? items.filter((item) => item.owner === 'uzziel') : items
  const mario = items.filter((item) => item.owner === 'mario')
  const recent = items.slice(0, 8)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
            {actor === 'mario' ? 'Tu inventario' : 'Inventario'}
          </h1>
          <p className="text-gray-400 mt-2" style={{ ...font, fontSize: '11px' }}>
            {actor === 'mario'
              ? 'Solo ves las prendas a tu nombre. No salen en la tienda hasta que se publiquen.'
              : 'Tú ves las de los dos. Mario, al entrar, solo ve las suyas.'}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors"
          style={{ ...font, fontSize: '10px', fontWeight: 500 }}
        >
          Registrar prenda
        </Link>
      </div>

      {error && (
        <p className="border border-black bg-white px-4 py-3 mb-8" style={{ ...font, fontSize: '11px' }}>
          {error}
        </p>
      )}

      {!error && (items.length === 0 ? (
        <p className="text-center py-24 uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '11px' }}>
          Aún no hay prendas
        </p>
      ) : actor === 'mario' ? (
        <Block title="Mario" totals={totalsFor(items)} />
      ) : (
        <div className="flex flex-col gap-8">
          <Block title="Los dos" totals={totalsFor(items)} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Block title="Uzziel" totals={totalsFor(mine)} />
            <Block title="Mario" totals={totalsFor(mario)} />
          </div>
        </div>
      ))}

      {recent.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="uppercase tracking-widest" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
              Recientes
            </h2>
            <Link
              href="/admin/products"
              className="uppercase tracking-widest border-b border-black"
              style={{ ...font, fontSize: '10px' }}
            >
              Ver inventario
            </Link>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                {(actor === 'uzziel'
                  ? ['Prenda', 'Tipo', 'Dueño', 'Costo', 'Dónde']
                  : ['Prenda', 'Tipo', 'Costo', 'Dónde']
                ).map((h) => (
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
              {recent.map((item) => (
                <Row key={item.id} item={item} showOwner={actor === 'uzziel'} />
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
