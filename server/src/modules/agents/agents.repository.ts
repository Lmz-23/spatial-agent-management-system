import type { PrismaClient, Agent, Workspace, Task, AgentStatus } from '@prisma/client';
import type { CreateAgentDto, UpdateAgentDto } from './dto/create-agent.dto.js';

export type AgentWithRelations = Agent & {
  workspace: Workspace;
  currentTask: Task | null;
};

export type AgentBasic = Pick<Agent, 'id' | 'name' | 'color' | 'status' | 'positionX' | 'positionY' | 'workspaceId' | 'currentTaskId'>;

export class AgentsRepository {
  /**
   * Mock data for development without database connection.
   * These are simplified in-memory implementations.
   * DO NOT use in production.
   */
  private readonly mockWorkspace: Workspace = {
    id: 'mock-workspace',
    name: 'Demo Workspace',
    projectName: 'Demo Project',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Mock data for development without database connection.
   * These are simplified in-memory implementations.
   * DO NOT use in production.
   */
  private readonly mockAgents: AgentWithRelations[] = [
    {
      id: 'mock-1',
      name: 'Agent Alice',
      color: '#FF5733',
      status: 'IDLE' as AgentStatus,
      positionX: 100,
      positionY: 200,
      workspaceId: 'mock-workspace',
      currentTaskId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: this.mockWorkspace,
      currentTask: null,
    },
    {
      id: 'mock-2',
      name: 'Agent Bob',
      color: '#33FF57',
      status: 'WORKING' as AgentStatus,
      positionX: 300,
      positionY: 150,
      workspaceId: 'mock-workspace',
      currentTaskId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: this.mockWorkspace,
      currentTask: null,
    },
    {
      id: 'mock-3',
      name: 'Agent Charlie',
      color: '#3357FF',
      status: 'IDLE' as AgentStatus,
      positionX: 500,
      positionY: 300,
      workspaceId: 'mock-workspace',
      currentTaskId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: this.mockWorkspace,
      currentTask: null,
    },
  ];

  constructor(private readonly prisma: PrismaClient | null) {}

  async findAll(): Promise<AgentWithRelations[]> {
    if (!this.prisma) {
      return this.mockAgents;
    }
    return this.prisma.agent.findMany({
      include: {
        workspace: true,
        currentTask: true,
      },
    });
  }

  async findAllBasic(): Promise<AgentBasic[]> {
    if (!this.prisma) {
      return this.mockAgents;
    }
    return this.prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        status: true,
        positionX: true,
        positionY: true,
        workspaceId: true,
        currentTaskId: true,
      },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<AgentWithRelations[]> {
    if (!this.prisma) {
      return this.mockAgents.filter(a => a.workspaceId === workspaceId);
    }
    return this.prisma.agent.findMany({
      where: { workspaceId },
      include: {
        workspace: true,
        currentTask: true,
      },
    });
  }

  async findAllByWorkspaceBasic(workspaceId: string): Promise<AgentBasic[]> {
    if (!this.prisma) {
      return this.mockAgents.filter(a => a.workspaceId === workspaceId);
    }
    return this.prisma.agent.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        color: true,
        status: true,
        positionX: true,
        positionY: true,
        workspaceId: true,
        currentTaskId: true,
      },
    });
  }

  async findById(id: string): Promise<AgentWithRelations | null> {
    if (!this.prisma) {
      return this.mockAgents.find(a => a.id === id) || null;
    }
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
    if (!this.prisma) {
      const newAgent: AgentWithRelations = {
        id: crypto.randomUUID(),
        name: data.name,
        color: data.color ?? '#CCCCCC',
        status: 'IDLE' as AgentStatus,
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        workspaceId: data.workspaceId,
        currentTaskId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        workspace: this.mockWorkspace,
        currentTask: null,
      };
      return newAgent;
    }
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
    if (!this.prisma) {
      const agent = this.mockAgents.find(a => a.id === id);
      if (!agent) return null;
      return { ...agent, ...data, updatedAt: new Date() };
    }
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
    if (!this.prisma) {
      const agent = this.mockAgents.find(a => a.id === id);
      if (!agent) return null;
      return { ...agent, status, updatedAt: new Date() };
    }
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
    if (!this.prisma) {
      const agent = this.mockAgents.find(a => a.id === id);
      if (!agent) return null;
      return { ...agent, positionX, positionY, updatedAt: new Date() };
    }
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
    if (!this.prisma) {
      return true;
    }
    try {
      await this.prisma.agent.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
