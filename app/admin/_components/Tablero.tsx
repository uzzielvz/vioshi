import Link from 'next/link'
import { formatPrice } from '@/lib/formatters'
import { PERIOD_LABELS, variation, type AgingItem, type OwnerStats, type Period } from '@/lib/admin/stats'

/**
 * Tablero del panel.
 *
 * Lenguaje visual: el mismo que /account (rediseño Grailed) — densidad alta,
 * mucho blanco, bordes finos, etiquetas en mayúsculas pequeñas y la cifra como
 * protagonista. Sin color de acento: FROZEN.md mantiene blanco y negro, así que
 * la jerarquía se construye con tamaño y peso, no con color.
 */

const OWNER_LABELS: Record<'uzziel' | 'mario', string> = {
  uzziel: 'Uzziel',
  mario: 'Mario',
}

function money(value: number) {
  return formatPrice(value, 'es', false)
}

/** ▲ / ▼ contra el mismo periodo anterior. Sin base de comparación, no se inventa. */
function Delta({ now, before }: { now: number; before: number | undefined }) {
  if (before === undefined) return null
  const v = variation(now, before)
  if (v === null) return <span className="text-label text-ink-faint">sin comparación</span>

  const flecha = v > 0 ? '▲' : v < 0 ? '▼' : '='
  return (
    <span className="text-label text-ink-muted tabular-nums">
      {flecha} {Math.abs(v)}% <span className="text-ink-faint">vs. periodo anterior</span>
    </span>
  )
}

/** La cifra que manda. Una por tablero: si todo destaca, nada destaca. */
function Hero({
  label,
  value,
  delta,
  nota,
}: {
  label: string
  value: string
  delta?: React.ReactNode
  nota?: string
}) {
  return (
    <div className="border-b border-line pb-6">
      <p className="text-label uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="text-hero tabular-nums mt-2">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {delta}
        {nota && <span className="text-label text-ink-faint">{nota}</span>}
      </div>
    </div>
  )
}

function Cifra({
  label,
  value,
  hint,
  delta,
}: {
  label: string
  value: string
  hint?: string
  delta?: React.ReactNode
}) {
  return (
    <div className="py-4 border-b border-line-soft">
      <p className="text-label uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="text-display tabular-nums mt-1.5">{value}</p>
      {delta && <div className="mt-1">{delta}</div>}
      {hint && <p className="text-label text-ink-muted mt-1">{hint}</p>}
    </div>
  )
}

/**
 * Composición del inventario en una barra. Dice de un vistazo cuánto de lo que
 * tienes está realmente a la venta — que es la pregunta que el número suelto
 * de "prendas" no responde.
 */
