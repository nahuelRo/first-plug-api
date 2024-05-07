export const CATEGORIES = [
  'Merchandising',
  'Computer',
  'Monitor',
  'Audio',
  'Peripherals',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATES = ['Available', 'Delivered'] as const;

export type Status = (typeof STATES)[number];

export const ATTRIBUTES = [
  'brand',
  'model',
  'color',
  'screen',
  'keyboardLenguage',
  'processor',
  'ram',
  'storage',
  'gpu',
] as const;

export type AttributeKey = (typeof ATTRIBUTES)[number];

export type Attribute = {
  key: AttributeKey;
  value: unknown;
};
