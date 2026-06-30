import type { IAgent, Position, AgentStatus } from '@sams/shared';

export interface AgentEntity extends IAgent {}

export interface AgentWithRelations extends IAgent {
  workspace: unknown;
  office: unknown;
  desk: unknown;
}

export interface AgentPosition {
  x: number;
  y: number;
  floor?: number;
}

export interface AgentState {
  position: Position;
  rotation: number;
  status: AgentStatus;
  lastUpdated: number;
}

export interface AgentTaskAssignment {
  agentId: string;
  taskId: string;
  assignedAt: Date;
}
