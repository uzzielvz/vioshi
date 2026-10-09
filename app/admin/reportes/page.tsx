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

const font = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }

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
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-gray-100">
      <span className="uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '10px' }}>
        {label}
      </span>
      <span className="text-right">
        <span className="font-mono" style={{ ...font, fontSize: '13px' }}>
          {value}
        </span>
        {nota && (
          <span className="block text-gray-400" style={{ ...font, fontSize: '10px' }}>
            {nota}
          </span>
        )}
      </span>
    </div>
  )
}

function Fila({ m, showOwner }: { m: Movement; showOwner: boolean }) {
  const importe =
    m.kind === 'venta'
      ? m.priceMxn == null
        ? '—'
        : money(m.priceMxn)
      : m.costMxn == null
        ? '—'
        : money(m.costMxn)

  return (
    <li className="border-b border-gray-100 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/admin/products/${m.id}`}
          className="min-w-0 break-words border-b border-black hover:opacity-50 transition-opacity"
          style={{ ...font, fontSize: '12px' }}
        >
          {m.name}
        </Link>
        <span className="font-mono shrink-0" style={{ ...font, fontSize: '12px' }}>
          {importe}
        </span>
      </div>
      <p className="text-gray-400 mt-1" style={{ ...font, fontSize: '10px' }}>
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
  const delta = s && stats.previous ? variation(s.profit, stats.previous.profit) : null

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
          Reporte
        </h1>
        <Link
          href={`/admin/reportes/csv?periodo=${period}`}
          prefetch={false}
          className="border border-black uppercase tracking-widest text-center w-full sm:w-auto px-6 min-h-[44px] flex items-center justify-center hover:bg-black hover:text-white transition-colors shrink-0"
          style={{ ...font, fontSize: '11px', fontWeight: 500 }}
        >
          Descargar CSV
        </Link>
      </div>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-gray-200 pb-4 mb-8">
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/admin/reportes?periodo=${p}`}
            className={`uppercase tracking-widest min-h-[32px] flex items-center transition-colors ${
              p === period ? 'text-black border-b border-black' : 'text-gray-400 hover:text-black'
            }`}
            style={{ ...font, fontSize: '10px' }}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </nav>

      {stats.error && (
        <p className="border border-black bg-white px-4 py-3" style={{ ...font, fontSize: '11px' }}>
          {stats.error}
        </p>
      )}

      {!stats.error && s && (
        <div className="flex flex-col gap-10">
          <section>
            <h2
              className="uppercase tracking-widest mb-3"
              style={{ ...font, fontSize: '11px', fontWeight: 500 }}
            >
              {PERIOD_LABELS[period]}
            </h2>
            <Linea
              label="Ganancia"
              value={money(s.profit)}
              nota={
                delta === null
                  ? undefined
                  : `${delta > 0 ? '▲' : delta < 0 ? '▼' : '='} ${Math.abs(delta)}% vs. periodo anterior`
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
            <Linea label="Merma" value={`${s.mermaPieces} · ${money(s.mermaCost)}`} />
            {s.soldMissingCost > 0 && (
              <p className="text-gray-400 pt-3" style={{ ...font, fontSize: '10px' }}>
                {s.soldMissingCost} vendida{s.soldMissingCost === 1 ? '' : 's'} sin costo capturado:
                la ganancia está incompleta.
              </p>
            )}
          </section>

          {showOwner && stats.perOwner.length > 1 && (
            <section>
              <h2
                className="uppercase tracking-widest mb-3"
                style={{ ...font, fontSize: '11px', fontWeight: 500 }}
              >
                Por persona
              </h2>
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
            <h2
              className="uppercase tracking-widest mb-3"
              style={{ ...font, fontSize: '11px', fontWeight: 500 }}
            >
              Ventas del periodo ({ventas.length})
            </h2>
            {ventas.length === 0 ? (
              <p className="text-gray-400 py-4" style={{ ...font, fontSize: '11px' }}>
                Nada vendido en este periodo.
              </p>
            ) : (
              <ul>
                {ventas.map((m) => (
                  <Fila key={`v-${m.id}`} m={m} showOwner={showOwner} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2
              className="uppercase tracking-widest mb-3"
              style={{ ...font, fontSize: '11px', fontWeight: 500 }}
            >
              Compras del periodo ({compras.length})
            </h2>
            {compras.length === 0 ? (
              <p className="text-gray-400 py-4" style={{ ...font, fontSize: '11px' }}>
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
