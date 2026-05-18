import { NextRequest, NextResponse } from 'next/server';
import type { ClassificationResponse } from '@/types/visual-search';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Solicitud inválida.', code: 'UNKNOWN' },
      { status: 400 }
    );
  }

  const file = formData.get('image');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'No se recibió ninguna imagen.', code: 'UNKNOWN' },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Solo se aceptan imágenes JPEG o PNG.', code: 'INVALID_FORMAT' },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'La imagen no debe superar los 10 MB.', code: 'FILE_TOO_LARGE' },
      { status: 413 }
    );
  }

  const inferenceUrl = process.env.INFERENCE_SERVICE_URL ?? 'http://localhost:8000';

  try {
    const upstream = new FormData();
    upstream.append('image', file);

    const response = await fetch(`${inferenceUrl}/classify`, {
      method: 'POST',
      body: upstream,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const code = response.status === 422 ? 'LOW_QUALITY' : 'SERVICE_UNAVAILABLE';
      return NextResponse.json(
        { error: body?.detail ?? 'Error en el servicio de inferencia.', code },
        { status: response.status }
      );
    }

    const result: ClassificationResponse = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    return NextResponse.json(
      {
        error: isTimeout
          ? 'El servicio de clasificación tardó demasiado. Intenta de nuevo.'
          : 'El servicio de clasificación no está disponible.',
        code: 'SERVICE_UNAVAILABLE',
      },
      { status: 503 }
    );
  }
}
