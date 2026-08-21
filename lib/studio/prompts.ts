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

export function catalogPrompt(garmentDescription: string, _cleanWear = true): string {
  return [
    'Create a single vertical 4:5 professional e-commerce CATALOG photograph of THIS exact garment only.',
    'True flat-lay (or ghost/filled silhouette for jackets), centered, perfectly symmetrical.',
    PURE_WHITE_BG,
    'Even catalog lighting, no harsh glare, no lifestyle scene, no model, no hanger, no mannequin stand visible.',
    'Sleeves mirrored and slightly angled down when the garment has sleeves. Collar neat and centered. Hem even.',
    'CATALOG STYLE REFERENCES teach layout and immaculate pressing ONLY. Ignore their background if it is not pure white. Never copy those garments.',
    'Ignore any website UI, carousel arrows, or buttons in a style reference.',
    `Garment identity to keep: ${garmentDescription}`,
    'Keep the exact colorway, cut, stitching, labels, prints, logos, and hardware from the GARMENT SOURCE photos.',
    CLEAN_PRESENTATION,
    'Do not invent logos, graphics, or brand marks that are not on the source garment.',
    'No extra props, no other clothing, no text overlay, no watermark.',
    'Output one image only.',
  ].join(' ')
}

export function modelPrompt(
  garmentDescription: string,
  gender: 'male' | 'female',
  _cleanWear = true
): string {
  const person =
    gender === 'female'
      ? [
          'The wearer is a REAL young adult woman (early 20s): slim, lean, high-fashion model body — thin, long lines, not curvy-plus, not muscular gym body.',
          'Youthful face, photorealistic skin. Looks like a Supreme / Yeezy / Dior / Dolce&Gabbana campaign model.',
        ].join(' ')
      : [
          'The wearer is a REAL young adult man (early 20s): slim, lean, high-fashion model body — thin, tall, not bulky, not bodybuilder, not “chad gym” muscle.',
          'Youthful face, photorealistic skin. Looks like a Supreme / Yeezy / Dior / Dolce&Gabbana campaign model.',
        ].join(' ')

  return [
    'Create a single vertical 4:5 photorealistic luxury-fashion e-commerce photograph of THIS exact garment worn on one person.',
    PURE_WHITE_BG,
    person,
    'Aesthetic: Supreme lookbook, Yeezy campaign, Dior Homme / Dior, Dolce & Gabbana — clean, expensive, minimal, editorial.',
    'THE GARMENT IS THE HERO. It must occupy attention: large in frame, sharp, centered. The person is a hanger for the clothes, not a character study.',
    'No busy styling that competes: no eye patch, no wallet chain dominating, no heavy costume, no extra jackets, no hats unless the source garment is a hat.',
    'Simple pose, full or 3/4 body, facing camera or slight 3/4. Calm expression, not grimacing, not acting in an alley.',
    'Real photography, not CGI, not plastic AI face.',
    `Garment identity to keep: ${garmentDescription}`,
    'The garment MUST be the uploaded item: exact color, cut, prints, logos, and hardware — brand-new, steamed, perfectly worn.',
    CLEAN_PRESENTATION,
    'On the body the garment sits correctly: no bunching, no messy collar, no wrinkled torso.',
    'Do not invent logos, graphics, or brand marks. Do not replace the garment with a different item.',
    'One person only. No text overlay, no watermark. Output one image only.',
  ].join(' ')
}
