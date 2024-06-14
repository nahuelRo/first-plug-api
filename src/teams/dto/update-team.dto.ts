import { createZodDto } from '@anatine/zod-nestjs';
import { TeamSchemaZod } from '../validations/create-team.zod';

export class UpdateTeamDto extends createZodDto(TeamSchemaZod) {}
