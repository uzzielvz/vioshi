import Link from 'next/link'
import { getAdminActor } from '@/lib/admin/session'
import { listInventory, whereLabel, type InventoryItem } from '@/lib/admin/inventory'
import { getInventoryStats, isPeriod, PERIODS, PERIOD_LABELS, type Period } from '@/lib/admin/stats'
import { formatPrice } from '@/lib/formatters'
import { GARMENT_TYPE_LABELS, isGarmentType } from '@/lib/garments'
import { Antiguedad, BloqueDinero, BloqueOwner } from './_components/Tablero'

export const dynamic = 'force-dynamic'

const OWNER_LABELS: Record<'uzziel' | 'mario', string> = {
  uzziel: 'Uzziel',
  mario: 'Mario',
}

function money(value: number) {
  return formatPrice(value, 'es', false)
}

function garmentLabel(type: string | null) {
  return isGarmentType(type) ? GARMENT_TYPE_LABELS[type] : 'Sin tipo'
}

/** Selector de periodo sin JS: un link por rango. */
function PeriodNav({ active }: { active: Period }) {
  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-4 mb-8">
      {PERIODS.map((p) => (
        <Link
          key={p}
          href={`/admin?periodo=${p}`}
          className={`text-label uppercase tracking-widest min-h-[32px] flex items-center transition-colors ${
            p === active ? 'text-ink border-b border-ink' : 'text-ink-faint hover:text-ink'
          }`}
        >
          {PERIOD_LABELS[p]}
        </Link>
      ))}
    </nav>
  )
}

function Recientes({ items, showOwner }: { items: InventoryItem[]; showOwner: boolean }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-body uppercase tracking-widest">Lo último que registraste</h2>
        <Link
          href="/admin/products"
          className="text-label uppercase tracking-widest border-b border-ink hover:opacity-50 transition-opacity"
        >
          Ver todo
        </Link>
      </div>

      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-b border-line-soft py-3 flex items-baseline justify-between gap-4"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/products/${item.id}`}
                className="text-lead break-words border-b border-ink hover:opacity-50 transition-opacity"
              >
                {item.name}
              </Link>
              <p className="text-label text-ink-faint mt-1">
                {garmentLabel(item.garmentType)}
                {showOwner ? ` · ${OWNER_LABELS[item.owner]}` : ''} ·{' '}
                {item.costMxn == null ? 'sin costo' : money(item.costMxn)}
              </p>
            </div>
            <span className="text-label uppercase tracking-widest text-ink-faint shrink-0">
              {whereLabel(item.disposition, item.listed)}
            </span>
          </li>
        ))}
      </ul>
    </section>
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

  const principal = stats.total ?? stats.perOwner[0] ?? null
  const recent = items.slice(0, 6)

  return (
    <div className="max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-title uppercase tracking-widest">Inventario</h1>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-ink text-white text-body uppercase tracking-widest text-center w-full sm:w-auto px-6 min-h-[48px] flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
        >
          Registrar prenda
        </Link>
      </header>

      {(error || stats.error) && (
        <p className="border border-ink bg-surface px-4 py-3 mb-8 text-body">
          {error ?? stats.error}
        </p>
      )}

      {!stats.error && principal && (
        <>
          <PeriodNav active={period} />

          <div className="flex flex-col gap-10">
            <BloqueDinero
              titulo={actor === 'mario' ? 'Resumen' : 'Total'}
              stats={principal}
              previous={stats.previous}
              period={period}
            />

            {actor === 'uzziel' && stats.perOwner.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.perOwner.map((s) => (
                  <BloqueOwner key={s.owner} stats={s} />
                ))}
              </div>
            )}

            {stats.aging.length > 0 && (
              <Antiguedad items={stats.aging} showOwner={actor === 'uzziel'} />
            )}

            {recent.length > 0 && <Recientes items={recent} showOwner={actor === 'uzziel'} />}
          </div>
        </>
      )}

      {!error && items.length === 0 && (
        <p className="text-center py-24 text-body uppercase tracking-widest text-ink-faint">
          Aún no hay prendas
        </p>
      )}
    </div>
  )
}
