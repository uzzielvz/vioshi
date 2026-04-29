import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ProductForm from '../_components/ProductForm'
import { updateProduct } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id, slug, name, description, price_mxn, original_price_mxn, category_id, sku, material, made_in, is_featured, is_new, sold_out, product_images (id, url, is_primary, sort_order)')
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('id, slug, name_es')
      .order('sort_order'),
  ])

  if (!product) notFound()

  type Row = typeof product & { product_images: { id: string; url: string; is_primary: boolean; sort_order: number }[] }
  const row = product as unknown as Row
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <ProductForm
      categories={categories ?? []}
      product={{ ...row, product_images: images }}
      action={updateProduct}
    />
  )
}
