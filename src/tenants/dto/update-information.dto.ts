import { createZodDto } from '@anatine/zod-nestjs';
import { UpdateTenantInformationSchemaZod } from '../validations/update-information-tenant.zod';

export class UpdateTenantInformationSchemaDto extends createZodDto(
  UpdateTenantInformationSchemaZod,
) {}
