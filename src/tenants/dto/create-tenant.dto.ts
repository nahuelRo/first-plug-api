import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsOptional()
  tenantName?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  @MinLength(1)
  email: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @MinLength(1)
  password: string;
}
