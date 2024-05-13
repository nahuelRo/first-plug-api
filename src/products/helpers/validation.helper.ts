import {
  AttributeKey,
  Category,
  CATEGORY_KEYS,
  ValidationError,
} from '../interfaces/product.interface';
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
} from '../interfaces/attributes.interface';

export function validateCategoryKeys(
  attributes: Array<{ key: AttributeKey }>,
  category: string,
): ValidationError | undefined {
  const keysForCategory = CATEGORY_KEYS[category];

  const attributeKeys = attributes.map((attr) => attr.key);
  const invalidKeys = attributeKeys.filter(
    (key) => !keysForCategory.includes(key),
  );

  if (invalidKeys.length > 0) {
    return {
      message: `Invalid key for the specified category: ${invalidKeys.join(', ')}`,
      path: ['attributes'],
    };
  }
}

// TODO: It works but you have to refactor
export function validateAttributeValues(
  attributes: Array<{ key: AttributeKey; value: string }>,
  category?: Category,
): Array<ValidationError> {
  const errors: Array<ValidationError> = [];

  for (const attr of attributes) {
    switch (attr.key) {
      case 'color':
        const colorsArray = [...COLORS] as string[];
        if (!colorsArray.includes(attr.value)) {
          errors.push({
            message: `Invalid color: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'screen':
        const screenArray = [...SCREENS] as string[];
        if (!screenArray.includes(attr.value)) {
          errors.push({
            message: `Invalid screen size: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'processor':
        const processorArray = [...PROCESSORS] as string[];
        if (!processorArray.includes(attr.value)) {
          errors.push({
            message: `Invalid processor: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'ram':
        const ramArray = [...RAMS] as string[];
        if (!ramArray.includes(attr.value)) {
          errors.push({
            message: `Invalid ram: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'gpu':
        const gpuArray = [...GPUS] as string[];
        if (!gpuArray.includes(attr.value)) {
          errors.push({
            message: `Invalid gpu: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'storage':
        const storageArray = [...STORAGE] as string[];
        if (!storageArray.includes(attr.value)) {
          errors.push({
            message: `Invalid storage: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'keyboardLanguage':
        const keyboardsLenguagesArray = [...KEYBOARDLENGUAGES] as string[];
        if (!keyboardsLenguagesArray.includes(attr.value)) {
          errors.push({
            message: `Invalid keyboardLenguage: ${attr.value}`,
            path: ['attributes'],
          });
        }
        break;
      case 'brand':
        if (attr.key === 'brand' && category && category !== 'Other') {
          let allowedBrands: string[] = [];

          if (category === 'Computer') {
            allowedBrands = [...COMPUTER_BRANDS];
          } else if (category === 'Peripherals') {
            allowedBrands = [...PERIPHERALS_BRANDS];
          } else if (category === 'Audio') {
            allowedBrands = [...AUDIO_BRANDS];
          } else if (category === 'Monitor') {
            allowedBrands = [...MONITOR_BRANDS];
          }

          if (!allowedBrands.includes(attr.value)) {
            errors.push({
              message: `Invalid brand: ${attr.value}`,
              path: ['attributes'],
            });
          }
        }
        break;
      case 'model':
        if (attr.key === 'model' && category && category !== 'Other') {
          let allowedModels: string[] = [];

          if (category === 'Computer') {
            allowedModels = [...COMPUTER_MODELS];
          } else if (category === 'Peripherals') {
            allowedModels = [...PERIPHERALS_MODELS];
          } else if (category === 'Audio') {
            allowedModels = [...AUDIO_MODELS];
          } else if (category === 'Monitor') {
            allowedModels = [...MONITOR_MODELS];
          }

          if (!allowedModels.includes(attr.value)) {
            errors.push({
              message: `Invalid model: ${attr.value}`,
              path: ['attributes'],
            });
          }
        }
        break;
    }
  }

  return errors;
}
