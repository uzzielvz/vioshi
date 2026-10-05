import Link from 'next/link'
import { getAdminActor } from '@/lib/admin/session'
import {
  getInventoryStats,
  getMovements,
  isPeriod,
  PERIODS,
  PERIOD_LABELS,
  variation,
  type Movement,
  type Period,
} from '@/lib/admin/stats'
import { formatPrice } from '@/lib/formatters'

export const dynamic = 'force-dynamic'

const OWNER_LABELS: Record<'uzziel' | 'mario', string> = {
  uzziel: 'Uzziel',
  mario: 'Mario',
}

function money(value: number) {
  return formatPrice(value, 'es', false)
}

/** Fecha corta. `acquired_on` viene sin zona, así que se parte el string. */
function fecha(iso: string): string {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return d ? `${d[3]}/${d[2]}/${d[1].slice(2)}` : iso.slice(0, 10)
}

function Linea({ label, value, nota }: { label: string; value: string; nota?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-line-soft">
      <span className="text-label uppercase tracking-widest text-ink-faint">{label}</span>
      <span className="text-right">
        <span className="text-read tabular-nums">{value}</span>
        {nota && <span className="block text-label text-ink-faint">{nota}</span>}
      </span>
    </div>
  )
}

function Fila({ m, showOwner }: { m: Movement; showOwner: boolean }) {
  return (
    <li className="border-b border-line-soft py-3">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/admin/products/${m.id}`}
          className="text-read min-w-0 break-words border-b border-ink hover:opacity-50 transition-opacity"
        >
          {m.name}
        </Link>
        <span className="text-read tabular-nums shrink-0">
          {m.kind === 'venta'
            ? m.priceMxn == null
              ? '—'
              : money(m.priceMxn)
            : m.costMxn == null
              ? '—'
              : money(m.costMxn)}
        </span>
      </div>
      <p className="text-label text-ink-faint mt-1">
        {m.kind === 'venta' ? 'Venta' : 'Compra'} · {fecha(m.date)}
        {showOwner ? ` · ${OWNER_LABELS[m.owner]}` : ''}
        {m.kind === 'venta' && m.channel ? ` · ${m.channel === 'web' ? 'Web' : 'Instagram'}` : ''}
        {m.kind === 'venta' && m.marginMxn != null ? ` · margen ${money(m.marginMxn)}` : ''}
        {m.kind === 'venta' && m.marginMxn == null ? ' · sin costo capturado' : ''}
      </p>
    </li>
  )
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams?: { periodo?: string }
}) {
  const actor = await getAdminActor()
  const period: Period = isPeriod(searchParams?.periodo) ? searchParams.periodo : 'mes_actual'

  const [stats, movimientos] = await Promise.all([
    getInventoryStats(actor, period),
    getMovements(actor, period),
  ])

  const s = stats.total ?? stats.perOwner[0] ?? null
  const ventas = movimientos.filter((m) => m.kind === 'venta')
  const compras = movimientos.filter((m) => m.kind === 'compra')
  const showOwner = actor === 'uzziel'
  const deltaGanancia = s && stats.previous ? variation(s.profit, stats.previous.profit) : null

  return (
    <div className="max-w-3xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <h1 className="text-title uppercase tracking-widest">Reporte</h1>
        <Link
          href={`/admin/reportes/csv?periodo=${period}`}
          prefetch={false}
          className="border border-ink text-body uppercase tracking-widest text-center w-full sm:w-auto px-6 min-h-[44px] flex items-center justify-center hover:bg-ink hover:text-white transition-colors shrink-0"
        >
          Descargar CSV
        </Link>
      </header>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-4 mb-8">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/admin/reportes?periodo=${p}`}
            className={`text-label uppercase tracking-widest min-h-[32px] flex items-center transition-colors ${
              p === period ? 'text-ink border-b border-ink' : 'text-ink-faint hover:text-ink'
            }`}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </nav>

      {stats.error && (
        <p className="border border-ink bg-surface px-4 py-3 text-body">{stats.error}</p>
      )}

      {!stats.error && s && (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-body uppercase tracking-widest mb-3">
              {PERIOD_LABELS[period]}
            </h2>
            <Linea
              label="Ganancia"
              value={money(s.profit)}
              nota={
                deltaGanancia === null
                  ? undefined
                  : `${deltaGanancia > 0 ? '▲' : deltaGanancia < 0 ? '▼' : '='} ${Math.abs(deltaGanancia)}% vs. periodo anterior`
              }
            />
            <Linea
              label="Vendido"
              value={`${s.soldPieces} · ${money(s.soldRevenue)}`}
              nota={s.soldPieces > 0 ? `${s.soldWeb} web · ${s.soldInstagram} Instagram` : undefined}
            />
            <Linea label="Costo de lo vendido" value={money(s.soldCost)} />
            <Linea
              label="Comprado"
              value={`${s.boughtPieces} · ${money(s.boughtCost)}`}
              nota={s.withoutBuyDate > 0 ? `${s.withoutBuyDate} sin fecha de compra` : undefined}
            />
            <Linea
              label="Capital parado"
              value={money(s.investedStanding)}
              nota={`${s.standingPieces} sin vender`}
            />
            <Linea
              label="Merma"
              value={`${s.mermaPieces} · ${money(s.mermaCost)}`}
            />
            {s.soldMissingCost > 0 && (
              <p className="text-label text-ink-faint pt-3">
                {s.soldMissingCost} vendida{s.soldMissingCost === 1 ? '' : 's'} sin costo capturado:
                la ganancia está incompleta.
              </p>
            )}
          </section>

          {showOwner && stats.perOwner.length > 1 && (
            <section>
              <h2 className="text-body uppercase tracking-widest mb-3">Por persona</h2>
              {stats.perOwner.map((o) => (
                <Linea
                  key={o.owner}
                  label={OWNER_LABELS[o.owner]}
                  value={money(o.profit)}
                  nota={`${o.soldPieces} vendidas · ${money(o.investedStanding)} parado`}
                />
              ))}
            </section>
          )}

          <section>
            <h2 className="text-body uppercase tracking-widest mb-3">
              Ventas del periodo ({ventas.length})
            </h2>
            {ventas.length === 0 ? (
              <p className="text-label text-ink-faint py-4">Nada vendido en este periodo.</p>
            ) : (
              <ul>
                {ventas.map((m) => (
                  <Fila key={`v-${m.id}`} m={m} showOwner={showOwner} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-body uppercase tracking-widest mb-3">
              Compras del periodo ({compras.length})
            </h2>
            {compras.length === 0 ? (
              <p className="text-label text-ink-faint py-4">
                Nada con fecha de compra en este periodo.
              </p>
            ) : (
              <ul>
                {compras.map((m) => (
                  <Fila key={`c-${m.id}`} m={m} showOwner={showOwner} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
