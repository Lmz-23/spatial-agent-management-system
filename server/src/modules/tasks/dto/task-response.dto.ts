import type { TaskStatus } from '@prisma/client';

export interface AssignedAgentInfo {
  id: string;
  name: string;
  status: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedAgentId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  assignedAgent?: AssignedAgentInfo;
  workspace?: WorkspaceInfo;
}
