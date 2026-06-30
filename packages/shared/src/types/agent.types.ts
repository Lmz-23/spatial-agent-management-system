// Core types for the SAMS application

export interface Position {
  x: number;
  y: number;
  floor?: number;
}

export interface AgentState {
  position: Position;
  rotation: number;
  state: AgentStatus;
  lastUpdated: number;
}

export enum AgentStatus {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  BLOCKED = 'blocked',
  OFFLINE = 'offline',
}

export interface IAgent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  currentTaskId: string | null;
  workspaceId: string;
  officeId: string | null;
  deskId: string | null;
  position: Position;
  rotation: number;
  sprite: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentUpdatePayload {
  agentId: string;
  position: Position;
  rotation: number;
  status: AgentStatus;
}

export interface CreateAgentPayload {
  name: string;
  type: string;
  workspaceId: string;
  officeId?: string;
  deskId?: string;
  sprite?: string;
}

export interface AssignTaskPayload {
  taskId: string;
  agentId: string;
}
