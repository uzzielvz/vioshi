import { createClient } from '@supabase/supabase-js'

// Solo para Server Actions — NUNCA importar en client components
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
