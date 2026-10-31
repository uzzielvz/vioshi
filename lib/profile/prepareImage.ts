import { PROFILE_MEDIA_MAX_BYTES, type ProfileMediaKind } from './media';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

// Phone photos are several MB: the avatar becomes a 480px square and the cover
// at most 1800px wide, both JPEG under the upload limit. Browsers apply the
// EXIF rotation when drawing an <img>, so portraits stay upright.
export async function prepareProfileImage(file: File, kind: ProfileMediaKind): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) throw new Error('decode');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');

  if (kind === 'avatar') {
    const side = Math.min(w, h);
    const size = Math.min(480, side);
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  } else {
    const scale = Math.min(1, 1800 / w, 1800 / h);
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  for (const quality of [0.86, 0.78, 0.68, 0.58]) {
    const blob = await toJpeg(canvas, quality);
    if (blob && blob.size <= PROFILE_MEDIA_MAX_BYTES) return blob;
  }
  throw new Error('too_big');
}
