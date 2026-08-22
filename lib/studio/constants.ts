export const STUDIO_BUCKET = 'studio-private'
export const PRODUCT_IMAGES_BUCKET = 'product-images'

export const SIGNED_URL_TTL_SEC = 60 * 60

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const MAX_STYLE_REFS = 8
export const MIN_STYLE_REFS = 4

export const DEFAULT_MODEL_COUNT = 2
export const MAX_MODEL_COUNT = 6

export const FLASH_IMAGE_MODEL = 'gemini-3.1-flash-image'
export const PRO_IMAGE_MODEL = 'gemini-3-pro-image'
export const VISION_MODEL = 'gemini-2.5-flash'

export const IMAGE_ASPECT_RATIO = '4:5'

/** Instagram feed portrait post */
export const IG_POST_WIDTH = 1080
export const IG_POST_HEIGHT = 1350

export const SHOT_TYPES = ['front', 'back', 'detail', 'label'] as const
export type ShotType = (typeof SHOT_TYPES)[number]

export const SHOT_LABELS: Record<ShotType, string> = {
  front: 'Frente',
  back: 'Reverso',
  detail: 'Detalle',
  label: 'Etiqueta',
}

export type GenerationKind = 'catalog' | 'model'
export type GenerationStatus = 'pending' | 'approved' | 'discarded'
export type ImageQuality = 'flash' | 'pro'
export type ModelGender = 'male' | 'female'
