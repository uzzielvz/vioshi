import { createAdminClient } from '@/lib/supabase/admin'
import CreateMinimalForm from './_components/CreateMinimalForm'
import ProductPicker from './_components/ProductPicker'
import { font } from './_components/studioUi'

export const dynamic = 'force-dynamic'

export default async function AdminStudioPage() {
  const supabase = createAdminClient()

  const [{ data: products }, { data: raws }, { data: gens }] = await Promise.all([
    supabase.from('products').select('id, name, slug, price_mxn, sold_out').order('created_at', { ascending: false }),
    supabase.from('studio_raw_photos').select('product_id'),
    supabase.from('studio_generations').select('product_id, status').eq('status', 'pending'),
  ])

  const rawCount = new Map<string, number>()
  for (const row of raws ?? []) {
    rawCount.set(row.product_id, (rawCount.get(row.product_id) ?? 0) + 1)
  }

  const pendingCount = new Map<string, number>()
  for (const row of gens ?? []) {
    pendingCount.set(row.product_id, (pendingCount.get(row.product_id) ?? 0) + 1)
  }

  const list = (products ?? []).map((p) => ({
    ...p,
    rawCount: rawCount.get(p.id) ?? 0,
    pendingCount: pendingCount.get(p.id) ?? 0,
  }))

  return (
    <div className="flex flex-col gap-12">
      <h1 className="uppercase tracking-widest" style={{ ...font, fontSize: '13px', fontWeight: 500 }}>
        Studio
      </h1>

      <section>
        <h2 className="uppercase tracking-widest mb-4" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          New piece
        </h2>
        <CreateMinimalForm />
        <p className="text-gray-400 mt-3" style={{ ...font, fontSize: '10px' }}>
          Crea un producto mínimo (sold out). El resto de ficha se edita en Products. No aparece en la tienda hasta
          aprobar fotos aquí.
        </p>
      </section>

      <section>
        <h2 className="uppercase tracking-widest mb-4" style={{ ...font, fontSize: '11px', fontWeight: 500 }}>
          Pieces ({list.length})
        </h2>
        <ProductPicker products={list} />
      </section>
    </div>
  )
}
