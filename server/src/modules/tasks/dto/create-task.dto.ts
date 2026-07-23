import type { TaskStatus, TaskPriority } from '@prisma/client';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workspaceId: string;
  assignedAgentId?: string | null;
}
