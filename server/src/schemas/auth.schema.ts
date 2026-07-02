import { z } from 'zod';

export const loginSchema = z.object({
  workspaceId: z.string().uuid(),
  password: z.string().min(1),
});
