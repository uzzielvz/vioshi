import { createAdminClient } from '@/lib/supabase/admin';
import { mapPickupPointRow, type PickupPointRow } from '@/lib/pickup';
import type { PickupPoint } from '@/types/delivery';

/**
 * Active pickup points for public pages (help, pickup points). Same query as
 * the checkout's getActivePickupPointsAction, which stays in its own file.
 */
export async function getActivePickupPoints(): Promise<PickupPoint[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select(
      'id, name, address, city, state, type, additional_cost_mxn, available_hours, available_days, estimated_days, is_active, municipality, whatsapp, maps_url, transfer_day, is_dropoff'
    )
    .eq('is_active', true)
    .order('municipality', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) {
    console.error('[pickup_points] load failed', error);
    return [];
  }
  return (data as PickupPointRow[]).map(mapPickupPointRow);
}
