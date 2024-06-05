import { z } from 'zod';
import { ProductSchemaZod } from 'src/products/validations/create-product.zod';
import validator from 'validator';

export const MemberSchemaZod = z.object({
  firstName: z.string().min(1).trim(),
  lastName: z.string().min(1).trim(),
  email: z.string().email().trim().toLowerCase(),
  picture: z.string().optional(),
  position: z.string().trim().optional(),
  personalEmail: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().trim().refine(validator.isMobilePhone),
  city: z.string().trim().optional(),
  // Contry list
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
  additionalInfo: z.string().trim().optional(),
  startDate: z.string().trim().refine(validator.isISO8601).optional(),
  birthDate: z.string().trim().refine(validator.isISO8601).optional(),
  products: z.array(ProductSchemaZod).optional(),
  team: z.string().trim().optional(),
});

export const MemberSchemaZodArray = z.array(MemberSchemaZod);
