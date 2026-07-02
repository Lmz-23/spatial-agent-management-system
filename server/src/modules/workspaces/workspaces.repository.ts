import type { PrismaClient, Workspace } from '@prisma/client';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import type { WorkspaceResponseDto } from './dto/workspace-response.dto.js';

export class WorkspacesRepository {
  /**
   * Mock data for development without database connection.
   * These are simplified in-memory implementations.
   * DO NOT use in production.
   */
  private readonly mockWorkspaces: WorkspaceResponseDto[] = [
    {
      id: 'mock-workspace',
      name: 'Demo Workspace',
      projectName: 'Demo Project',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mock-workspace-2',
      name: 'Test Workspace',
      projectName: 'Test Project',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(private readonly prisma: PrismaClient | null) {}

  async findAll(): Promise<WorkspaceResponseDto[]> {
    if (!this.prisma) {
      return this.mockWorkspaces;
    }
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return workspaces.map(this.mapToResponse);
  }

  async findById(id: string): Promise<WorkspaceResponseDto | null> {
    if (!this.prisma) {
      return this.mockWorkspaces.find(w => w.id === id) || null;
    }
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });
    return workspace ? this.mapToResponse(workspace) : null;
  }

  async findByIdOrThrow(id: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    return workspace;
  }

  async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    if (!this.prisma) {
      const newWorkspace: WorkspaceResponseDto = {
        id: crypto.randomUUID(),
        name: data.name,
        projectName: data.projectName ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newWorkspace;
    }
    const workspace = await this.prisma.workspace.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        projectName: data.projectName ?? null,
      },
    });
    return this.mapToResponse(workspace);
  }

  async update(id: string, data: UpdateWorkspaceDto): Promise<WorkspaceResponseDto> {
    if (!this.prisma) {
      const workspace = this.mockWorkspaces.find(w => w.id === id);
      if (!workspace) {
        throw new Error('Workspace not found');
      }
      return {
        ...workspace,
        name: data.name ?? workspace.name,
        projectName: data.projectName ?? workspace.projectName,
        updatedAt: new Date(),
      };
    }
    const workspace = await this.prisma.workspace.update({
      where: { id },
      data: {
        name: data.name,
        projectName: data.projectName,
      },
    });
    return this.mapToResponse(workspace);
  }

  async delete(id: string): Promise<void> {
    if (!this.prisma) {
      return;
    }
    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  private mapToResponse(workspace: Workspace): WorkspaceResponseDto {
    return {
      id: workspace.id,
      name: workspace.name,
      projectName: workspace.projectName,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
