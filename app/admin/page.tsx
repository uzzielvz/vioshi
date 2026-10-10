import Link from 'next/link'
import { getAdminActor } from '@/lib/admin/session'
import {
  listInventory,
  totalsFor,
  whereLabel,
  type InventoryItem,
  type OwnerTotals,
} from '@/lib/admin/inventory'
import {
  getInventoryStats,
  isPeriod,
  PERIODS,
  PERIOD_LABELS,
  type AgingItem,
  type OwnerStats,
  type Period,
} from '@/lib/admin/stats'
import { formatPrice } from '@/lib/formatters'
import { GARMENT_TYPE_LABELS, isGarmentType } from '@/lib/garments'

export const dynamic = 'force-dynamic'

const OWNER_LABELS: Record<'uzziel' | 'mario', string> = {
  uzziel: 'Uzziel',
  mario: 'Mario',
}

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

/** Selector de periodo sin JS: un link por rango. */
function PeriodNav({ active }: { active: Period }) {
  return (
    <nav className="flex flex-wrap gap-4 mb-5">
      {PERIODS.map((p) => (
        <Link
          key={p}
          href={`/admin?periodo=${p}`}
          className={
            p === active
              ? 'uppercase tracking-widest border-b border-black'
              : 'uppercase tracking-widest text-gray-400 hover:text-black transition-colors'
          }
          style={{ ...font, fontSize: '10px' }}
        >
          {PERIOD_LABELS[p]}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Números de dinero del periodo. La ganancia se muestra junto a su propia
 * advertencia cuando hay piezas sin costo: un margen incompleto que se vea
 * como definitivo es peor que un hueco declarado.
 */
function MoneyBlock({ title, stats }: { title: string; stats: OwnerStats }) {
  const incompleta = stats.soldMissingCost > 0
  const canal =
    stats.soldPieces > 0 ? `${stats.soldWeb} web · ${stats.soldInstagram} Instagram/DM` : undefined

  return (
    <section>
      <h2
        className="uppercase tracking-widest mb-3"
        style={{ ...font, fontSize: '11px', fontWeight: 500 }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Ganancia del periodo"
          value={money(stats.profit)}
          hint={
            incompleta
              ? `${stats.soldMissingCost} vendida${stats.soldMissingCost === 1 ? '' : 's'} sin costo capturado: falta`
              : 'Precio menos costo de lo vendido'
          }
        />
        <Stat
          label="Vendido en el periodo"
          value={`${stats.soldPieces} · ${money(stats.soldRevenue)}`}
          hint={canal}
        />
        <Stat
          label="Comprado en el periodo"
          value={`${stats.boughtPieces} · ${money(stats.boughtCost)}`}
          hint={
            stats.withoutBuyDate > 0
              ? `${stats.withoutBuyDate} sin fecha de compra: fuera del periodo`
              : 'Piezas y lo que costaron'
          }
        />
        <Stat
          label="Invertido sin vender"
          value={money(stats.investedStanding)}
          hint={`${stats.standingPieces} prenda${stats.standingPieces === 1 ? '' : 's'} en pie`}
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <Stat label="Falta por vender" value={String(stats.standingPieces)} />
        <Stat label="En la tienda" value={String(stats.standingListed)} />
        <Stat label="Solo inventario" value={String(stats.standingInventoryOnly)} />
        {stats.soldWithoutDate > 0 && (
          <Stat
            label="Vendidas sin fecha"
            value={String(stats.soldWithoutDate)}
            hint="Anteriores al registro de fecha: no entran en ningún periodo"
          />
        )}
      </div>
      {stats.deadPieces > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Stat
            label="Merma"
            value={`${stats.mermaPieces} · ${money(stats.mermaCost)}`}
            hint="No se vende. Fuera del capital activo"
          />
          <Stat
            label="Fuera de inventario"
            value={`${stats.deadPieces} · ${money(stats.deadCost)}`}
            hint="Merma, uso personal y donadas"
          />
        </div>
      )}
    </section>
  )
}

/** Lo que lleva más tiempo sin venderse: el número que decide qué mover. */
function AgingTable({ items, showOwner }: { items: AgingItem[]; showOwner: boolean }) {
  return (
    <section className="mt-10">
      <h2
        className="uppercase tracking-widest mb-1"
        style={{ ...font, fontSize: '11px', fontWeight: 500 }}
      >
        Lo más viejo sin vender
      </h2>
      <p className="text-gray-400 mb-3" style={{ ...font, fontSize: '10px' }}>
        Días desde que se compró o se registró. Capital parado.
      </p>
      <ul className="md:hidden flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="border border-gray-200 bg-white px-3 py-3 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/products/${item.id}`}
                className="border-b border-black break-words"
                style={{ ...font, fontSize: '12px' }}
              >
                {item.name}
              </Link>
              <p className="text-gray-500 mt-1" style={{ ...font, fontSize: '10px' }}>
                {showOwner ? `${OWNER_LABELS[item.owner]} · ` : ''}
                {item.costMxn == null ? 'sin costo' : money(item.costMxn)} ·{' '}
                {item.listed ? 'En tienda' : 'Inventario'}
              </p>
            </div>
            <span className="font-mono shrink-0" style={{ ...font, fontSize: '13px' }}>
              {item.days}d
            </span>
          </li>
        ))}
      </ul>

      <table className="hidden md:table w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {(showOwner ? ['Prenda', 'Dueño', 'Días', 'Costo', 'Dónde'] : ['Prenda', 'Días', 'Costo', 'Dónde']).map(
              (h) => (
                <th
                  key={h}
                  className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                  style={{ ...font, fontSize: '10px' }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-3 pr-4" style={{ ...font, fontSize: '11px' }}>
                <Link
                  href={`/admin/products/${item.id}`}
                  className="border-b border-black hover:opacity-50"
                >
                  {item.name}
                </Link>
              </td>
              {showOwner && (
                <td
                  className="py-3 pr-4 uppercase tracking-widest"
                  style={{ ...font, fontSize: '10px' }}
                >
                  {OWNER_LABELS[item.owner]}
                </td>
              )}
              <td className="py-3 pr-4 font-mono" style={{ ...font, fontSize: '11px' }}>
                {item.days}
              </td>
              <td className="py-3 pr-4 font-mono" style={{ ...font, fontSize: '11px' }}>
                {item.costMxn == null ? '—' : money(item.costMxn)}
              </td>
              <td className="py-3 uppercase tracking-widest" style={{ ...font, fontSize: '10px' }}>
                {item.listed ? 'En tienda' : 'Inventario'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
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
        {whereLabel(item.disposition, item.listed)}
      </td>
    </tr>
  )
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { periodo?: string }
}) {
  const actor = await getAdminActor()
  const period: Period = isPeriod(searchParams?.periodo) ? searchParams.periodo : 'mes_actual'
  const [{ items, error }, stats] = await Promise.all([
    listInventory(actor),
    getInventoryStats(actor, period),
  ])
  const mine = actor === 'uzziel' ? items.filter((item) => item.owner === 'uzziel') : items
  const mario = items.filter((item) => item.owner === 'mario')
  const recent = items.slice(0, 8)

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
            Inventario
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white uppercase tracking-widest text-center w-full sm:w-auto px-4 py-4 sm:py-2 min-h-[48px] sm:min-h-0 flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0"
          style={{ ...font, fontSize: '11px', fontWeight: 500 }}
        >
          Registrar prenda
        </Link>
      </div>

      {error && (
        <p className="border border-black bg-white px-4 py-3 mb-8" style={{ ...font, fontSize: '11px' }}>
          {error}
        </p>
      )}

      {stats.error && (
        <p className="border border-black bg-white px-4 py-3 mb-8" style={{ ...font, fontSize: '11px' }}>
          {stats.error}
        </p>
      )}

      {!stats.error && (stats.total || stats.perOwner.length > 0) && (
        <div className="mb-10">
          <PeriodNav active={period} />
          <div className="flex flex-col gap-8">
            {stats.total ? (
              <>
                <MoneyBlock title={`Total · ${PERIOD_LABELS[period]}`} stats={stats.total} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {stats.perOwner.map((s) => (
                    <MoneyBlock key={s.owner} title={OWNER_LABELS[s.owner]} stats={s} />
                  ))}
                </div>
              </>
            ) : (
              stats.perOwner.map((s) => (
                <MoneyBlock
                  key={s.owner}
                  title={`Resumen · ${PERIOD_LABELS[period]}`}
                  stats={s}
                />
              ))
            )}
          </div>
          {stats.aging.length > 0 && (
            <AgingTable items={stats.aging} showOwner={actor === 'uzziel'} />
          )}
        </div>
      )}

      {!error && (items.length === 0 ? (
        <p className="text-center py-24 uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '11px' }}>
          Aún no hay prendas
        </p>
      ) : actor === 'mario' ? (
        <Block title="Resumen" totals={totalsFor(items)} />
      ) : (
        <div className="flex flex-col gap-8">
          <Block title="Total" totals={totalsFor(items)} />
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
          <ul className="md:hidden flex flex-col gap-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="border border-gray-200 bg-white px-3 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${item.id}`}
                    className="border-b border-black break-words"
                    style={{ ...font, fontSize: '12px' }}
                  >
                    {item.name}
                  </Link>
                  <p className="text-gray-500 mt-1" style={{ ...font, fontSize: '10px' }}>
                    {garmentLabel(item.garmentType)}
                    {actor === 'uzziel' ? ` · ${OWNER_LABELS[item.owner]}` : ''} ·{' '}
                    {item.costMxn == null ? 'sin costo' : money(item.costMxn)}
                  </p>
                </div>
                <span
                  className="uppercase tracking-widest text-gray-400 shrink-0"
                  style={{ ...font, fontSize: '10px' }}
                >
                  {whereLabel(item.disposition, item.listed)}
                </span>
              </li>
            ))}
          </ul>

          <table className="hidden md:table w-full border-collapse">
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
