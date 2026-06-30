// WebSocket message types

export type WSEventType =
  | 'AGENT_POSITION_UPDATE'
  | 'AGENT_STATUS_CHANGE'
  | 'AGENT_ASSIGNED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'WORKSPACE_UPDATED'
  | 'OFFICE_UPDATED'
  | 'DESK_UPDATED'
  | 'ERROR';

export interface WSMessage<T = unknown> {
  event: WSEventType;
  payload: T;
  timestamp: number;
  requestId?: string;
}

export interface WSPayload {
  agentId?: string;
  taskId?: string;
  workspaceId?: string;
  officeId?: string;
  deskId?: string;
  data?: unknown;
}

export interface WSClientMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  requestId?: string;
}

export interface AgentPositionPayload {
  agentId: string;
  position: {
    x: number;
    y: number;
    floor?: number;
  };
  rotation: number;
}

export interface AgentStatusPayload {
  agentId: string;
  status: string;
  previousStatus: string;
}

export interface TaskPayload {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  assignedAgentId: string | null;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface SubscriptionRequest {
  workspaceId: string;
  officeId?: string;
}

export interface SubscriptionResponse {
  workspaceId: string;
  officeIds: string[];
  subscribedAt: number;
}
