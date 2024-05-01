export const STATES = ['Available', 'Delivered'] as const;

export const CATEGORIES = [
  'Merchandising',
  'Computer',
  'Monitor',
  'Audio',
  'Peripherals',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Status = (typeof STATES)[number];

export const KEYS = [
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

export type Key = (typeof KEYS)[number];
