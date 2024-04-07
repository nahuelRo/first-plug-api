import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { PRODUCT_STATUSES } from '../interfaces/product.interface';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsString()
  color?: string;

  @IsString()
  screen?: string;

  @IsString()
  keyboard?: string;

  @IsString()
  processor?: string;

  @IsString()
  ram?: string;

  @IsString()
  storage?: string;

  @IsString()
  gpu?: string;

  @IsString()
  serialNumber?: string;

  @IsEnum(PRODUCT_STATUSES, {
    message: `status must be one of the following values: ${PRODUCT_STATUSES.join(', ')}`,
  })
  status: string;

  @IsOptional()
  @IsUrl()
  imgUrl?: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  stock: number;
}
