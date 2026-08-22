/**
 * Prompts cerrados de Studio.
 * Catálogo y modelo: fondo 100% blanco. La prenda es el héroe.
 * No mezclar con visual-search.
 */

export const DESCRIBE_GARMENT_PROMPT = [
  'Describe this clothing item in one rich English sentence:',
  'garment type, color, silhouette, apparent material, visible logos/graphics, and hardware.',
  'Mention stains or wrinkles only as facts about the source photo, not as required in the output.',
  'No emojis. Max 60 words. Do not invent details that are not in the photos.',
].join(' ')

const PURE_WHITE_BG = [
  'BACKGROUND IS MANDATORY PURE WHITE: seamless infinity cove, #FFFFFF, totally white, nothing else.',
  'No alley, no brick, no graffiti, no street, no room, no floor texture, no gray wall, no gradient sky, no mood lighting on the set.',
  'Only a very soft contact shadow under the subject is allowed. The rest of the frame is empty white.',
].join(' ')

const CLEAN_PRESENTATION = [
  'MANDATORY PRESENTATION: the garment must look freshly laundered, steam-pressed, immaculate, and boutique-ready.',
  'Remove ALL wrinkles, creases, crumples, collar ring, pit stains, yellowing, dinginess, lint, dust, pills, and spots.',
  'Whites must be bright clean white. Colors must look fresh, not dull or dirty.',
  'Arrange the garment perfectly: symmetric, sleeves and hem aligned, collar neat, fabric smooth.',
].join(' ')

export function catalogPrompt(
  garmentDescription: string,
  pose: string,
  changeNote?: string,
  _cleanWear = true
): string {
  return [
    'Create a single vertical 4:5 professional e-commerce CATALOG photograph of THIS exact garment only.',
    pose,
    'True flat-lay (or ghost/filled silhouette for jackets/outerwear), centered, perfectly symmetrical.',
    PURE_WHITE_BG,
    'Even catalog lighting, no harsh glare, no lifestyle scene, no model, no hanger, no mannequin stand visible.',
    'CATALOG STYLE REFERENCES teach layout and immaculate pressing ONLY. Ignore their background if it is not pure white. Never copy those garments.',
    'Ignore any website UI, carousel arrows, or buttons in a style reference.',
    `Garment identity to keep: ${garmentDescription}`,
    'Keep the exact colorway, cut, stitching, labels, prints, logos, and hardware from the GARMENT SOURCE photos.',
    CLEAN_PRESENTATION,
    'Do not invent logos, graphics, or brand marks that are not on the source garment.',
    'No extra props, no other clothing, no text overlay, no watermark.',
    changeNote
      ? `OPERATOR CHANGE REQUEST (apply this, but NEVER change garment identity, never leave the white background): ${changeNote}`
      : '',
    'Output one image only.',
  ]
    .filter(Boolean)
    .join(' ')
}

const MALE_LOOKS = [
  'LOOK (unique for this shot): young East Asian man, short neat black hair, looking slightly down. No cap, no sunglasses.',
  'LOOK (unique for this shot): young man with dark wavy medium-length hair, looking slightly away. Optional thin dark sunglasses only if they do not hide the garment.',
  'LOOK (unique for this shot): young man with curly medium-length brown hair, looking at camera, calm. No hat.',
  'LOOK (unique for this shot): young Black man, short textured hair, looking at camera. No hat.',
  'LOOK (unique for this shot): young man, fair skin, buzz cut, small silver hoop earrings, photorealistic. No hat.',
  'LOOK (unique for this shot): young Latino man, messy dark brown hair, direct gaze. No hat.',
]

const FEMALE_LOOKS = [
  'LOOK (unique for this shot): young East Asian woman, straight dark hair, looking slightly down. No hat.',
  'LOOK (unique for this shot): young woman with dark wavy hair, looking slightly away. No hat.',
  'LOOK (unique for this shot): young Black woman, short natural hair or sleek bun, looking at camera. No hat.',
  'LOOK (unique for this shot): young Latina woman, long dark hair, calm gaze. No hat.',
  'LOOK (unique for this shot): young woman, fair skin, cropped hair, small hoop earrings. No hat.',
  'LOOK (unique for this shot): young woman, curly brown hair, looking at camera. No hat.',
]

export function modelLook(gender: 'male' | 'female', lookIndex: number): string {
  const list = gender === 'female' ? FEMALE_LOOKS : MALE_LOOKS
  const i = ((lookIndex % list.length) + list.length) % list.length
  return list[i]
}

export function modelPrompt(
  garmentDescription: string,
  gender: 'male' | 'female',
  pose: string,
  look: string,
  changeNote?: string,
  _cleanWear = true
): string {
  const body =
    gender === 'female'
      ? 'The wearer is a REAL young adult woman (early 20s): slim, lean, high-fashion model body — thin, long lines, not curvy-plus, not muscular gym body.'
      : 'The wearer is a REAL young adult man (early 20s): slim, lean, high-fashion model body — thin, tall, not bulky, not bodybuilder, not “chad gym” muscle.'

  return [
    'Create a single vertical 4:5 photorealistic luxury-fashion e-commerce photograph of THIS exact garment worn on one person.',
    PURE_WHITE_BG,
    body,
    look,
    'Youthful photorealistic skin. Streetwear lookbook model (Supreme / Yeezy / Dior) — DIFFERENT face from other shots in the set. Never clone the same face.',
    pose,
    'Aesthetic: Supreme lookbook, Yeezy campaign, Dior, Dolce & Gabbana — clean, expensive, minimal, editorial.',
    'THE GARMENT IS THE HERO. It must occupy attention: large in frame, sharp, centered. The person is a hanger for the clothes, not a character study.',
    'No busy styling that competes: no eye patch, no wallet chain dominating, no heavy costume, no extra jackets, no hats unless the source garment is a hat.',
    'Calm expression. Real photography, not CGI, not plastic AI face.',
    `Garment identity to keep: ${garmentDescription}`,
    'The garment MUST be the uploaded item: exact color, cut, prints, logos, and hardware — brand-new, steamed, perfectly worn.',
    CLEAN_PRESENTATION,
    'On the body the garment sits correctly: no bunching, no messy collar, no wrinkled torso.',
    'Do not invent logos, graphics, or brand marks. Do not replace the garment with a different item.',
    changeNote
      ? `OPERATOR CHANGE REQUEST (apply this, but NEVER change garment identity, never leave the white background, keep the model young and slim): ${changeNote}`
      : '',
    'One person only. No text overlay, no watermark. Output one image only.',
  ]
    .filter(Boolean)
    .join(' ')
}
