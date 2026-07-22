import type { TaskEventType, TaskStatus } from '@prisma/client';

export interface TaskEventResponseDto {
  id: string;
  taskId: string;
  agentId: string | null;
  eventType: TaskEventType;
  fromStatus: TaskStatus;
  toStatus: TaskStatus | null;
  notes: string | null;
  returnedToAgentId: string | null;
  timestamp: Date;
}
