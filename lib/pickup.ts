import type { PickupPoint, PickupPointType } from '@/types/delivery';

const DAY_NAMES_ES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

export type PickupPointRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: string;
  additional_cost_mxn: number | string;
  available_hours: string | null;
  available_days: string | null;
  estimated_days: string | null;
  is_active: boolean;
  municipality: string | null;
  whatsapp: string | null;
  maps_url: string | null;
  transfer_day: number | null;
  is_dropoff: boolean;
};

/** Map a DB row to the storefront PickupPoint shape. */
export function mapPickupPointRow(row: PickupPointRow): PickupPoint {
  const transferDay =
    row.transfer_day === null || row.transfer_day === undefined
      ? null
      : Number(row.transfer_day);

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    additionalCost: Number(row.additional_cost_mxn) || 0,
    availableHours: row.available_hours ?? '',
    estimatedDays: row.estimated_days ?? '',
    type: (row.type as PickupPointType) || 'partner',
    municipality: row.municipality?.trim() || row.city,
    whatsapp: row.whatsapp,
    mapsUrl: row.maps_url,
    transferDay: Number.isFinite(transferDay as number) ? (transferDay as number) : null,
    isDropoff: Boolean(row.is_dropoff),
  };
}

/**
 * Next calendar date the package can be ready at the point.
 * - No transfer_day (hub / local): today.
 * - With transfer_day: next occurrence of that weekday; if today is that day, next week
 *   (order after the weekly run already left Rectoría).
 */
export function nextAvailableDate(
  transferDay: number | null,
  from: Date = new Date()
): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);

  if (transferDay === null || transferDay === undefined) {
    return d;
  }

  const today = d.getDay();
  let add = (transferDay - today + 7) % 7;
  if (add === 0) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

export function formatDateEs(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/** Customer-facing availability line for checkout. */
export function formatAvailabilityLabel(point: PickupPoint, from: Date = new Date()): string {
  if (point.transferDay === null || point.transferDay === undefined) {
    return point.estimatedDays || 'Disponible en el punto (sin traslado semanal)';
  }

  const dayName = DAY_NAMES_ES[point.transferDay] ?? 'el día de traslado';
  const next = nextAvailableDate(point.transferDay, from);
  return `Disponible a partir del ${formatDateEs(next)} (traslado los ${dayName}s)`;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Group active points by municipality for optgroups. */
export function groupPickupPointsByMunicipality(
  points: PickupPoint[]
): Array<[string, PickupPoint[]]> {
  const map = new Map<string, PickupPoint[]>();
  for (const p of points) {
    const key = p.municipality || p.city;
    const list = map.get(key);
    if (list) list.push(p);
    else map.set(key, [p]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
}
