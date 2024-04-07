import {
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Product } from '../../products/schemas/product.schema';
import { Type } from 'class-transformer';

export class CreateMemberDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsDateString()
  @MinLength(1)
  dateOfBirth: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsEmail()
  @MinLength(1)
  email: string;

  @IsString()
  @MinLength(1)
  dni: string;

  @IsString()
  @MinLength(1)
  jobPosition: string;

  @IsString()
  @MinLength(1)
  country: string;

  @IsString()
  @MinLength(1)
  city: string;

  @IsString()
  @MinLength(1)
  zipCode: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsString()
  appartment?: string;

  @IsDateString()
  @MinLength(1)
  joiningDate: string;

  @IsString()
  @MinLength(1)
  timeSlotForDelivery: string;

  @IsString()
  additionalInfo?: string;

  @IsArray()
  teams: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Product)
  products?: Product[];
}
