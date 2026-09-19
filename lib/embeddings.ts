import { GoogleGenAI } from '@google/genai'

const FLASH_MODEL = 'gemini-2.5-flash'
const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMS = 768

const DESCRIBE_PROMPT =
  'Describe this clothing item in one rich sentence: color, shape, style, apparent material, pattern or texture. In English, no emojis, no prefixes. Max 50 words.'

/**
 * Generates a 768-dim visual-search embedding for a product from its
 * primary image URL (image -> Gemini description -> embedding).
 * Returns null on any failure (missing key, fetch error, bad response) so
 * callers can treat this as best-effort and never block publishing.
 */
export async function generateProductEmbedding(imageUrl: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mime = imgRes.headers.get('content-type') || 'image/jpeg'

    const ai = new GoogleGenAI({ apiKey })

    const descRes = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: DESCRIBE_PROMPT },
            { inlineData: { mimeType: mime, data: base64 } },
          ],
        },
      ],
    })
    const description = descRes.text?.trim()
    if (!description) return null

    const embedRes = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: description,
      config: { outputDimensionality: EMBED_DIMS },
    })
    const vector = embedRes.embeddings?.[0]?.values
    if (!vector || vector.length !== EMBED_DIMS) return null

    return vector
  } catch (err) {
    console.error('generateProductEmbedding failed', err)
    return null
  }
}