function Composicion({ stats }: { stats: OwnerStats }) {
  const total = stats.standingListed + stats.standingInventoryOnly + stats.deadPieces
  if (total === 0) return null

  const partes = [
    { label: 'En la tienda', n: stats.standingListed, tono: 'bg-ink' },
    { label: 'Solo inventario', n: stats.standingInventoryOnly, tono: 'bg-ink-muted' },
    { label: 'Fuera (merma)', n: stats.deadPieces, tono: 'bg-ink-faint' },
  ].filter((p) => p.n > 0)

  return (
    <div className="py-4">
      <p className="text-label uppercase tracking-widest text-ink-faint mb-2">Composición</p>
      <div className="flex h-2 w-full overflow-hidden">
        {partes.map((p) => (
          <div
            key={p.label}
            className={p.tono}
            style={{ width: `${(p.n / total) * 100}%` }}
            title={`${p.label}: ${p.n}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {partes.map((p) => (
          <span key={p.label} className="text-label text-ink-muted flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 ${p.tono}`} />
            {p.label} <span className="tabular-nums text-ink">{p.n}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function BloqueDinero({
  titulo,
  stats,
  previous,
  period,
}: {
  titulo: string
  stats: OwnerStats
  previous: OwnerStats | null
  period: Period
}) {
  const incompleta = stats.soldMissingCost > 0

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-body uppercase tracking-widest">{titulo}</h2>
        <span className="text-label uppercase tracking-widest text-ink-faint">
          {PERIOD_LABELS[period]}
        </span>
      </div>

      <Hero
        label="Ganancia del periodo"
        value={money(stats.profit)}
        delta={<Delta now={stats.profit} before={previous?.profit} />}
        nota={
          incompleta
            ? `${stats.soldMissingCost} vendida${stats.soldMissingCost === 1 ? '' : 's'} sin costo capturado`
            : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8">
        <Cifra
          label="Vendido"
          value={`${stats.soldPieces}`}
          delta={<Delta now={stats.soldPieces} before={previous?.soldPieces} />}
          hint={
            stats.soldPieces > 0
              ? `${money(stats.soldRevenue)} · ${stats.soldWeb} web / ${stats.soldInstagram} IG`
              : 'Nada vendido en el periodo'
          }
        />
        <Cifra
          label="Comprado"
          value={`${stats.boughtPieces}`}
          delta={<Delta now={stats.boughtPieces} before={previous?.boughtPieces} />}
          hint={
            stats.withoutBuyDate > 0
              ? `${money(stats.boughtCost)} · ${stats.withoutBuyDate} sin fecha`
              : money(stats.boughtCost)
          }
        />
        <Cifra
          label="Capital parado"
          value={money(stats.investedStanding)}
          hint={`${stats.standingPieces} prenda${stats.standingPieces === 1 ? '' : 's'} sin vender`}
        />
        <Cifra
          label="Merma"
          value={`${stats.mermaPieces}`}
          hint={stats.mermaPieces > 0 ? `${money(stats.mermaCost)} perdidos` : 'Ninguna'}
        />
      </div>

      <Composicion stats={stats} />

      {stats.soldWithoutDate > 0 && (
        <p className="text-label text-ink-faint pt-1">
          {stats.soldWithoutDate} vendidas sin fecha registrada: no entran en ningún periodo.
        </p>
      )}
    </section>
  )
}

export function BloqueOwner({ stats }: { stats: OwnerStats }) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="text-label uppercase tracking-widest text-ink-faint">
        {OWNER_LABELS[stats.owner]}
      </p>
      <p className="text-title tabular-nums mt-2">{money(stats.profit)}</p>
      <p className="text-label text-ink-muted mt-1">ganancia del periodo</p>
      <div className="mt-3 pt-3 border-t border-line-soft flex flex-wrap gap-x-5 gap-y-1">
        <span className="text-label text-ink-muted">
          Parado <span className="tabular-nums text-ink">{money(stats.investedStanding)}</span>
        </span>
        <span className="text-label text-ink-muted">
          Sin vender <span className="tabular-nums text-ink">{stats.standingPieces}</span>
        </span>
        {stats.mermaPieces > 0 && (
          <span className="text-label text-ink-muted">
            Merma <span className="tabular-nums text-ink">{stats.mermaPieces}</span>
          </span>
        )}
      </div>
    </div>
  )
}

/** Lo más viejo sin vender: lo accionable del tablero. */
export function Antiguedad({ items, showOwner }: { items: AgingItem[]; showOwner: boolean }) {
  const max = items[0]?.days || 1

  return (
    <section>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-body uppercase tracking-widest">Lo más viejo sin vender</h2>
        <span className="text-label uppercase tracking-widest text-ink-faint">Capital parado</span>
      </div>
      <p className="text-label text-ink-muted mb-4">
        Días desde que se compró o se registró. Lo de arriba es lo que hay que mover.
      </p>

      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="border-b border-line-soft py-3">
            <div className="flex items-baseline justify-between gap-4">
              <Link
                href={`/admin/products/${item.id}`}
                className="text-read min-w-0 break-words border-b border-ink hover:opacity-50 transition-opacity"
              >
                {item.name}
              </Link>
              <span className="text-read tabular-nums shrink-0">{item.days}d</span>
            </div>
            <div className="mt-2 h-px w-full bg-line-soft">
              <div className="h-px bg-ink" style={{ width: `${(item.days / max) * 100}%` }} />
            </div>
            <p className="text-label text-ink-faint mt-1.5">
              {showOwner ? `${OWNER_LABELS[item.owner]} · ` : ''}
              {item.costMxn == null ? 'sin costo' : money(item.costMxn)} ·{' '}
              {item.listed ? 'En la tienda' : 'Solo inventario'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
