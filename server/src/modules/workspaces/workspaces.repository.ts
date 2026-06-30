import type { PrismaClient, Workspace } from '@prisma/client';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import type { WorkspaceResponseDto } from './dto/workspace-response.dto.js';

export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return workspaces.map(this.mapToResponse);
  }

  async findById(id: string): Promise<WorkspaceResponseDto | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });
    return workspace ? this.mapToResponse(workspace) : null;
  }

  async findByIdOrThrow(id: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    return this.mapToResponse(workspace);
  }

  async create(data: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
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
