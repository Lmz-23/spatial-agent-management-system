// Task related types

export enum TaskStatus {
  BACKLOG = 'backlog',
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  TESTING = 'testing',
  NEEDS_REVISION = 'needs_revision',
  BLOCKED = 'blocked',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ITask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId: string | null;
  workspaceId: string;
  targetPosition: import('./agent.types.js').Position | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  workspaceId: string;
  targetPosition?: import('./agent.types.js').Position;
}

export interface AssignTaskPayload {
  taskId: string;
  agentId: string;
}

export interface UpdateTaskStatusPayload {
  taskId: string;
  status: TaskStatus;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId: string | null;
  workspaceId: string;
  targetPosition: import('./agent.types.js').Position | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
