import { TaskEventType, TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['BACKLOG', 'PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'NEEDS_REVISION', 'BLOCKED', 'DONE', 'CANCELLED']).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  workspaceId: z.string().uuid(),
  assignedAgentId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['BACKLOG', 'PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'NEEDS_REVISION', 'BLOCKED', 'DONE', 'CANCELLED']).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedAgentId: z.string().uuid().nullable().optional(),
});

export const createTaskEventSchema = z.object({
  agentId: z.string().uuid(),
  eventType: z.nativeEnum(TaskEventType),
  toStatus: z.nativeEnum(TaskStatus).optional(),
  notes: z.string().max(2000).optional(),
  returnedToAgentId: z.string().uuid().optional(),
});

export type CreateTaskEventDto = z.infer<typeof createTaskEventSchema>;

export const taskIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const taskWithAgentIdParamSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
});
