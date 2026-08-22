/**
 * Prompts cerrados de Studio.
 * Catálogo y modelo: fondo 100% blanco. La prenda es el héroe.
 * No mezclar con visual-search.
 */

import type { GarmentFamily } from './poses'

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

export function detailPrompt(garmentDescription: string, changeNote?: string): string {
  return [
    'Create a single vertical 4:5 HD e-commerce DETAIL photograph of THIS exact garment.',
    'Close-up catalog still life: fabric texture, stitching, print, embroidery, or hardware — whatever the GARMENT SOURCE (Detalle) shows. If there is no Detalle photo, pick the most informative close area from the other sources.',
    'Fill the frame. The detail is large, razor-sharp, boutique HD. Not a full garment, not a model.',
    PURE_WHITE_BG,
    'Even high-key catalog lighting, no harsh glare, no color cast, no lifestyle scene.',
    `Garment identity to keep: ${garmentDescription}`,
    'Keep the exact color, weave, print, logos, and hardware from the source. Do not invent text or marks.',
    CLEAN_PRESENTATION,
    'Fabric looks steam-pressed and immaculate even in the close-up.',
    'No extra props, no hands, no model, no text overlay, no watermark.',
    changeNote
      ? `OPERATOR CHANGE REQUEST (apply this, but NEVER change garment identity, never leave the white background): ${changeNote}`
      : '',
    'Output one image only.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function labelPrompt(garmentDescription: string, changeNote?: string): string {
  return [
    'Create a single vertical 4:5 HD e-commerce LABEL / CARE-TAG photograph of THIS exact garment.',
    'Tight close-up of the brand label, size tag, or care label from the GARMENT SOURCE (Etiqueta). If that photo is missing, use the clearest label visible in the other sources.',
    'Label centered, flat, steam-pressed, perfectly readable, HD. Isolated on white. No model, no full garment unless needed to hold the tag.',
    PURE_WHITE_BG,
    'Even catalog lighting so the type is sharp. No glare that hides the text.',
    `Garment identity to keep: ${garmentDescription}`,
    'Copy the label text, logos, and stitching EXACTLY from the source. Do not invent a brand, size, or care line.',
    CLEAN_PRESENTATION,
    'No extra props, no text overlay, no watermark.',
    changeNote
      ? `OPERATOR CHANGE REQUEST (apply this, but NEVER change garment identity, never leave the white background): ${changeNote}`
      : '',
    'Output one image only.',
  ]
    .filter(Boolean)
    .join(' ')
}

const MALE_LOOKS = [
  'CAST LOCK: young East Asian man, short neat black hair, no cap, no sunglasses, no facial hair.',
  'CAST LOCK: young man with dark wavy medium-length hair, no hat, no sunglasses, light stubble optional.',
  'CAST LOCK: young man with curly medium-length brown hair, no hat, no sunglasses.',
  'CAST LOCK: young Black man, short textured hair, no hat, no sunglasses.',
  'CAST LOCK: young man, fair skin, buzz cut, small silver hoop earrings, no hat.',
  'CAST LOCK: young Latino man, messy dark brown hair, no hat, no sunglasses.',
]

const FEMALE_LOOKS = [
  'CAST LOCK: young East Asian woman, straight dark hair, no hat.',
  'CAST LOCK: young woman with dark wavy hair, no hat.',
  'CAST LOCK: young Black woman, short natural hair or sleek bun, no hat.',
  'CAST LOCK: young Latina woman, long dark hair, no hat.',
  'CAST LOCK: young woman, fair skin, cropped hair, small hoop earrings, no hat.',
  'CAST LOCK: young woman, curly brown hair, no hat.',
]

export function castLookIndex(productId: string, gender: 'male' | 'female'): number {
  let h = 0
  const s = `${productId}:${gender}`
  for (let i = 0; i < s.length; i++) h = Math.imul(h, 31) + s.charCodeAt(i)
  return Math.abs(h)
}

export function modelLook(gender: 'male' | 'female', lookIndex: number): string {
  const list = gender === 'female' ? FEMALE_LOOKS : MALE_LOOKS
  const i = ((lookIndex % list.length) + list.length) % list.length
  return list[i]
}

const COLORIMETRY = [
  'COLORIMETRY (reason before dressing): read the hero garment’s exact hue, saturation, value, and undertone from the GARMENT SOURCE (cool black vs warm black, heather grey vs true grey, gold vs mustard, etc.).',
  'Build a streetwear palette around that piece: monochrome or analogous. Supporting clothes must sit in the same temperature and let the hero’s chroma win.',
  'Loud graphic / bright print / gold-red type: mute everything else to black, faded black, or charcoal so the print is the only saturated object.',
  'Black or dark hero: stay in black / graphite / dirty off-white. No khaki, no navy suit contrast, no random blue jeans unless the hero is indigo.',
  'Heather grey hero: charcoal or black bottoms, not brown, not pastel.',
  'Earth, camo, olive, brown: stone, olive, bone, faded black — no neon, no royal blue.',
  'Do not add a competing color-block. No preppy pastels. No office neutrals that fight the piece.',
].join(' ')

const STREETWEAR_BASE = [
  'STREETWEAR STYLING: this is a street lookbook, not luxury evening, not Zara smart-casual, not gym compression, not skinny-fit 2010s.',
  'Reference attitude: Supreme / Stüssy / Palace / Yeezy / Our Legacy Work Wear — baggy or relaxed volume, heavyweight fabrics, undone but steamed-clean.',
  'Supporting pieces are UNBRANDED: no extra logos, no fake Supreme, no Nike swoosh unless it is on the source garment.',
  'Forbidden on the supporting outfit: skinny jeans, chinos, dress shoes, loafers, suit belt with shiny buckle, tucked-tight mall fit, extra jackets, hats (unless the source garment is a hat), busy chains that steal the frame.',
  'If shoes are in frame: chunky sneakers or worn-in skate/runner, tonal with the palette. If cropped above the knee, skip inventing loud shoes.',
].join(' ')

function streetOutfit(family: GarmentFamily): string {
  switch (family) {
    case 'tee':
      return 'OUTFIT FOR THIS TEE: the uploaded tee is the hero, worn relaxed/slightly oversized, not skinny, not French-tuck. Pair with baggy or wide-leg washed black/charcoal denim, or long black shorts with a visible drawstring. Street volume on the legs so the look is skate/street, not slim trousers.'
    case 'hoodie':
      return 'OUTFIT FOR THIS HOODIE: oversized street hoodie as worn in a Supreme lookbook. Pair with baggy shorts or wide sweatpants in a mute tone sampled from the hoodie. Drawstrings OK. No skinny joggers.'
    case 'outerwear':
      return 'OUTFIT FOR THIS JACKET/VEST: the uploaded outerwear is the hero. Under it, a plain heavyweight unbranded tee (no print). Legs: baggy denim or cargo in a mute tone from the jacket. Do not add a second coat, scarf, or hat.'
    case 'pants':
      return 'OUTFIT FOR THESE PANTS: the uploaded pants are the hero — keep their full street silhouette (baggy/wide if that is the cut). Top: boxy unbranded tee or plain hoodie in a color sampled from the pants (usually black, off-white, or matching grey). Sneakers if full-length.'
    case 'dress':
      return 'OUTFIT FOR THIS DRESS: street, not evening. Sneakers or boots if feet show. No heels, no clutch, no jewelry that competes with the print.'
    case 'accessory':
      return 'OUTFIT FOR THIS ACCESSORY: simple street layers (unbranded tee, baggy pants) so the accessory reads. No competing logos.'
    default:
      return 'OUTFIT: complete as contemporary streetwear. Supporting pieces muted and unbranded. Hero garment largest in the read.'
  }
}

export function modelPrompt(
  garmentDescription: string,
  gender: 'male' | 'female',
  pose: string,
  look: string,
  family: GarmentFamily,
  changeNote?: string,
  _cleanWear = true
): string {
  const body =
    gender === 'female'
      ? 'The wearer is a REAL young adult woman (early 20s): slim, lean, high-fashion model body — thin, long lines, not curvy-plus, not muscular gym body.'
      : 'The wearer is a REAL young adult man (early 20s): slim, lean, high-fashion model body — thin, tall, not bulky, not bodybuilder, not “chad gym” muscle.'

  return [
    'Create a single vertical 4:5 photorealistic streetwear e-commerce photograph of THIS exact garment worn on one person.',
    PURE_WHITE_BG,
    body,
    look,
    'IDENTITY RULE: this is a LOOKBOOK SET. The SAME person wears the garment in every shot of this product. Same face, hair, skin, age, ears, jewelry, and body. Only pose and camera change.',
    'If an IDENTITY REFERENCE photo is attached, that person is the cast: copy them exactly. Do not invent a new model.',
    COLORIMETRY,
    STREETWEAR_BASE,
    streetOutfit(family),
    pose,
    'THE GARMENT IS THE HERO. It must occupy attention: large in frame, sharp, centered. The person is a hanger for the clothes, not a character study.',
    'Calm expression. Real photography, not CGI, not plastic AI face.',
    `Garment identity to keep: ${garmentDescription}`,
    'The garment MUST be the uploaded item: exact color, cut, prints, logos, and hardware — brand-new, steamed, perfectly worn.',
    CLEAN_PRESENTATION,
    'On the body the garment sits correctly: no bunching, no messy collar, no wrinkled torso. Street drape, not a stiff mannequin.',
    'Do not invent logos, graphics, or brand marks. Do not replace the garment with a different item.',
    changeNote
      ? `OPERATOR CHANGE REQUEST (apply this, but NEVER change garment identity, never leave the white background, keep the model young and slim, keep streetwear styling): ${changeNote}`
      : '',
    'One person only. No text overlay, no watermark. Output one image only.',
  ]
    .filter(Boolean)
    .join(' ')
}
