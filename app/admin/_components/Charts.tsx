/**
 * Gráficas en SVG, sin librería.
 *
 * Tres gráficas simples no justifican sumar Recharts (~500 KB) a un panel que
 * se usa desde el celular con datos móviles. Además `FROZEN.md` pide no añadir
 * dependencias sin que el humano las pida.
 *
 * Todas son server components: no hay estado ni interacción, solo dibujo.
 */

type Punto = { label: string; value: number }

function nice(n: number): string {
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10}k`
  return String(Math.round(n))
}

/**
 * Barras por periodo. El eje no se dibuja: una línea base y el valor máximo
 * rotulado bastan, y así la gráfica sigue legible a 320px de ancho.
 */
export function Barras({
  data,
  height = 120,
  format = nice,
}: {
  data: Punto[]
  height?: number
  format?: (n: number) => string
}) {
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value), 1)
  const ultimo = data.length - 1

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / max) * height)
          const activo = i === ultimo
          return (
            <div key={d.label} className="flex-1 flex flex-col justify-end items-center gap-1">
              <span
                className={`text-label tabular-nums ${activo ? 'text-ink' : 'text-ink-faint'}`}
              >
                {d.value > 0 ? format(d.value) : ''}
              </span>
              <div
                className={`w-full ${activo ? 'bg-ink' : 'bg-ink/20'}`}
                style={{ height: h }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-2 border-t border-line pt-2">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`flex-1 text-center text-label uppercase ${
              i === ultimo ? 'text-ink' : 'text-ink-faint'
            }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Barra apilada: composición de un total en una sola línea. */
export function Apilada({
  partes,
}: {
  partes: { label: string; value: number; tono: string }[]
}) {
  const total = partes.reduce((s, p) => s + p.value, 0)
  if (total === 0) return null

  const visibles = partes.filter((p) => p.value > 0)

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-sm">
        {visibles.map((p) => (
          <div
            key={p.label}
            className={p.tono}
            style={{ width: `${(p.value / total) * 100}%` }}
            title={`${p.label}: ${p.value}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {visibles.map((p) => (
          <span key={p.label} className="text-meta text-ink-muted flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${p.tono}`} />
            {p.label}
            <span className="tabular-nums text-ink">{p.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Línea de tendencia. SVG con viewBox y `preserveAspectRatio="none"`: se estira
 * al ancho disponible sin recalcular nada en el cliente.
 */
export function Linea({ data, height = 48 }: { data: Punto[]; height?: number }) {
  if (data.length < 2) return null

  const vals = data.map((d) => d.value)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const span = max - min || 1
  const W = 100

  const puntos = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = height - ((d.value - min) / span) * (height - 4) - 2
    return `${x},${y}`
  })

  const ultimo = puntos[puntos.length - 1].split(',')

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label={`Tendencia de ${data[0].label} a ${data[data.length - 1].label}`}
    >
      <polyline
        points={`0,${height} ${puntos.join(' ')} ${W},${height}`}
        fill="var(--accent-soft)"
        stroke="none"
      />
      <polyline
        points={puntos.join(' ')}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={ultimo[0]} cy={ultimo[1]} r="2" fill="var(--accent)" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
