export interface CreateAgentDto {
  name: string;
  color?: string;
  workspaceId: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateAgentDto {
  name?: string;
  color?: string;
}

export interface UpdatePositionDto {
  positionX: number;
  positionY: number;
}

export interface UpdateStatusDto {
  status: string;
}
