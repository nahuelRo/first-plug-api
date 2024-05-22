import { createZodDto } from '@anatine/zod-nestjs';
import { MemberSchemaZod } from '../validations/create-member.zod';

export class UpdateMemberDto extends createZodDto(MemberSchemaZod.partial()) {}
