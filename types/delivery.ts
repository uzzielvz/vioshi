export type DeliveryMethodType = 'home' | 'pickup';

export type PickupPointType = 'flagship' | 'retail' | 'partner';

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  additionalCost: number;
  availableHours: string;
  estimatedDays: string;
  type: PickupPointType;
  /** Municipio for checkout grouping */
  municipality: string;
  whatsapp?: string | null;
  mapsUrl?: string | null;
  /** 0=Sun … 6=Sat; null = no weekly transfer from hub */
  transferDay: number | null;
  /** Vendors may drop packages here (Rectoría only for now) */
  isDropoff: boolean;
}

export interface DeliveryData {
  deliveryMethod: DeliveryMethodType;

  // Home delivery fields
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  shippingMethod?: 'standard' | 'express';

  // Pickup fields
  pickupPointId?: string;
  pickupDate?: string;
  pickupTimeSlot?: 'morning' | 'afternoon' | 'evening' | '';

  // Common fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
