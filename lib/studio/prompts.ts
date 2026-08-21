/**
 * Prompts cerrados de Studio.
 * Catálogo: flat-lay e-commerce inmaculado (ejemplos en studio-assets/catalog-refs).
 * No mezclar con visual-search.
 */

export const DESCRIBE_GARMENT_PROMPT = [
  'Describe this clothing item in one rich English sentence:',
  'garment type, color, silhouette, apparent material, visible logos/graphics, and hardware.',
  'Mention stains or wrinkles only as facts about the source photo, not as required in the output.',
  'No emojis. Max 60 words. Do not invent details that are not in the photos.',
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
    'Match the CATALOG STYLE REFERENCE photos: true flat-lay (or ghost/filled silhouette for jackets), centered, perfectly symmetrical.',
    'Light gray or pure white seamless studio background. Soft diffused drop shadow under/beside the garment for slight 3D lift.',
    'Even catalog lighting, no harsh glare, no lifestyle scene, no model, no hanger, no mannequin stand visible.',
    'Sleeves mirrored and slightly angled down when the garment has sleeves. Collar neat and centered. Hem even.',
    'Ignore any website UI, carousel arrows, or buttons if they appear in a style reference — copy photography only, never the garment in the references.',
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
          'The wearer is a REAL adult woman: photorealistic, striking, aesthetic, physically strong.',
          'Athletic / solid frame, confident posture, presence — not frail, not a generic catalog waif, not plastic beauty-filter face.',
        ].join(' ')
      : [
          'The wearer is a REAL adult man: photorealistic, striking, aesthetic, physically strong — “chad” presence.',
          'Solid athletic frame, strong jaw, confident posture — not scrawny, not cartoon bodybuilder, not plastic beauty-filter face.',
        ].join(' ')

  return [
    'Create a single vertical 4:5 photorealistic editorial photograph of THIS exact garment worn on one person.',
    person,
    'Look: alternative PUNK STREETWEAR. Underground, not preppy, not luxury gloss, not influencer smile-to-camera.',
    'Hair, attitude, and styling around the garment should read punk / alt / street: lived-in cool, sharp, a bit dangerous.',
    'Real skin texture, real pores, real photography. Looks like a film still or campaign shot, not AI, not CGI, not 3D render.',
    `Garment identity to keep: ${garmentDescription}`,
    'The garment MUST be the uploaded item: exact color, cut, prints, logos, and hardware — looking brand-new, steamed, and perfectly worn.',
    CLEAN_PRESENTATION,
    'On the body the garment sits correctly: no bunching, no messy collar, no wrinkled torso.',
    'Do not invent logos, graphics, or brand marks. Do not replace the garment with a different item.',
    'One person only. No text overlay, no watermark. Output one image only.',
  ].join(' ')
}
