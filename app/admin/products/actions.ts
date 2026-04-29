'use server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  await supabase.from('products').delete().eq('id', id)
  revalidateTag('products')
}
