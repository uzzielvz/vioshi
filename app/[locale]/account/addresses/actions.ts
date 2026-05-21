'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AddressActionState = { error: string } | { success: string } | null;

// ─── Add address ──────────────────────────────────────────────────────────────

export async function addAddressAction(
  _prev: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: 'No autenticado' };

  const isDefault = formData.get('is_default') === 'on';

  // If this will be the default, unset current default first
  if (isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { error } = await supabase.from('addresses').insert({
    user_id: user.id,
    first_name: (formData.get('first_name') as string)?.trim(),
    last_name:  (formData.get('last_name')  as string)?.trim(),
    phone:      (formData.get('phone')      as string)?.trim(),
    street:     (formData.get('street')     as string)?.trim(),
    apartment:  (formData.get('apartment')  as string)?.trim() || null,
    colony:     (formData.get('colony')     as string)?.trim() || null,
    city:       (formData.get('city')       as string)?.trim(),
    state:      (formData.get('state')      as string)?.trim(),
    zip_code:   (formData.get('zip_code')   as string)?.trim(),
    country:    (formData.get('country')    as string) || 'MX',
    is_default: isDefault,
  });

  if (error) return { error: error.message };

  revalidatePath('/[locale]/account/addresses', 'page');
  return { success: 'Dirección guardada' };
}

// ─── Delete address ───────────────────────────────────────────────────────────

export async function deleteAddressAction(id: string): Promise<AddressActionState> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // RLS + explicit guard

  if (error) return { error: error.message };

  revalidatePath('/[locale]/account/addresses', 'page');
  return { success: 'Dirección eliminada' };
}

// ─── Set default address ──────────────────────────────────────────────────────

export async function setDefaultAddressAction(id: string): Promise<AddressActionState> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { error: 'No autenticado' };

  // Unset all, then set the chosen one
  const { error: unsetError } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user.id);

  if (unsetError) return { error: unsetError.message };

  const { error: setError } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (setError) return { error: setError.message };

  revalidatePath('/[locale]/account/addresses', 'page');
  return { success: 'Dirección predeterminada actualizada' };
}
