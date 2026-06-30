import type { ITask, Position } from '@sams/shared';
import { TaskStatus, TaskPriority } from '@sams/shared';

export interface TaskEntity extends ITask {}

export interface TaskWithAgent extends ITask {
  agent?: unknown;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  targetPosition?: Position | null;
  completedAt?: Date | null;
}

export interface TaskFilters {
  workspaceId?: string;
  agentId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
