import type { AgentStatus } from '@sams/shared';

export interface AgentEntity {
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
}

export function isAgent(obj: unknown): obj is AgentEntity {
  if (typeof obj !== 'object' || obj === null) return false;
  const agent = obj as Record<string, unknown>;
  return (
    typeof agent['id'] === 'string' &&
    typeof agent['name'] === 'string' &&
    typeof agent['status'] === 'string'
  );
}
