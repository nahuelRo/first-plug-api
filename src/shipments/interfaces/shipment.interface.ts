export const SHIPMENT_STATUS = [
  'Missing Data',
  'Delivered',
  'Preparing',
  'Available',
  'Shipped',
  'Complete',
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS)[number];

export const SHIPMENT_TYPE = ['Courrier', 'Internal'] as const;

export type ShipmentType = (typeof SHIPMENT_TYPE)[number];
