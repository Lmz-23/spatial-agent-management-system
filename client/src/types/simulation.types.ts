export interface Agent {
  id: string;
  name: string;
  color: string;
  status: 'IDLE' | 'WALKING' | 'WORKING';
  positionX: number;
  positionY: number;
  workspaceId: string;
}

export interface AgentPositionUpdate {
  agentId: string;
  positionX: number;
  positionY: number;
}

export interface AgentStatusUpdate {
  agentId: string;
  status: Agent['status'];
}

export type WSEventType =
  | 'agent:position:update'
  | 'agent:status:update'
  | 'agent:created'
  | 'agent:deleted';

export interface WSMessage {
  type: WSEventType;
  payload: unknown;
}
