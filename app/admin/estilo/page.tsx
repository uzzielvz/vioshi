import Link from 'next/link'
import { requireFullAdmin } from '@/lib/admin/session'
import { Apilada, Barras, Linea } from '../_components/Charts'

/**
 * Página de muestra del sistema visual. No toca datos: sirve para decidir la
 * estética mirando, no imaginando. Cuando el diseño quede aprobado, esto se
 * queda como referencia de lo que existe (y de lo que NO hay que reinventar
 * en cada pantalla).
 */
export const dynamic = 'force-dynamic'

const VENTAS = [
  { label: 'may', value: 1800 },
  { label: 'jun', value: 2400 },
  { label: 'jul', value: 1200 },
  { label: 'ago', value: 3100 },
  { label: 'sep', value: 2600 },
  { label: 'oct', value: 3800 },
]

function Seccion({
  titulo,
  nota,
  children,
}: {
  titulo: string
  nota?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-label uppercase text-ink-faint">{titulo}</h2>
      {nota && <p className="text-meta text-ink-muted mt-1 max-w-xl">{nota}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default async function EstiloPage() {
  await requireFullAdmin()

  return (
    <div className="max-w-4xl flex flex-col gap-10 pb-20">
      <header>
        <h1 className="text-display">Sistema visual</h1>
        <p className="text-body text-ink-muted mt-2 max-w-xl">
          Todo lo que compone el panel, junto en una pantalla. Dime qué te gusta y qué no;
          lo que apruebes aquí se propaga al resto.
        </p>
      </header>

      <Seccion
        titulo="Tipografía"
        nota="El contenido va en sentence case y a tamaño legible. Las mayúsculas se reservan para botones, pestañas y etiquetas."
      >
        <div className="flex flex-col gap-3">
          <p className="text-display">Display · 32px</p>
          <p className="text-title">Title · 20px — títulos de sección</p>
          <p className="text-lead">Lead · 16px — el texto que de verdad se lee</p>
          <p className="text-body">Body · 14px — descripciones y contenido secundario</p>
          <p className="text-meta text-ink-muted">Meta · 13px — fechas, dueño, canal</p>
          <p className="text-label uppercase text-ink-faint">Label · 11px mayúsculas</p>
        </div>
      </Seccion>

      <Seccion
        titulo="Color"
        nota="Negro para texto y acción. El azul es funcional: links, pestaña activa y foco de campo. Nunca decora."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Ink', 'bg-ink'],
            ['Muted', 'bg-ink-muted'],
            ['Faint', 'bg-ink-faint'],
            ['Accent', 'bg-accent'],
            ['Accent soft', 'bg-accent-soft'],
            ['Panel', 'bg-surface-panel'],
            ['Fill', 'bg-surface-fill'],
            ['Line', 'bg-line'],
          ].map(([nombre, clase]) => (
            <div key={nombre}>
              <div className={`h-12 border border-line ${clase}`} />
              <p className="text-label uppercase text-ink-faint mt-1.5">{nombre}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-ink text-white text-label uppercase px-6 min-h-[44px]">
            Acción principal
          </button>
          <button className="border border-ink text-ink text-label uppercase px-6 min-h-[44px] hover:bg-ink hover:text-white transition-colors">
            Secundaria
          </button>
          <button className="text-label uppercase text-accent min-h-[44px] px-1 border-b border-accent">
            Terciaria
          </button>
          <button
            disabled
            className="bg-ink/20 text-white text-label uppercase px-6 min-h-[44px] cursor-not-allowed"
          >
            Deshabilitada
          </button>
        </div>
      </Seccion>

      <Seccion titulo="Pestañas" nota="Subrayado grueso en la activa, como en la referencia.">
        <nav className="flex gap-6 border-b border-line">
          {['Inventario', 'Reportes', 'Pedidos'].map((t, i) => (
            <span
              key={t}
              className={`text-body pb-3 -mb-px ${
                i === 0 ? 'border-b-2 border-ink text-ink' : 'text-ink-muted'
              }`}
            >
              {t}
            </span>
          ))}
        </nav>
      </Seccion>

      <Seccion titulo="Campos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
          <div>
            <label className="text-label uppercase text-ink-faint block mb-1.5">Nombre</label>
            <input
              defaultValue="Jersey Alemania 2014"
              className="w-full border-b border-line py-2.5 min-h-[44px] text-body bg-transparent focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-label uppercase text-ink-faint block mb-1.5">Costo</label>
            <input
              defaultValue="250"
              className="w-full border-b border-line py-2.5 min-h-[44px] text-body bg-transparent focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-meta text-ink-muted mt-1.5">Toca el campo: el foco va en azul.</p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Cifra protagonista" nota="Una por pantalla. Si todo destaca, nada destaca.">
        <div className="border-b border-line pb-6">
          <p className="text-label uppercase text-ink-faint">Ganancia de octubre</p>
          <p className="text-hero tabular-nums mt-2">$12,480</p>
          <p className="text-meta text-ink-muted mt-2">
            <span className="text-accent">▲ 32%</span> vs. septiembre
          </p>
        </div>
      </Seccion>

      <Seccion titulo="Gráficas" nota="SVG propio, sin librería: tres gráficas no justifican 500 KB.">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-body mb-3">Ganancia por mes</p>
            <Barras data={VENTAS} format={(n) => `$${Math.round(n / 100) / 10}k`} />
          </div>

          <div>
            <p className="text-body mb-3">Composición del inventario</p>
            <Apilada
              partes={[
                { label: 'En la tienda', value: 18, tono: 'bg-ink' },
                { label: 'Solo inventario', value: 19, tono: 'bg-accent' },
                { label: 'Merma', value: 4, tono: 'bg-ink-faint' },
              ]}
            />
          </div>

          <div>
            <p className="text-body mb-3">Capital parado</p>
            <Linea data={VENTAS} />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Fila de lista" nota="Separador de 1px, sin tarjetas con sombra.">
        <ul>
          {[
            ['Jersey Alemania 2014', 'Playera · Mario · $250', 'En la tienda'],
            ['Chamarra Carhartt', 'Chamarra · Uzziel · $480', 'Solo inventario'],
            ['Pants Nike vintage', 'Pants · Mario · sin costo', 'Merma'],
          ].map(([nombre, meta, estado]) => (
            <li
              key={nombre}
              className="border-b border-line-soft py-4 flex items-baseline justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-lead">{nombre}</span>
                <p className="text-meta text-ink-muted mt-1">{meta}</p>
              </div>
              <span className="text-label uppercase text-ink-faint shrink-0">{estado}</span>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Panel secundario" nota="El gris de los filtros de la referencia.">
        <div className="bg-surface-panel p-5 max-w-sm">
          <p className="text-body">Una prenda sin costo capturado no entra en el margen.</p>
          <p className="text-meta text-ink-muted mt-2">
            Se reporta aparte para que el número no mienta.
          </p>
          <Link href="/admin/products" className="text-meta text-accent border-b border-accent mt-3 inline-block">
            Ver inventario
          </Link>
        </div>
      </Seccion>
    </div>
  )
}
