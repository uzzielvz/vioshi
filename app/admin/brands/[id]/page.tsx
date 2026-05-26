import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import BrandForm from '../_components/BrandForm'
import { updateBrand } from '../actions'

const font = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
}

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, is_active')
    .eq('id', id)
    .single()

  if (!brand) {
    notFound()
  }

  return (
    <div className="max-w-[620px]">
      <div className="mb-8">
        <Link
          href="/admin/brands"
          className="uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          style={{ ...font, fontSize: '10px' }}
        >
          ← Back to brands
        </Link>
      </div>

      <h1 className="uppercase tracking-widest mb-2" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        {brand.name}
      </h1>
      <p className="mb-10 text-gray-400 uppercase tracking-widest text-xs" style={font}>
        ID: {brand.id}
      </p>

      <BrandForm action={updateBrand} mode="edit" brand={brand} />
    </div>
  )
}
