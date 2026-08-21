/**
 * Prompts cerrados de Studio.
 * Sustituye este archivo si ya tienes un prompt de producción —
 * no mezclar con visual-search.
 */

export const DESCRIBE_GARMENT_PROMPT = [
  'Describe this second-hand clothing item in one rich English sentence:',
  'garment type, color, silhouette, apparent material, visible logos/graphics,',
  'hardware, and any wear, fading, stains, pilling, or damage that is actually visible.',
  'No emojis. Max 60 words. Do not invent details that are not in the photos.',
].join(' ')

export function catalogPrompt(garmentDescription: string, cleanWear: boolean): string {
  return [
    'Create a single vertical 4:5 Instagram catalog photograph of THIS exact garment only.',
    'Invisible / ghost mannequin: the garment is empty, holds its worn shape, no person, no head, no neck, no arms, no visible dummy or hanger hardware.',
    'Pure white background, soft natural contact shadow under the garment.',
    'Photorealistic e-commerce product photography, even lighting, high detail.',
    `Garment to reproduce with high fidelity: ${garmentDescription}`,
    'Match color, fabric texture, stitching, labels, prints, logos, hardware, and all existing wear exactly as in the source photos of the garment.',
    'Do not invent logos, graphics, or brand marks that are not on the garment.',
    cleanWear
      ? 'Minor cleanup of lint and dust is allowed; keep real fading, holes, and structural wear.'
      : 'Do not clean, repair, beautify, or remove wear, stains, fading, pilling, or damage.',
    'No extra props, no other clothing, no text overlay, no watermark.',
    'Output one image only.',
  ].join(' ')
}

export function modelPrompt(garmentDescription: string, cleanWear: boolean): string {
  return [
    'Create a single vertical 4:5 photorealistic photograph of THIS exact garment worn on a model.',
    'STYLE REFERENCE photos define lighting, posing language, crop, camera, and aesthetic ONLY. Copy that look. Do not copy garments from the style references.',
    'The garment in the output MUST be the uploaded garment, high fidelity: exact color, cut, prints, logos, hardware, and wear.',
    `Garment: ${garmentDescription}`,
    'Do not invent logos, graphics, or brand marks. Do not replace the garment with a different item.',
    cleanWear
      ? 'Minor cleanup of lint and dust is allowed; keep real fading, holes, and structural wear.'
      : 'Do not clean, repair, beautify, or remove wear, stains, fading, pilling, or damage.',
    'One person, editorial streetwear, natural skin, no text overlay, no watermark.',
    'Output one image only.',
  ].join(' ')
}
