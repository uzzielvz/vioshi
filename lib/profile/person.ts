import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface PersonProfile {
  name: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  /** Migration 0026 applied: the photo and cover can be changed. */
  mediaReady: boolean;
  /** Null without the follows table. */
  followingCount: number | null;
  purchasesCount: number;
  savedIds: string[];
}

// Everything the profile header shows about the signed-in person, read with
// their session (RLS keeps each query to their own rows).
export async function getPersonProfile(user: User): Promise<PersonProfile> {
  const supabase = createClient();

  const [withMedia, following, purchases, saved] = await Promise.all([
    supabase.from('profiles').select('name, avatar_url, cover_url').eq('id', user.id).maybeSingle(),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('payment_status', 'completed'),
    supabase.from('wishlist_items').select('product_id').eq('user_id', user.id),
  ]);

  let profile = withMedia.data as { name: string | null; avatar_url?: string | null; cover_url?: string | null } | null;
  const mediaReady = !withMedia.error;
  if (!mediaReady) {
    const { data } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle();
    profile = data;
  }

  return {
    name: profile?.name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    coverUrl: profile?.cover_url ?? null,
    mediaReady,
    // A missing table answers a HEAD count with an empty 404: no error, no count.
    followingCount: following.error || following.count === null ? null : following.count,
    purchasesCount: purchases.count ?? 0,
    savedIds: ((saved.data ?? []) as { product_id: string }[]).map((row) => row.product_id),
  };
}
