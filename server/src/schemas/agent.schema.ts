import { z } from 'zod';

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  workspaceId: z.string().uuid(),
  positionX: z.number().int().min(0).optional(),
  positionY: z.number().int().min(0).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  status: z.enum(['IDLE', 'WALKING', 'WORKING']).optional(),
  positionX: z.number().int().min(0).optional(),
  positionY: z.number().int().min(0).optional(),
  currentTaskId: z.string().uuid().nullable().optional(),
});

export const agentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const agentWithWorkspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const updateAgentStatusSchema = z.object({
  status: z.enum(['IDLE', 'WALKING', 'WORKING']),
});

export const updateAgentPositionSchema = z.object({
  positionX: z.number().int().min(0),
  positionY: z.number().int().min(0),
});
