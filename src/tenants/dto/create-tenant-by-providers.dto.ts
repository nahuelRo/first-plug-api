import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantByProvidersDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  @MinLength(1)
  email: string;

  @IsString()
  @IsOptional()
  image?: string;
}
