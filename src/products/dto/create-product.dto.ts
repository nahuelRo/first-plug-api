import { createZodDto } from '@anatine/zod-nestjs';
import { ProductSchemaZod } from '../validations/create-product.zod';

export class CreateProductDto extends createZodDto(ProductSchemaZod) {}
