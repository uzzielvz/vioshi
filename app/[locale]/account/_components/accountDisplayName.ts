import type { User } from '@supabase/supabase-js';

export function getAccountDisplayName(
  user: User,
  profileName: string | null
): string {
  if (profileName && profileName.trim()) return profileName.trim();
  const meta = user.user_metadata as Record<string, unknown> | null;
  const fullName =
    typeof meta?.full_name === 'string' ? meta.full_name.trim() : '';
  if (fullName) return fullName;
  return user.email ?? 'Usuario';
}
