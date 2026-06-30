import type { PrismaClient, Agent, Workspace, Task } from '@prisma/client';
import type { CreateAgentDto, UpdateAgentDto } from './dto/create-agent.dto.js';

export type AgentWithRelations = Agent & {
  workspace: Workspace;
  currentTask: Task | null;
};

export class AgentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<AgentWithRelations[]> {
    return this.prisma.agent.findMany({
      include: {
        workspace: true,
        currentTask: true,
      },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<AgentWithRelations[]> {
    return this.prisma.agent.findMany({
      where: { workspaceId },
      include: {
        workspace: true,
        currentTask: true,
      },
    });
  }

  async findById(id: string): Promise<AgentWithRelations | null> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        workspace: true,
        currentTask: true,
      },
    });
    return agent as AgentWithRelations | null;
  }

  async create(data: CreateAgentDto): Promise<AgentWithRelations> {
    const agent = await this.prisma.agent.create({
      data: {
        name: data.name,
        color: data.color ?? '#CCCCCC',
        workspaceId: data.workspaceId,
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        status: 'IDLE',
      },
      include: {
        workspace: true,
        currentTask: true,
      },
    });
    return agent as AgentWithRelations;
  }

  async update(id: string, data: UpdateAgentDto): Promise<AgentWithRelations | null> {
    try {
      const agent = await this.prisma.agent.update({
        where: { id },
        data,
        include: {
          workspace: true,
          currentTask: true,
        },
      });
      return agent as AgentWithRelations;
    } catch {
      return null;
    }
  }

  async updateStatus(id: string, status: 'IDLE' | 'WALKING' | 'WORKING'): Promise<AgentWithRelations | null> {
    try {
      const agent = await this.prisma.agent.update({
        where: { id },
        data: { status },
        include: {
          workspace: true,
          currentTask: true,
        },
      });
      return agent as AgentWithRelations;
    } catch {
      return null;
    }
  }

  async updatePosition(id: string, positionX: number, positionY: number): Promise<AgentWithRelations | null> {
    try {
      const agent = await this.prisma.agent.update({
        where: { id },
        data: { positionX, positionY },
        include: {
          workspace: true,
          currentTask: true,
        },
      });
      return agent as AgentWithRelations;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.agent.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
