// Workspace related types

import type { Position } from './agent.types.js';

// Re-export Position so it can be used standalone
export type { Position };

export interface IDesk {
  id: string;
  officeId: string;
  name: string;
  position: Position;
  size: { width: number; height: number };
  isOccupied: boolean;
  agentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOffice {
  id: string;
  workspaceId: string;
  name: string;
  floor: number;
  width: number;
  height: number;
  desks: IDesk[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspace {
  id: string;
  name: string;
  description: string | null;
  width: number;
  height: number;
  offices: IOffice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  width: number;
  height: number;
}

export interface CreateOfficePayload {
  workspaceId: string;
  name: string;
  floor: number;
  width: number;
  height: number;
}

export interface CreateDeskPayload {
  officeId: string;
  name: string;
  position: Position;
  size: { width: number; height: number };
}

export interface WorkspaceUpdatePayload {
  workspaceId: string;
  name?: string;
  description?: string;
}
