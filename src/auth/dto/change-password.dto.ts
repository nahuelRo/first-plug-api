import { createZodDto } from '@anatine/zod-nestjs';
import { ChangePasswordSchemaZod } from '../validations/change-password.zod';

export class ChangePasswordDto extends createZodDto(ChangePasswordSchemaZod) {}
