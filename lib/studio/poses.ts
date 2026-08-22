export type GarmentFamily =
  | 'tee'
  | 'hoodie'
  | 'outerwear'
  | 'pants'
  | 'dress'
  | 'accessory'
  | 'other'

export type ShotView = 'front' | 'back'

const TEE =
  /\b(tee|t-shirt|tshirt|jersey|shirt|polo|tank|top|playera|camiseta)\b/i
const HOODIE =
  /\b(hoodie|sweatshirt|crewneck|jumper|pullover|sudadera)\b/i
const OUTER =
  /\b(jacket|coat|vest|gilet|parka|windbreaker|blazer|outerwear|chamarra|chamarras|chaleco)\b/i
const PANTS =
  /\b(pant|pants|jean|jeans|jogger|trouser|short|shorts|chino|track\s?pant|sweatpant|pantalon|pantalón)\b/i
const DRESS = /\b(dress|skirt|gown|vestido|falda)\b/i
const ACCESSORY =
  /\b(bag|tote|cap|hat|beanie|sneaker|shoe|belt|accessory|bolso|gorra)\b/i

export function inferGarmentFamily(description: string): GarmentFamily {
  const d = description.trim()
  if (PANTS.test(d)) return 'pants'
  if (DRESS.test(d)) return 'dress'
  if (OUTER.test(d)) return 'outerwear'
  if (HOODIE.test(d)) return 'hoodie'
  if (ACCESSORY.test(d)) return 'accessory'
  if (TEE.test(d)) return 'tee'
  return 'other'
}

/** Front/3-4 on-model poses. Back view is a separate job, not mixed in. */
const MODEL_POSES: Record<GarmentFamily, string[]> = {
  tee: [
    'POSE FRONT: camera at chest height, crop head-to-mid-thigh (American shot). Square to camera, arms relaxed at sides so the chest graphic/logo is fully visible and undistorted. Weight even. Looking at camera or slightly down.',
    'POSE FRONT: 3/4 turn (~20°). Graphic still fully readable. One hand lightly at the hem, never covering the print.',
    'POSE FRONT: slow walk toward camera, one foot forward, graphic still front-and-center and unwarped. Crop head-to-mid-thigh.',
  ],
  hoodie: [
    'POSE FRONT: hood DOWN, camera at chest height, crop head-to-mid-thigh. Hands in the kangaroo pocket (if it has one) or at sides so the chest graphic is fully visible.',
    'POSE FRONT: 3/4, one hand in the pocket, hood down, graphic readable, looking slightly down.',
    'POSE FRONT: hood UP, face still visible, garment fills the frame, cuffs and hem sharp.',
  ],
  outerwear: [
    'POSE FRONT: jacket closed as designed, hands in the side pockets, crop head-to-mid-thigh. Show collar, zip, and chest logo. Looking slightly down.',
    'POSE FRONT: 3/4, one hand in a pocket, show lapel/shoulder line and sleeve length.',
    'POSE FRONT: worn slightly open over a plain unmarked undershirt (no logos) so lining is visible without competing with THIS garment.',
  ],
  pants: [
    'POSE FRONT: full-length, camera at hip height, weight even, legs straight so the full silhouette, stripe, and thigh logo are readable. Waistband and hem both in frame.',
    'POSE FRONT: 3/4 full-length, one knee slightly bent so drape and side stripe show. Hands relaxed, not covering logos.',
    'POSE FRONT: mid-stride walk, full-length, fabric and stripe read in motion. Still on pure white.',
  ],
  dress: [
    'POSE FRONT: full-length, arms slightly away from the body so the silhouette is clean.',
    'POSE FRONT: 3/4 full-length, one step, show drape without hiding the print.',
  ],
  accessory: [
    'POSE FRONT: worn naturally, crop tight on the piece (not a full-body portrait). The accessory is the largest object in frame.',
    'POSE FRONT: 3/4, still tight crop, show hardware and logo.',
  ],
  other: [
    'POSE FRONT: camera height matching the piece (chest for tops, hip for full looks). Arms relaxed, garment fully visible, crop so the piece fills the frame.',
    'POSE FRONT: 3/4 turn, details and side seam readable.',
  ],
}

