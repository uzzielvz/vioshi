import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory rate limit: 5 requests per IP per 60s (per serverless instance)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const FLASH_MODEL = 'gemini-2.5-flash';
const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMS = 768;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'no_image' }, { status: 400 });
    }
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'too_large' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const descRes = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Describe this clothing item in one rich sentence: color, shape, style, apparent material. In English, no emojis. Max 50 words.',
            },
            { inlineData: { mimeType: file.type, data: base64 } },
          ],
        },
      ],
    });
    const aiDescription = descRes.text?.trim() ?? '';
    if (!aiDescription) {
      return NextResponse.json({ error: 'description_failed' }, { status: 502 });
    }

    const embedRes = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: aiDescription,
      config: { outputDimensionality: EMBED_DIMS },
    });
    const queryEmbedding = embedRes.embeddings?.[0]?.values;
    if (!queryEmbedding || queryEmbedding.length !== EMBED_DIMS) {
      return NextResponse.json({ error: 'embedding_failed' }, { status: 502 });
    }

    const supabase = createAdminClient();
    const { data: matches, error } = await supabase.rpc('match_products_by_image', {
      query_embedding: queryEmbedding,
      match_count: 3,
    });

    if (error) {
      console.error('rpc_error', error);
      return NextResponse.json({ error: 'search_failed' }, { status: 500 });
    }

    const ids = (matches ?? []).map((m: any) => m.id);
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, url')
      .in('product_id', ids)
      .eq('is_primary', true);

    const imageMap = new Map((images ?? []).map((i: any) => [i.product_id, i.url]));
    const results = (matches ?? []).map((m: any) => ({
      ...m,
      image_url: imageMap.get(m.id) ?? null,
    }));

    return NextResponse.json({ results, ai_description: aiDescription });
  } catch (err) {
    console.error('visual_search_error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
