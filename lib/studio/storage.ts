import type { createAdminClient } from '@/lib/supabase/admin'
import { SIGNED_URL_TTL_SEC, STUDIO_BUCKET } from './constants'

type AdminClient = ReturnType<typeof createAdminClient>

export async function createStudioSignedUrl(
  supabase: AdminClient,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STUDIO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function createStudioSignedUrls(
  supabase: AdminClient,
  paths: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (paths.length === 0) return map

  const { data, error } = await supabase.storage
    .from(STUDIO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SEC)

  if (error || !data) return map

  for (const item of data) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl)
  }
  return map
}
