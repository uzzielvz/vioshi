'use server';

import { createClient } from '@/lib/supabase/server';

// Follows and account-backed saved pieces. Every action degrades to
// `available: false` when the tables are missing (migration 0025 not applied
// yet) so the storefront keeps working without the social layer.

export type FollowKind = 'store' | 'brand';

export interface FollowState {
  available: boolean;
  signedIn: boolean;
  following: boolean;
  count: number | null;
}

export type FollowResult = { ok: true } | { ok: false; reason: 'auth' | 'unavailable' | 'invalid' };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SAVED = 200;

function column(kind: FollowKind) {
  return kind === 'store' ? 'store_id' : 'brand_id';
}

function isValid(kind: unknown, id: unknown): kind is FollowKind {
  return (kind === 'store' || kind === 'brand') && typeof id === 'string' && UUID_RE.test(id);
}

export async function getFollowStateAction(kind: FollowKind, id: string): Promise<FollowState> {
  const off: FollowState = { available: false, signedIn: false, following: false, count: null };
  if (!isValid(kind, id)) return off;

  const supabase = createClient();
  const [{ data: { user } }, countRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc('follower_count', { p_kind: kind, p_id: id }),
  ]);
  if (countRes.error) return off;

  let following = false;
  if (user) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', user.id)
      .eq(column(kind), id)
      .maybeSingle();
    if (error) return off;
    following = Boolean(data);
  }

  return { available: true, signedIn: Boolean(user), following, count: Number(countRes.data ?? 0) };
}

export async function setFollowAction(kind: FollowKind, id: string, follow: boolean): Promise<FollowResult> {
  if (!isValid(kind, id)) return { ok: false, reason: 'invalid' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'auth' };

  if (follow) {
    const { error } = await supabase.from('follows').insert({ user_id: user.id, [column(kind)]: id });
    // 23505: already following, which is the state we wanted.
    if (error && error.code !== '23505') return { ok: false, reason: 'unavailable' };
  } else {
    const { error } = await supabase.from('follows').delete().eq('user_id', user.id).eq(column(kind), id);
    if (error) return { ok: false, reason: 'unavailable' };
  }
  return { ok: true };
}

/**
 * Merges this device's saved pieces into the account the first time the
 * account is seen here (`mergedFor` differs), then returns the account list,
 * newest last, as the new local copy. Returns null without a session or
 * when wishlist_items can't be read.
 */
export async function syncSavedAction(
  localIds: string[],
  mergedFor: string | null
): Promise<{ userId: string; ids: string[] } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (mergedFor !== user.id) {
    const candidates = Array.from(new Set(localIds.filter((id) => typeof id === 'string' && UUID_RE.test(id)))).slice(
      0,
      MAX_SAVED
    );
    if (candidates.length > 0) {
      // Stale ids (deleted pieces) would fail the FK for the whole batch.
      const { data: existing } = await supabase.from('products').select('id').in('id', candidates);
      const rows = (existing ?? []).map((p) => ({ user_id: user.id, product_id: p.id as string }));
      if (rows.length > 0) {
        const { error } = await supabase
          .from('wishlist_items')
          .upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
        if (error) return null;
      }
    }
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true })
    .limit(MAX_SAVED);
  if (error) return null;

  return { userId: user.id, ids: (data ?? []).map((row) => row.product_id as string) };
}

export async function setSavedAction(productId: string, saved: boolean): Promise<boolean> {
  if (!UUID_RE.test(productId)) return false;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = saved
    ? await supabase
        .from('wishlist_items')
        .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true })
    : await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', productId);
  return !error;
}
