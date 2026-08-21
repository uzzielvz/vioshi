import Image from 'next/image'
import Link from 'next/link'
import { getAdminProducts } from '@/lib/products'
import { formatPrice } from '@/lib/formatters'
import DeleteButton from './DeleteButton'

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await getAdminProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          className="uppercase tracking-widest"
          style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
        >
          Products ({products.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white uppercase tracking-widest px-4 py-2 hover:bg-gray-800 transition-colors"
          style={{ ...fontStyle, fontSize: '10px', fontWeight: 500 }}
        >
          + NEW PRODUCT
        </Link>
      </div>

      {products.length === 0 ? (
        <p
          className="text-center py-24 uppercase tracking-widest text-gray-400"
          style={{ ...fontStyle, fontSize: '11px' }}
        >
          No products yet
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {['Image', 'Name', 'Category', 'Price', 'New', 'Sold Out', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                  style={{ ...fontStyle, fontSize: '10px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
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
                  {product.category ?? '—'}
                </td>
                <td className="py-3 pr-6 font-mono" style={{ ...fontStyle, fontSize: '11px' }}>
                  {formatPrice(product.price, 'es', false)}
                </td>
                <td className="py-3 pr-6">
                  {product.isNew ? (
                    <span className="w-1.5 h-1.5 bg-black rounded-full inline-block" />
                  ) : (
                    <span className="text-gray-300" style={{ fontSize: '11px' }}>—</span>
                  )}
                </td>
                <td className="py-3 pr-6">
                  {product.soldOut ? (
                    <span className="w-1.5 h-1.5 bg-black rounded-full inline-block" />
                  ) : (
                    <span className="text-gray-300" style={{ fontSize: '11px' }}>—</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity"
                      style={{ ...fontStyle, fontSize: '10px' }}
                    >
                      Edit
                    </Link>
                    <DeleteButton id={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
