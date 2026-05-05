'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ProfileUpdateState =
  | { error: string }
  | { ok: true }
  | null

export async function updateProfileAction(
  _prev: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesión expirada. Inicia sesión de nuevo.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!name) {
    return { error: 'El nombre es obligatorio.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name, phone: phone || null })
    .eq('id', user.id)

  if (error) {
    return { error: 'No se pudo guardar el perfil. Intenta de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}
