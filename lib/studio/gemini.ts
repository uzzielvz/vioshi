import { GoogleGenAI } from '@google/genai'
import {
  FLASH_IMAGE_MODEL,
  IMAGE_ASPECT_RATIO,
  PRO_IMAGE_MODEL,
  STUDIO_BUCKET,
  VISION_MODEL,
  type GenerationKind,
  type ImageQuality,
  type ModelGender,
} from './constants'
import { catalogPrompt, DESCRIBE_GARMENT_PROMPT, modelPrompt } from './prompts'
import { inferGarmentFamily, poseInstruction } from './poses'

type InlinePart = { inlineData: { mimeType: string; data: string } }
type TextPart = { text: string }
type Part = InlinePart | TextPart

export type StudioImageInput = {
  mimeType: string
  base64: string
  label: string
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')
  return new GoogleGenAI({ apiKey })
}

export function resolveImageModel(kind: GenerationKind, quality: ImageQuality): string {
  if (kind === 'model' && quality === 'pro') return PRO_IMAGE_MODEL
  return FLASH_IMAGE_MODEL
}

export async function blobToStudioImage(
  blob: Blob,
  fallbackMime: string,
  label: string
): Promise<StudioImageInput> {
  const buffer = Buffer.from(await blob.arrayBuffer())
  const mimeType = blob.type && blob.type.startsWith('image/') ? blob.type : fallbackMime
  return {
    mimeType,
    base64: buffer.toString('base64'),
    label,
  }
}

export async function describeGarment(images: StudioImageInput[]): Promise<string> {
  if (images.length === 0) {
    throw new Error('no_raw_photos')
  }

  const ai = getClient()
  const parts: Part[] = [
    { text: DESCRIBE_GARMENT_PROMPT },
    ...images.flatMap((img): Part[] => [
      { text: `Photo (${img.label}):` },
      { inlineData: { mimeType: img.mimeType, data: img.base64 } },
    ]),
  ]

  const res = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: [{ role: 'user', parts }],
  })

  const text = res.text?.trim() ?? ''
  if (!text) throw new Error('description_failed')
  return text
}

export async function generateStudioImage(opts: {
  kind: GenerationKind
  quality: ImageQuality
  cleanWear: boolean
  gender: ModelGender
  garmentDescription: string
  garmentImages: StudioImageInput[]
  styleRefs: StudioImageInput[]
  poseIndex?: number
  changeNote?: string
}): Promise<{ buffer: Buffer; mimeType: string; prompt: string; model: string }> {
  const model = resolveImageModel(opts.kind, opts.quality)
  const family = inferGarmentFamily(opts.garmentDescription)
  const pose = poseInstruction(opts.kind, family, opts.poseIndex ?? 0)
  const changeNote = opts.changeNote?.trim() || undefined
  const prompt =
    opts.kind === 'catalog'
      ? catalogPrompt(opts.garmentDescription, pose, changeNote, opts.cleanWear)
      : modelPrompt(opts.garmentDescription, opts.gender, pose, changeNote, opts.cleanWear)

  const parts: Part[] = [{ text: prompt }]

  for (const img of opts.garmentImages) {
    parts.push({ text: `GARMENT SOURCE (${img.label}):` })
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  if (opts.kind === 'catalog') {
    for (const img of opts.styleRefs) {
      parts.push({
        text: `CATALOG STYLE REFERENCE (photography look only; ignore website UI; do not copy this garment) (${img.label}):`,
      })
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
    }
  }

  const ai = getClient()
  const res = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: IMAGE_ASPECT_RATIO },
    },
  })

  const inline = extractInlineImage(res)
  if (!inline) throw new Error('image_failed')

  return {
    buffer: Buffer.from(inline.data, 'base64'),
    mimeType: inline.mimeType,
    prompt,
    model,
  }
}

function extractInlineImage(res: {
  candidates?: Array<{
    content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> }
  }>
}): { mimeType: string; data: string } | null {
  const parts = res.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const data = part.inlineData?.data
    if (!data) continue
    return {
      mimeType: part.inlineData?.mimeType || 'image/png',
      data,
    }
  }
  return null
}

export function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

export { STUDIO_BUCKET }
