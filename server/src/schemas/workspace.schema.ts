import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  projectName: z.string().min(1).max(100).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const workspaceIdParamSchema = z.object({
  id: z.string().uuid(),
});
