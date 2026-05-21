'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthOrigin } from '@/lib/auth/getOrigin'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error: string } | { success: string } | null

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const locale = String(formData.get('locale') ?? 'es')

  if (!email || !password) return { error: 'Email y contraseña requeridos.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Credenciales inválidas.' }

  revalidatePath('/', 'layout')
  redirect(`/${locale}`)
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const locale = String(formData.get('locale') ?? 'es')

  if (!email || !password) return { error: 'Email y contraseña requeridos.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAuthOrigin()}/auth/callback?next=/${locale}`,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'Este correo ya está registrado.' }
    }
    return { error: 'No se pudo crear la cuenta. Intenta de nuevo.' }
  }

  if (data.user && (firstName || lastName)) {
    await supabase
      .from('profiles')
      .upsert(
        { id: data.user.id, name: `${firstName} ${lastName}`.trim() },
        { onConflict: 'id' }
      )
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect(`/${locale}`)
  }

  return { success: 'Revisa tu correo para confirmar tu cuenta.' }
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get('locale') ?? 'es')
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(`/${locale}/account`)
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const locale = String(formData.get('locale') ?? 'es')

  if (!email) return { error: 'Email requerido.' }

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAuthOrigin()}/auth/callback?next=/${locale}/account/reset`,
  })

  if (error) return { error: 'No se pudo enviar el correo de recuperación.' }
  return { success: 'Correo de recuperación enviado.' }
}

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const locale = String(formData.get('locale') ?? 'es')

  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: 'No se pudo actualizar la contraseña.' }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/account`)
}

export async function signInWithGoogleAction(formData: FormData) {
  const locale = String(formData.get('locale') ?? 'es')
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAuthOrigin()}/auth/callback?next=/${locale}`,
    },
  })

  if (error || !data.url) {
    redirect(`/${locale}/account?error=oauth`)
  }

  redirect(data.url)
}
