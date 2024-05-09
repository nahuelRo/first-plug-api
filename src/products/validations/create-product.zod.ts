import { z } from 'zod';
import {
  validateAttributeValues,
  validateCategoryKeys,
} from '../helpers/validation.helper';

import {
  CATEGORIES,
  CATEGORY_KEYS,
  ATTRIBUTES,
  STATES,
} from '../interfaces/product.interface';

// TODO: refine works but we have to find a better way to handle the cause of the error and the error message so as not to repeat the same function twice
export const ProductSchemaZod = z
  .object({
    name: z.string().min(1),
    category: z.enum(CATEGORIES),
    attributes: z
      .array(
        z.object({
          key: z.enum(ATTRIBUTES),
          value: z.string(),
        }),
      )
      .refine(
        (attrs) => {
          const keys = attrs.map((attr) => attr.key);
          return new Set(keys).size === keys.length;
        },
        {
          message: 'Attribute keys must be unique.',
        },
      ),
    serialNumber: z.string().optional(),
    recoverable: z.boolean(),
    assignedEmail: z.string().optional(),
    acquisitionDate: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(STATES),
  })
  .refine(
    (data) => {
      const category = data.category;
      const attributes = data.attributes;
      const categoryKeys = CATEGORY_KEYS[category];
      const presentKeys = attributes.map((attr) => attr.key);
      return categoryKeys.every((key) => presentKeys.includes(key));
    },
    (val) => {
      const category = val.category;
      const attributes = val.attributes;
      const categoryKeys = CATEGORY_KEYS[category];
      const presentKeys = attributes.map((attr) => attr.key);
      const missingKeys = categoryKeys.filter(
        (key) => !presentKeys.includes(key),
      );
      return {
        message: `are missing required keys for the selected category. (${missingKeys.join(',')})`,
        path: ['attributes'],
      };
    },
  )
  .refine(
    (data) => {
      const errors = validateCategoryKeys(data.attributes, data.category);
      return !errors;
    },
    (val) => {
      const errorMessages = validateCategoryKeys(val.attributes, val.category);
      return errorMessages!;
    },
  )
  .refine(
    (data) => {
      const errors = validateAttributeValues(data.attributes, data.category);
      return Object.keys(errors).length < 1;
    },
    (val) => {
      const errorMessages = validateAttributeValues(
        val.attributes,
        val.category,
      );

      return {
        message: `${errorMessages[0].message}`,
        path: [`${errorMessages[0].path}`],
      };
    },
  );

export const ProductSchemaZodArray = z.array(ProductSchemaZod);
