import Image from 'next/image'
import Link from 'next/link'
import { getAdminActor } from '@/lib/admin/session'
import { listInventory, whereLabel, type InventoryItem } from '@/lib/admin/inventory'
import { formatPrice } from '@/lib/formatters'
import { GARMENT_TYPE_LABELS, isGarmentType } from '@/lib/garments'
import DeleteButton from './DeleteButton'
import SoldToggle from './SoldToggle'

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

export const dynamic = 'force-dynamic'

function money(value: number) {
  return formatPrice(value, 'es', false)
}


function reservedNow(item: InventoryItem): boolean {
  return (
    !item.soldOut &&
    item.reservedUntil != null &&
    new Date(item.reservedUntil).getTime() > Date.now()
  )
}

/**
 * Vista de teléfono. La tabla tiene nueve columnas y no cabe en 390px; esto
 * pone lo mismo en una tarjeta, con los botones separados lo suficiente para
 * no tocar "borrar" cuando quieres "editar".
 */
function ProductCard({ item, showOwner }: { item: InventoryItem; showOwner: boolean }) {
  return (
    <li className="border border-gray-200 bg-white p-3 flex gap-3">
      <div className="w-16 h-20 bg-gray-100 relative overflow-hidden shrink-0">
        {item.image && (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
        )}
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 break-words" style={{ ...fontStyle, fontSize: '13px' }}>
            {item.name}
          </p>
          <span
            className="uppercase tracking-widest text-gray-400 shrink-0"
            style={{ ...fontStyle, fontSize: '10px' }}
          >
            {whereLabel(item.disposition, item.listed)}
          </span>
        </div>

        <p className="text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
          {isGarmentType(item.garmentType) ? GARMENT_TYPE_LABELS[item.garmentType] : 'Sin tipo'}
          {showOwner ? ` · ${item.owner === 'mario' ? 'Mario' : 'Uzziel'}` : ''}
        </p>

        <p className="font-mono text-gray-600" style={{ ...fontStyle, fontSize: '11px' }}>
          Costo {item.costMxn == null ? '—' : money(item.costMxn)} · Precio{' '}
          {item.priceMxn == null ? '—' : money(item.priceMxn)}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <SoldToggle id={item.id} vendida={item.soldOut} apartada={reservedNow(item)} />
          <div className="flex items-center gap-5">
            <Link
              href={`/admin/products/${item.id}`}
              className="uppercase tracking-widest border-b border-black min-h-[44px] flex items-center"
              style={{ ...fontStyle, fontSize: '11px' }}
            >
              Editar
            </Link>
            <DeleteButton id={item.id} />
          </div>
        </div>
      </div>
    </li>
  )
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { embed?: string }
}) {
  const actor = await getAdminActor()
  const { items: products, error } = await listInventory(actor)
  const embedPending = searchParams?.embed === 'pending'

  return (
    <div>
      {embedPending && (
        <p
          className="border border-black bg-gray-50 px-4 py-3 mb-6 uppercase tracking-widest"
          style={{ ...fontStyle, fontSize: '10px', fontWeight: 500 }}
        >
          Publicado. Embedding pendiente — el buscador visual tardará en verla.
        </p>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="uppercase tracking-widest"
          style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
        >
          Inventario ({products.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors"
          style={{ ...fontStyle, fontSize: '10px', fontWeight: 500 }}
        >
          Registrar prenda
        </Link>
      </div>

      {error && (
        <p
          className="border border-black bg-white px-4 py-3 mb-8"
          style={{ ...fontStyle, fontSize: '11px' }}
        >
          {error}
        </p>
      )}

      {!error && products.length === 0 ? (
        <p
          className="text-center py-24 uppercase tracking-widest text-gray-400"
          style={{ ...fontStyle, fontSize: '11px' }}
        >
          Aún no hay prendas
        </p>
      ) : (
        <>
          <ul className="md:hidden flex flex-col gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} item={product} showOwner={actor === 'uzziel'} />
            ))}
          </ul>

          <table className="hidden md:table w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {(actor === 'uzziel'
                ? ['', 'Prenda', 'Tipo', 'Dueño', 'Costo', 'Precio', 'Dónde', 'Estado', '']
                : ['', 'Prenda', 'Tipo', 'Costo', 'Precio', 'Dónde', 'Estado', '']
              ).map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                  style={{ ...fontStyle, fontSize: '10px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const apartada =
                !product.soldOut &&
                product.reservedUntil != null &&
                new Date(product.reservedUntil).getTime() > Date.now()
              return (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="w-10 h-12 bg-gray-100 relative overflow-hidden">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-6" style={{ ...fontStyle, fontSize: '11px' }}>
                    {product.name}
                  </td>
                  <td className="py-3 pr-6 text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
                    {isGarmentType(product.garmentType) ? GARMENT_TYPE_LABELS[product.garmentType] : '—'}
                  </td>
                  {actor === 'uzziel' && (
                    <td className="py-3 pr-6 uppercase tracking-widest" style={{ ...fontStyle, fontSize: '10px' }}>
                      {product.owner}
                    </td>
                  )}
                  <td className="py-3 pr-6 font-mono" style={{ ...fontStyle, fontSize: '11px' }}>
                    {product.costMxn == null ? '—' : money(product.costMxn)}
                  </td>
                  <td className="py-3 pr-6 font-mono" style={{ ...fontStyle, fontSize: '11px' }}>
                    {product.priceMxn == null ? '—' : money(product.priceMxn)}
                  </td>
                  <td className="py-3 pr-6 uppercase tracking-widest" style={{ ...fontStyle, fontSize: '10px' }}>
                    {whereLabel(product.disposition, product.listed)}
                  </td>
                  <td className="py-3 pr-6">
                    <SoldToggle id={product.id} vendida={product.soldOut} apartada={apartada} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity"
                        style={{ ...fontStyle, fontSize: '10px' }}
                      >
                        Editar
                      </Link>
                      <DeleteButton id={product.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          </table>
        </>
      )}
    </div>
  )
}
