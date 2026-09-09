/**
 * Fuente única del modelo de prenda de segunda mano.
 *
 * El mapa tipo → medidas lo consumen tres lugares que deben coincidir siempre:
 *   - ProductForm      (qué campos mostrar y exigir)
 *   - products/actions (validación en servidor)
 *   - ProductContent   (qué medidas renderizar en la ficha)
 *
 * Espejo de las constraints de supabase/migrations/0010_business_fields.sql.
 * Si cambias este archivo, cambia también la migración.
 */

export const GARMENT_TYPES = [
  'playera',
  'hoodie',
  'sudadera',
  'chamarra',
  'pants',
  'jeans',
  'shorts',
  'otro',
] as const;

export type GarmentType = (typeof GARMENT_TYPES)[number];

export const MEASUREMENT_KEYS = [
  'chest_cm',
  'length_cm',
  'sleeve_cm',
  'waist_cm',
  'rise_cm',
  'inseam_cm',
] as const;

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

/** Qué medidas aplican a cada tipo. 'otro' no exige ninguna. */
export const MEASUREMENTS_BY_TYPE: Record<GarmentType, readonly MeasurementKey[]> = {
  playera:  ['chest_cm', 'length_cm'],
  hoodie:   ['chest_cm', 'length_cm'],
  sudadera: ['chest_cm', 'length_cm'],
  chamarra: ['chest_cm', 'length_cm', 'sleeve_cm'],
  pants:    ['waist_cm', 'rise_cm', 'inseam_cm'],
  jeans:    ['waist_cm', 'rise_cm', 'inseam_cm'],
  shorts:   ['waist_cm', 'rise_cm', 'length_cm'],
  otro:     [],
};

export const CONDITIONS = ['impecable', 'buen_estado', 'con_detalles'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const OWNERS = ['uzziel', 'mario'] as const;
export type Owner = (typeof OWNERS)[number];

/** Rango aceptado por las constraints de la migración. */
export const MEASUREMENT_MIN_CM = 20;
export const MEASUREMENT_MAX_CM = 200;

// ─── Etiquetas ────────────────────────────────────────────────────────────────

export const GARMENT_TYPE_LABELS: Record<GarmentType, string> = {
  playera:  'Playera',
  hoodie:   'Hoodie',
  sudadera: 'Sudadera',
  chamarra: 'Chamarra',
  pants:    'Pants',
  jeans:    'Jeans',
  shorts:   'Shorts',
  otro:     'Otro',
};

/** Etiqueta corta para la ficha pública: "Pecho 58 cm · Largo 74 cm". */
export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  chest_cm:  'Pecho',
  length_cm: 'Largo',
  sleeve_cm: 'Manga',
  waist_cm:  'Cintura',
  rise_cm:   'Tiro',
  inseam_cm: 'Entrepierna',
};

export const MEASUREMENT_LABELS_EN: Record<MeasurementKey, string> = {
  chest_cm:  'Chest',
  length_cm: 'Length',
  sleeve_cm: 'Sleeve',
  waist_cm:  'Waist',
  rise_cm:   'Rise',
  inseam_cm: 'Inseam',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  impecable:     'Impecable',
  buen_estado:   'Buen estado',
  con_detalles:  'Con detalles',
};

export const CONDITION_LABELS_EN: Record<Condition, string> = {
  impecable:    'Pristine',
  buen_estado:  'Good condition',
  con_detalles: 'With flaws',
};

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isGarmentType(v: unknown): v is GarmentType {
  return typeof v === 'string' && (GARMENT_TYPES as readonly string[]).includes(v);
}

export function isCondition(v: unknown): v is Condition {
  return typeof v === 'string' && (CONDITIONS as readonly string[]).includes(v);
}

export function isOwner(v: unknown): v is Owner {
  return typeof v === 'string' && (OWNERS as readonly string[]).includes(v);
}

/** Medidas exigidas para un tipo. Vacío si el tipo es desconocido u 'otro'. */
export function requiredMeasurements(type: string | null | undefined): readonly MeasurementKey[] {
  return isGarmentType(type) ? MEASUREMENTS_BY_TYPE[type] : [];
}

// ─── SKU ──────────────────────────────────────────────────────────────────────

const SKU_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I/O/0/1: se confunden al leer a mano

/**
 * SKU legible y único: VIO-HOO-K3M9Z
 * El prefijo del tipo permite reconocer la pieza en el inventario físico.
 * La unicidad real la garantiza el índice `products.sku unique` + reintento.
 */
export function generateSku(garmentType?: string | null): string {
  const prefix = isGarmentType(garmentType) ? garmentType.slice(0, 3).toUpperCase() : 'GEN';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += SKU_ALPHABET[Math.floor(Math.random() * SKU_ALPHABET.length)];
  }
  return `VIO-${prefix}-${suffix}`;
}
