export type GarmentFamily =
  | 'tee'
  | 'hoodie'
  | 'outerwear'
  | 'pants'
  | 'dress'
  | 'accessory'
  | 'other'

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

/** On-model poses that sell the piece (white-studio catalog, garment is hero). */
const MODEL_POSES: Record<GarmentFamily, string[]> = {
  tee: [
    'POSE to showcase the TOP: camera at chest height, crop head-to-mid-thigh (American shot). Square to camera, arms relaxed at sides so the chest graphic/logo is fully visible and undistorted. Weight even.',
    'POSE to showcase the TOP: 3/4 turn (~20°). Graphic still fully readable. One hand lightly at the hem, never covering the print.',
    'POSE to showcase the TOP: full back, arms relaxed, crop head-to-mid-thigh. Show any back print or yoke.',
    'POSE to showcase the TOP: slow walk toward camera, one foot forward, graphic still front-and-center and unwarped.',
  ],
  hoodie: [
    'POSE to showcase the HOODIE: front, hood DOWN, camera at chest height, crop head-to-mid-thigh. Hands at sides so the chest graphic is fully visible. Show rib cuff and hem.',
    'POSE to showcase the HOODIE: 3/4, one hand in the kangaroo pocket (if it has one), hood down, graphic readable.',
    'POSE to showcase the HOODIE: hood UP, face still visible, garment fills the frame, cuffs and hem sharp.',
    'POSE to showcase the HOODIE: full back, hood down, show any back graphic and hood volume.',
  ],
  outerwear: [
    'POSE to showcase the JACKET/VEST: front, closed as designed (zip/buttons done), arms at sides, crop head-to-hip or full if long. Show collar, zip, and chest logo.',
    'POSE to showcase the JACKET/VEST: 3/4, one hand in a pocket, show lapel/shoulder line and sleeve length.',
    'POSE to showcase the JACKET/VEST: worn slightly open over a plain unmarked undershirt (no logos) so lining or inner sherpa is visible without competing with THIS garment.',
    'POSE to showcase the JACKET/VEST: full back, arms relaxed, show back yoke/logo and hem.',
  ],
  pants: [
    'POSE to showcase the PANTS: full-length front, camera at hip height, weight even on both feet, legs straight so the full silhouette, stripe, and thigh logo are readable. Waistband and hem both in frame.',
    'POSE to showcase the PANTS: 3/4 full-length, one knee slightly bent so drape and side stripe show. Hands relaxed, not covering logos.',
    'POSE to showcase the PANTS: full-length back, show back pockets, waistband, and hem.',
    'POSE to showcase the PANTS: mid-stride walk, full-length, so the fabric and stripe read in motion. Still on pure white.',
  ],
  dress: [
    'POSE to showcase the DRESS: full-length front, arms slightly away from the body so the silhouette is clean.',
    'POSE to showcase the DRESS: 3/4 full-length, one step, show drape without hiding the print.',
    'POSE to showcase the DRESS: full back, arms relaxed.',
  ],
  accessory: [
    'POSE to showcase the ACCESSORY: worn naturally, crop tight on the piece (not a full-body portrait). The accessory is the largest object in frame.',
    'POSE to showcase the ACCESSORY: 3/4, still tight crop, show hardware and logo.',
  ],
  other: [
    'POSE to showcase THIS garment: front, camera height matching the piece (chest for tops, hip for full looks). Arms relaxed, garment fully visible, crop so the piece fills the frame.',
    'POSE to showcase THIS garment: 3/4 turn, details and side seam readable.',
    'POSE to showcase THIS garment: back view if the piece has a back, otherwise a tighter crop of the main graphic.',
  ],
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
  poseIndex: number
): string {
  const list = kind === 'catalog' ? CATALOG_POSES[family] : MODEL_POSES[family]
  const i = ((poseIndex % list.length) + list.length) % list.length
  return list[i]
}

export function poseCount(kind: 'catalog' | 'model', family: GarmentFamily): number {
  const list = kind === 'catalog' ? CATALOG_POSES[family] : MODEL_POSES[family]
  return list.length
}
