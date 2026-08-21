'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { font } from './studioUi'

type StudioProduct = {
  id: string
  name: string
  slug: string
  price_mxn: string | number
  sold_out: boolean
  rawCount: number
  pendingCount: number
}

export default function ProductPicker({ products }: { products: StudioProduct[] }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term)
    )
  }, [products, q])

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto"
        className="w-full max-w-sm border-b border-gray-200 bg-transparent py-2.5 mb-6 focus:outline-none focus:border-black transition-colors"
        style={{ ...font, fontSize: '11px' }}
      />

      {filtered.length === 0 ? (
        <p className="text-center py-16 uppercase tracking-widest text-gray-400" style={{ ...font, fontSize: '11px' }}>
          No products
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {['Name', 'Slug', 'Raws', 'Pending', ''].map((h) => (
                <th
                  key={h || 'actions'}
                  className="text-left pb-3 uppercase tracking-widest text-gray-400 font-normal"
                  style={{ ...font, fontSize: '10px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-6" style={{ ...font, fontSize: '11px' }}>
                  {product.name}
                </td>
                <td className="py-3 pr-6 text-gray-500" style={{ ...font, fontSize: '11px' }}>
                  {product.slug}
                </td>
                <td className="py-3 pr-6 font-mono" style={{ ...font, fontSize: '11px' }}>
                  {product.rawCount}/4
                </td>
                <td className="py-3 pr-6 font-mono" style={{ ...font, fontSize: '11px' }}>
                  {product.pendingCount}
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/studio/${product.id}`}
                    className="uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity"
                    style={{ ...font, fontSize: '10px' }}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
