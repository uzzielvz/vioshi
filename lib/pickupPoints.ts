import { PickupPoint } from '@/types/delivery';

export const PICKUP_POINTS: PickupPoint[] = [
  // Flagship Stores (Free)
  {
    id: 'flagship-cdmx',
    name: 'VIOGI Flagship - Ciudad de México',
    address: 'Av. Reforma 222, Colonia Juárez',
    city: 'Ciudad de México',
    state: 'CDMX',
    additionalCost: 0,
    availableHours: 'Lun-Dom 11:00-20:00',
    estimatedDays: 'Disponible en 2-3 días',
    type: 'flagship',
  },
  {
    id: 'flagship-gdl',
    name: 'VIOGI Flagship - Guadalajara',
    address: 'Av. Chapultepec 342, Americana',
    city: 'Guadalajara',
    state: 'Jalisco',
    additionalCost: 0,
    availableHours: 'Lun-Dom 11:00-20:00',
    estimatedDays: 'Disponible en 2-3 días',
    type: 'flagship',
  },

  // Retail Stores ($50)
  {
    id: 'retail-mty',
    name: 'VIOGI Store - Monterrey',
    address: 'Av. Constitución 2000, Centro',
    city: 'Monterrey',
    state: 'Nuevo León',
    additionalCost: 50,
    availableHours: 'Lun-Sáb 10:00-19:00',
    estimatedDays: 'Disponible en 3-5 días',
    type: 'retail',
  },
  {
    id: 'retail-qro',
    name: 'VIOGI Store - Querétaro',
    address: 'Blvd. Bernardo Quintana 101, Centro Sur',
    city: 'Querétaro',
    state: 'Querétaro',
    additionalCost: 50,
    availableHours: 'Lun-Sáb 10:00-19:00',
    estimatedDays: 'Disponible en 3-5 días',
    type: 'retail',
  },

  // Partner Locations (Variable cost)
  {
    id: 'partner-puebla',
    name: 'Urban Collective - Puebla',
    address: 'Av. Juárez 2510, La Paz',
    city: 'Puebla',
    state: 'Puebla',
    additionalCost: 25,
    availableHours: 'Lun-Vie 12:00-20:00, Sáb 11:00-18:00',
    estimatedDays: 'Disponible en 4-6 días',
    type: 'partner',
  },
  {
    id: 'partner-tijuana',
    name: 'Street Corner - Tijuana',
    address: 'Av. Revolución 1045, Zona Centro',
    city: 'Tijuana',
    state: 'Baja California',
    additionalCost: 75,
    availableHours: 'Mar-Dom 13:00-21:00',
    estimatedDays: 'Disponible en 5-7 días',
    type: 'partner',
  },
  {
    id: 'partner-cancun',
    name: 'Beach Culture - Cancún',
    address: 'Av. Tulum 260, SM 7',
    city: 'Cancún',
    state: 'Quintana Roo',
    additionalCost: 60,
    availableHours: 'Lun-Dom 10:00-22:00',
    estimatedDays: 'Disponible en 5-7 días',
    type: 'partner',
  },
  {
    id: 'partner-merida',
    name: 'Centro Urbano - Mérida',
    address: 'Calle 60 #350, Centro',
    city: 'Mérida',
    state: 'Yucatán',
    additionalCost: 40,
    availableHours: 'Lun-Sáb 11:00-19:00',
    estimatedDays: 'Disponible en 4-6 días',
    type: 'partner',
  },
];

// Helper functions
export function getPickupPointById(id: string): PickupPoint | undefined {
  return PICKUP_POINTS.find((point) => point.id === id);
}

export function getPickupPointsByState(state: string): PickupPoint[] {
  return PICKUP_POINTS.filter(
    (point) => point.state.toLowerCase() === state.toLowerCase()
  );
}

export function getPickupPointsByType(type: 'flagship' | 'retail' | 'partner'): PickupPoint[] {
  return PICKUP_POINTS.filter((point) => point.type === type);
}
