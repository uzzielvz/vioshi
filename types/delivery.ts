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
