import type { AgentStatus } from '@prisma/client';
import type { Workspace, Task } from '@prisma/client';

export interface AgentResponseDto {
  id: string;
  name: string;
  color: string;
  status: AgentStatus;
  positionX: number;
  positionY: number;
  workspaceId: string;
  currentTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
  workspace?: Workspace;
  currentTask?: Task;
}
