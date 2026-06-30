import type { TaskStatus } from '@prisma/client';

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
