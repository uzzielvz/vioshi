'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  PROFILE_MEDIA_BUCKET,
  PROFILE_MEDIA_MAX_BYTES,
  PROFILE_MEDIA_TYPES,
  profileMediaPath,
} from './media';

export type ProfileMediaResult =
  | { ok: true }
  | { ok: false; reason: 'auth' | 'invalid' | 'unavailable' | 'error' };

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Uploads with the service role so the bucket needs no write policies; the
// path is always the signed-in user's own folder.
export async function uploadProfileMediaAction(formData: FormData): Promise<ProfileMediaResult> {
  const kind = formData.get('kind');
  const file = formData.get('file');
  if ((kind !== 'avatar' && kind !== 'cover') || !(file instanceof Blob)) return { ok: false, reason: 'invalid' };
  if (!PROFILE_MEDIA_TYPES.includes(file.type) || file.size === 0 || file.size > PROFILE_MEDIA_MAX_BYTES) {
    return { ok: false, reason: 'invalid' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'auth' };

  const column = kind === 'avatar' ? 'avatar_url' : 'cover_url';

  // Fails while migration 0026 is not applied.
  const { data: current, error: readError } = await supabase
    .from('profiles')
    .select('avatar_url, cover_url')
    .eq('id', user.id)
    .maybeSingle();
  if (readError) return { ok: false, reason: 'unavailable' };

  const admin = createAdminClient();
  const path = `${user.id}/${kind}-${Date.now()}.${EXTENSIONS[file.type]}`;
  const { error: uploadError } = await admin.storage
    .from(PROFILE_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (uploadError) {
    console.error('[profile-media] upload failed', uploadError.message);
    return { ok: false, reason: 'unavailable' };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path);

  const { error: saveError } = await supabase
    .from('profiles')
    .update({ [column]: publicUrl })
    .eq('id', user.id);
  if (saveError) {
    await admin.storage.from(PROFILE_MEDIA_BUCKET).remove([path]);
    return { ok: false, reason: 'error' };
  }

  const previous = profileMediaPath((current as Record<string, string | null> | null)?.[column], user.id);
  if (previous) await admin.storage.from(PROFILE_MEDIA_BUCKET).remove([previous]);

  return { ok: true };
}
