import type { CreateWorkspaceDto } from '../dto/create-workspace.dto.js';
import type { UpdateWorkspaceDto } from '../dto/update-workspace.dto.js';
import type { WorkspaceResponseDto } from '../dto/workspace-response.dto.js';

export interface WorkspaceEntity {
  id: string;
  name: string;
  projectName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkspaceData {
  name: string;
  projectName?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  projectName?: string;
}

export { type CreateWorkspaceDto, UpdateWorkspaceDto, WorkspaceResponseDto };
