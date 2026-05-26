import { createAdminClient } from '@/lib/supabase/admin'
import ProductForm from '../_components/ProductForm'
import { createProduct } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const supabase = createAdminClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, slug, name_es').order('sort_order'),
    supabase.from('brands').select('id, name, slug, logo_url, is_active').order('name'),
  ])

  return <ProductForm categories={categories ?? []} brands={brands ?? []} action={createProduct} />
}
