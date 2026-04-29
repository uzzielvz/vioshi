import { createAdminClient } from '@/lib/supabase/admin'
import ProductForm from '../_components/ProductForm'
import { createProduct } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_es')
    .order('sort_order')

  return <ProductForm categories={categories ?? []} action={createProduct} />
}
