/**
 * VIOGI — Visual search embeddings (shared).
 *
 * Extraído de scripts/generate-embeddings.ts para que el admin pueda generar
 * el embedding de una prenda al publicarla, sin duplicar el prompt ni el
 * modelo. Estrategia image-to-text-to-embedding:
 *   1. Descarga la imagen.
 *   2. Gemini 2.5 Flash genera una descripción visual rica.
 *   3. gemini-embedding-001 embebe esa descripción (768 dims via
 *      Matryoshka truncation con outputDimensionality: 768).
 */

import { GoogleGenAI } from '@google/genai';

export const FLASH_MODEL = 'gemini-2.5-flash';
export const EMBED_MODEL = 'gemini-embedding-001';
export const EMBED_DIMS = 768;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');
  return new GoogleGenAI({ apiKey });
}

export async function describeImage(base64: string, mime: string): Promise<string> {
  const ai = getGenAI();
  const res = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Describe this clothing item in one rich sentence: color, shape, style, apparent material, pattern or texture. In English, no emojis, no prefixes. Max 50 words.',
          },
          { inlineData: { mimeType: mime, data: base64 } },
        ],
      },
    ],
  });
  const text = res.text;
  if (!text) throw new Error('Gemini Flash returned empty text');
  return text.trim();
}

export async function embedText(text: string): Promise<number[]> {
  const ai = getGenAI();
  const res = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: text,
    config: { outputDimensionality: EMBED_DIMS },
  });
  const vector = res.embeddings?.[0]?.values;
  if (!vector || vector.length !== EMBED_DIMS) {
    throw new Error(`Expected ${EMBED_DIMS}-dim vector, got ${vector?.length}`);
  }
  return vector;
}

/** Descarga la imagen principal de una prenda y devuelve su embedding visual. */
export async function embedProductImage(imageUrl: string): Promise<number[]> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mime = imgRes.headers.get('content-type') || 'image/jpeg';

  const description = await describeImage(base64, mime);
  return embedText(description);
}
