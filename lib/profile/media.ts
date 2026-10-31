// Shared by the upload action (server) and the image prep (browser).
export const PROFILE_MEDIA_BUCKET = 'profile-media';
export const PROFILE_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Server actions accept 1 MB bodies by default; the browser shrinks photos below this.
export const PROFILE_MEDIA_MAX_BYTES = 950_000;

export type ProfileMediaKind = 'avatar' | 'cover';

/** Storage path of a file in the profile bucket, only when it sits in this user's folder. */
export function profileMediaPath(url: string | null | undefined, userId: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${PROFILE_MEDIA_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  let path: string;
  try {
    path = decodeURIComponent(url.slice(at + marker.length));
  } catch {
    return null; // The column is writable by its owner; ignore a malformed value.
  }
  return path.startsWith(`${userId}/`) ? path : null;
}
