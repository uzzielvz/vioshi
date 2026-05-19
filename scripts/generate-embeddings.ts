/**
 * VIOGI — Visual Search Embeddings
 *
 * Estrategia image-to-text-to-embedding (estándar para retrieval):
 *   1. Descarga la imagen primaria de cada producto seed.
 *   2. Gemini 2.5 Flash genera una descripción visual rica.
 *   3. gemini-embedding-001 embebe esa descripción (768 dims via
 *      Matryoshka truncation con outputDimensionality: 768).
 *   4. Update products.embedding.
 *
 * Solo procesa productos con prefijo "[seed]" en description y
 * embedding NULL. Idempotente: corre varias veces sin duplicar.
 *
 * Uso: npx tsx scripts/generate-embeddings.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE || !GEMINI_KEY) {
  console.error('Faltan variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o GEMINI_API_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

const FLASH_MODEL = 'gemini-2.5-flash';
const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMS = 768;
const RATE_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function describeImage(base64: string, mime: string): Promise<string> {
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

async function embedText(text: string): Promise<number[]> {
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

type Pending = {
  product_id: string;
  product_name: string;
  image_url: string;
};

async function fetchPending(): Promise<Pending[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, product_images!inner(url, is_primary)')
    .like('description', '[seed]%')
    .is('embedding', null)
    .eq('product_images.is_primary', true);

  if (error) throw new Error('Error consultando pendientes: ' + error.message);

  return (data ?? []).map((row: any) => ({
    product_id: row.id,
    product_name: row.name,
    image_url: row.product_images[0]?.url,
  }));
}

async function processOne(p: Pending, idx: number, total: number): Promise<boolean> {
  const tag = `[${idx + 1}/${total}]`;
  let attempts = 0;
  while (attempts < 3) {
    try {
      const imgRes = await fetch(p.image_url);
      if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mime = imgRes.headers.get('content-type') || 'image/jpeg';

      const description = await describeImage(base64, mime);
      const vector = await embedText(description);

      const { error: updateErr } = await supabase
        .from('products')
        .update({ embedding: vector })
        .eq('id', p.product_id);

      if (updateErr) throw new Error('Update DB: ' + updateErr.message);

      console.log(`${tag} ✓ embebido: ${p.product_name}`);
      console.log(`        AI: "${description.slice(0, 110)}${description.length > 110 ? '…' : ''}"`);
      return true;
    } catch (err: any) {
      attempts++;
      const msg = err?.message || String(err);
      const is429 = msg.includes('429') || msg.toLowerCase().includes('rate');
      console.warn(`${tag} ⚠ intento ${attempts}/3 falló: ${msg}`);
      if (is429) {
        console.warn(`${tag}   rate limit detectado, espero 60s…`);
        await sleep(60_000);
      } else {
        await sleep(2000);
      }
    }
  }
  console.error(`${tag} ✗ skip definitivo: ${p.product_name}`);
  return false;
}

async function main() {
  console.log(`VIOGI — Visual Search Embeddings`);
  console.log(`Modelos: flash=${FLASH_MODEL}  embed=${EMBED_MODEL} (${EMBED_DIMS}d)\n`);

  const pending = await fetchPending();
  if (pending.length === 0) {
    console.log('Nada pendiente. Todos los seeds tienen embedding.');
    return;
  }
  console.log(`Pendientes: ${pending.length}\n`);

  let ok = 0;
  for (let i = 0; i < pending.length; i++) {
    const success = await processOne(pending[i], i, pending.length);
    if (success) ok++;
    if (i < pending.length - 1) await sleep(RATE_DELAY_MS);
  }

  console.log(`\nEmbeddings: ${ok}/${pending.length} generados.`);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
