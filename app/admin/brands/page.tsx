import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import ToggleButton from './ToggleButton'
import DeleteBrandButton from './DeleteBrandButton'

export const dynamic = 'force-dynamic'

const font = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

export default async function BrandsAdminPage() {
  const supabase = createAdminClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, is_active, created_at')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
            BRANDS ({brands?.length ?? 0})
          </h1>
          <p className="text-gray-400 text-xs mt-1" style={font}>
            Manage brands and minimalist black/white logos for filtering
          </p>
        </div>

        <Link
          href="/admin/brands/new"
          className="uppercase tracking-widest bg-black text-white px-6 py-2.5 text-xs hover:bg-gray-900 transition-colors"
          style={font}
        >
          + NEW BRAND
        </Link>
      </div>

      {!brands || brands.length === 0 ? (
        <div className="border border-dashed border-gray-300 py-12 text-center">
          <p className="text-gray-400 uppercase tracking-widest text-xs" style={font}>
            No brands yet. Create your first one.
          </p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {['Logo', 'Name', 'Slug', 'Status', 'Created', 'Actions'].map((h) => (
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
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-6">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-8 w-auto object-contain grayscale"
                      style={{ maxWidth: '80px' }}
                    />
                  ) : (
                    <div className="text-gray-400 text-xs" style={font}>
                      — no logo —
                    </div>
                  )}
                </td>

                <td className="py-3 pr-6" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
                  {brand.name}
                </td>

                <td className="py-3 pr-6 text-gray-500" style={{ ...font, fontSize: '11px' }}>
                  {brand.slug}
                </td>

                <td className="py-3 pr-6">
                  <ToggleButton id={brand.id} isActive={brand.is_active} />
                </td>

                <td className="py-3 pr-6 text-gray-400 text-xs" style={font}>
                  {new Date(brand.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                <td className="py-3 flex items-center gap-4">
                  <Link
                    href={`/admin/brands/${brand.id}`}
                    className="uppercase tracking-widest border-b border-black hover:opacity-60 transition-opacity text-xs"
                    style={font}
                  >
                    Edit
                  </Link>
                  <DeleteBrandButton id={brand.id} name={brand.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
