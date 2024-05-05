import {
  AUDIO_BRANDS,
  AUDIO_MODELS,
  COLORS,
  COMPUTER_BRANDS,
  COMPUTER_MODELS,
  GPUS,
  KEYBOARDLENGUAGES,
  MONITOR_BRANDS,
  MONITOR_MODELS,
  PERIPHERALS_BRANDS,
  PERIPHERALS_MODELS,
  PROCESSORS,
  RAMS,
  SCREENS,
  STORAGE,
} from './attributes.interface';

export const STATES = ['Available', 'Delivered', 'Deprecated'] as const;

export const CATEGORIES = [
  'Merchandising',
  'Computer',
  'Monitor',
  'Audio',
  'Peripherals',
  'Other',
] as const;

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

export const CATEGORY_KEYS: Record<Category, readonly Key[]> = {
  Merchandising: ['color'],
  Computer: [
    'brand',
    'model',
    'color',
    'screen',
    'keyboardLenguage',
    'processor',
    'ram',
    'storage',
    'gpu',
  ],
  Monitor: ['brand', 'model', 'screen', 'color'],
  Audio: ['brand', 'model', 'color'],
  Peripherals: ['brand', 'model', 'color'],
  Other: ['brand'],
};

export type ValidationError = {
  message: string;
  path: string[];
};

export type Category = (typeof CATEGORIES)[number];

export type Status = (typeof STATES)[number];

export type Key = (typeof KEYS)[number];

export type Color = (typeof COLORS)[number];

export type Screen = (typeof SCREENS)[number];

export type KeyboardLenguage = (typeof KEYBOARDLENGUAGES)[number];

export type Proccessor = (typeof PROCESSORS)[number];

export type Ram = (typeof RAMS)[number];

export type Storage = (typeof STORAGE)[number];

export type GPU = (typeof GPUS)[number];

export type ComputerBrand = (typeof COMPUTER_BRANDS)[number];

export type PeripheralsBrand = (typeof PERIPHERALS_BRANDS)[number];

export type AudioBrand = (typeof AUDIO_BRANDS)[number];

export type MonitorBrand = (typeof MONITOR_BRANDS)[number];

export type ComputerModel = (typeof COMPUTER_MODELS)[number];

export type AudioModel = (typeof AUDIO_MODELS)[number];

export type MonitorModel = (typeof MONITOR_MODELS)[number];

export type PeripheralsModel = (typeof PERIPHERALS_MODELS)[number];