const BACK_POSES: Record<GarmentFamily, string> = {
  tee: 'POSE BACK VIEW (mandatory): model turned ~180° away from camera. Head slightly turned so a sliver of profile/hair is visible. Arms relaxed at sides. Crop head-to-mid-thigh. THE BACK OF THE GARMENT IS THE HERO — any back print, graphic, or yoke from the GARMENT SOURCE (Reverso) must be fully visible, large, sharp, undistorted. If the source back is plain, keep it plain. Do not invent a back graphic.',
  hoodie:
    'POSE BACK VIEW (mandatory): model turned ~180° away, hood DOWN, head slightly in profile. Arms at sides. Crop head-to-mid-thigh. THE BACK GRAPHIC of the hoodie is the hero — copy it exactly from the Reverso source photo. Do not invent a back print.',
  outerwear:
    'POSE BACK VIEW (mandatory): model turned ~180° away, arms at sides, crop head-to-mid-thigh or full if long. Show back yoke, back logo, and hem exactly as in the Reverso source. Do not invent back graphics.',
  pants:
    'POSE BACK VIEW (mandatory): full-length from behind, camera at hip height. Show back pockets, waistband, stripe, and hem. Do not invent logos.',
  dress:
    'POSE BACK VIEW (mandatory): full-length from behind, arms relaxed. Show the true back of the dress from the Reverso source.',
  accessory:
    'POSE BACK / reverse of the accessory, still tight crop, hardware readable.',
  other:
    'POSE BACK VIEW (mandatory): model turned ~180° away, crop so the BACK of this garment fills the frame. Copy any back detail from the Reverso source. Do not invent prints.',
}

const CATALOG_POSES: Record<GarmentFamily, string[]> = {
  tee: [
    'CATALOG LAYOUT: flat-lay front, sleeves slightly out, chest graphic perfectly centered and undistorted.',
    'CATALOG LAYOUT: flat-lay back if the source has a back photo; otherwise keep front but slightly more 3D ghost volume in the torso.',
  ],
  hoodie: [
    'CATALOG LAYOUT: flat-lay or ghost, hood down, sleeves out, kangaroo pocket and hem visible, graphic centered.',
    'CATALOG LAYOUT: ghost with slight 3D volume in the hood and body, still pure white, graphic undistorted.',
  ],
  outerwear: [
    'CATALOG LAYOUT: ghost mannequin / filled silhouette, sleeves slightly out, zipper/buttons aligned, collar standing.',
    'CATALOG LAYOUT: same ghost, jacket slightly open only if it reveals lining that exists in the source photos.',
  ],
  pants: [
    'CATALOG LAYOUT: flat-lay both legs, waistband at top, hems even, side stripe and thigh logo readable, slight 3D at the waist.',
    'CATALOG LAYOUT: ghost/filled so the pants hold a worn shape, not a crumpled pile.',
  ],
  dress: [
    'CATALOG LAYOUT: ghost mannequin, full silhouette, hem even, print undistorted.',
  ],
  accessory: [
    'CATALOG LAYOUT: isolated on white, 3/4 or front, hardware sharp, large in frame.',
  ],
  other: [
    'CATALOG LAYOUT: centered flat-lay or ghost, garment large in frame, fully visible.',
  ],
}

export function poseInstruction(
  kind: 'catalog' | 'model',
  family: GarmentFamily,
  poseIndex: number,
  view: ShotView = 'front'
): string {
  if (kind === 'model' && view === 'back') {
    return BACK_POSES[family]
  }
  const list = kind === 'catalog' ? CATALOG_POSES[family] : MODEL_POSES[family]
  const i = ((poseIndex % list.length) + list.length) % list.length
  return list[i]
}

export function poseCount(kind: 'catalog' | 'model', family: GarmentFamily): number {
  const list = kind === 'catalog' ? CATALOG_POSES[family] : MODEL_POSES[family]
  return list.length
}
