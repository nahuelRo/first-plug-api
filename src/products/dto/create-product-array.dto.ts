import { createZodDto } from '@anatine/zod-nestjs';
import { ProductSchemaZodArray } from '../validations/create-product.zod';

export class CreateProductArrayDto extends createZodDto(
  ProductSchemaZodArray,
) {}
