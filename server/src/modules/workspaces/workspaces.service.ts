import type { WorkspacesRepository } from './workspaces.repository.js';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import type { WorkspaceResponseDto } from './dto/workspace-response.dto.js';

export class WorkspacesService {
  constructor(private readonly repository: WorkspacesRepository) {}

  async getAll(): Promise<WorkspaceResponseDto[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<WorkspaceResponseDto> {
    try {
      return await this.repository.findByIdOrThrow(id);
    } catch {
      throw new Error('Workspace not found');
    }
  }

  async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Name is required');
    }
    return this.repository.create({
      name: data.name.trim(),
      projectName: data.projectName?.trim(),
    });
  }

  async update(id: string, data: UpdateWorkspaceDto): Promise<WorkspaceResponseDto> {
    try {
      await this.repository.findByIdOrThrow(id);
    } catch {
      throw new Error('Workspace not found');
    }
    return this.repository.update(id, {
      name: data.name?.trim(),
      projectName: data.projectName?.trim(),
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.repository.findByIdOrThrow(id);
    } catch {
      throw new Error('Workspace not found');
    }
    await this.repository.delete(id);
  }
}
