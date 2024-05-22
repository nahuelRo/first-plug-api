import { createZodDto } from '@anatine/zod-nestjs';
import { MemberSchemaZodArray } from '../validations/create-member.zod';

export class CreateMemberArrayDto extends createZodDto(MemberSchemaZodArray) {}
