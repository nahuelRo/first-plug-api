import { z } from 'zod';

export const ChangePasswordSchemaZod = z.object({
  oldPassword: z.string().min(1).trim(),
  newPassword: z.string().min(1).trim(),
});
