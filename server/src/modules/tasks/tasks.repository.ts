import type {
  PrismaClient,
  Task,
  TaskEvent,
  Workspace,
  Agent,
  TaskStatus,
  TaskEventType,
  TaskPriority,
} from '@prisma/client';
import { AgentRole } from '@prisma/client';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';

export type TaskWithRelations = Task & {
  assignedAgent: Agent | null;
  workspace: Workspace;
};

export type TaskBasic = Pick<Task, 'id' | 'title' | 'description' | 'status' | 'workspaceId' | 'assignedAgentId' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type TaskEventWithRelations = TaskEvent & {
  agent: Agent | null;
  returnedToAgent: Agent | null;
};

export class TasksRepository {
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
  private readonly mockAgents: Agent[] = [
    {
      id: 'mock-1',
      name: 'Agent Alice',
      displayName: 'Agent Alice',
      opencodeName: 'agent-alice',
      color: '#FF5733',
      status: 'IDLE',
      positionX: 100,
      positionY: 200,
      workspaceId: 'mock-workspace',
      currentTaskId: null,
      role: AgentRole.ORCHESTRATOR,
      isParallelSafe: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mock-2',
      name: 'Agent Bob',
      displayName: 'Agent Bob',
      opencodeName: 'agent-bob',
      color: '#33FF57',
      status: 'WORKING',
      positionX: 300,
      positionY: 150,
      workspaceId: 'mock-workspace',
      currentTaskId: null,
      role: AgentRole.BACKEND_CODER,
      isParallelSafe: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  /**
   * Mock data for development without database connection.
   * These are simplified in-memory implementations.
   * DO NOT use in production.
   */
  private readonly mockTasks: TaskWithRelations[] = [
    {
      id: 'mock-task-1',
      title: 'Design System Setup',
      description: 'Set up the design system components',
      status: 'BACKLOG' as TaskStatus,
      priority: 'MEDIUM' as TaskPriority,
      workspaceId: 'mock-workspace',
      assignedAgentId: null,
      createdByAgentId: null,
      parentTaskId: null,
      priorityScore: 0,
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      assignedAgent: null,
      workspace: this.mockWorkspace,
    },
    {
      id: 'mock-task-2',
      title: 'API Integration',
      description: 'Integrate with external API services',
      status: 'IN_PROGRESS' as TaskStatus,
      priority: 'HIGH' as TaskPriority,
      workspaceId: 'mock-workspace',
      assignedAgentId: 'mock-1',
      createdByAgentId: null,
      parentTaskId: null,
      priorityScore: 0,
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      assignedAgent: this.mockAgents[0]!,
      workspace: this.mockWorkspace,
    },
    {
      id: 'mock-task-3',
      title: 'User Authentication',
      description: 'Implement user login and registration',
      status: 'BACKLOG' as TaskStatus,
      priority: 'LOW' as TaskPriority,
      workspaceId: 'mock-workspace',
      assignedAgentId: null,
      createdByAgentId: null,
      parentTaskId: null,
      priorityScore: 0,
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      assignedAgent: null,
      workspace: this.mockWorkspace,
    },
  ];

  constructor(private readonly prisma: PrismaClient | null) {}

  async findAll(): Promise<TaskWithRelations[]> {
    if (!this.prisma) {
      return this.mockTasks;
    }
    return this.prisma.task.findMany({
      include: {
        assignedAgent: true,
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllBasic(): Promise<TaskBasic[]> {
    if (!this.prisma) {
      return this.mockTasks;
    }
    return this.prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        workspaceId: true,
        assignedAgentId: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<TaskWithRelations[]> {
    if (!this.prisma) {
      return this.mockTasks.filter(t => t.workspaceId === workspaceId);
    }
    return this.prisma.task.findMany({
      where: { workspaceId },
      include: {
        assignedAgent: true,
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByWorkspaceBasic(workspaceId: string): Promise<TaskBasic[]> {
    if (!this.prisma) {
      return this.mockTasks.filter(t => t.workspaceId === workspaceId);
    }
    return this.prisma.task.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        workspaceId: true,
        assignedAgentId: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    if (!this.prisma) {
      return this.mockTasks.find(t => t.id === id) || null;
    }
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        workspace: true,
      },
    });
  }

  async create(data: CreateTaskDto): Promise<TaskWithRelations> {
    if (!this.prisma) {
      const newTask: TaskWithRelations = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description ?? null,
        status: (data.status ?? 'BACKLOG') as TaskStatus,
        priority: (data.priority ?? 'MEDIUM') as TaskPriority,
        workspaceId: data.workspaceId,
        assignedAgentId: data.assignedAgentId ?? null,
        createdByAgentId: null,
        parentTaskId: null,
        priorityScore: 0,
        attemptCount: 0,
        maxAttempts: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        assignedAgent: null,
        workspace: this.mockWorkspace,
      };
      return newTask;
    }
    return this.prisma.task.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'BACKLOG',
        workspaceId: data.workspaceId,
        assignedAgentId: data.assignedAgentId ?? null,
        completedAt: null,
      },
      include: {
        assignedAgent: true,
        workspace: true,
      },
    });
  }

  async update(id: string, data: UpdateTaskDto): Promise<TaskWithRelations | null> {
    if (!this.prisma) {
      const task = this.mockTasks.find(t => t.id === id);
      if (!task) return null;
      return {
        ...task,
        title: data.title ?? task.title,
        description: data.description ?? task.description,
        status: (data.status ?? task.status) as TaskStatus,
        updatedAt: new Date(),
      };
    }
    try {
      const updateData: Partial<Task> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;

      return this.prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignedAgent: true,
          workspace: true,
        },
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.prisma) {
      return true;
    }
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async createEventAndUpdateTask(input: {
    taskId: string;
    event: {
      taskId: string;
      agentId: string;
      eventType: TaskEventType;
      fromStatus: TaskStatus;
      toStatus?: TaskStatus | null;
      notes?: string | null;
      returnedToAgentId?: string | null;
    };
    taskUpdate: {
      status?: TaskStatus;
      attemptCount?: { increment: number };
    };
    selectRelations: { agent?: boolean; returnedToAgent?: boolean };
  }): Promise<{ event: TaskEventWithRelations; task: TaskWithRelations }> {
    if (!this.prisma) {
      throw new Error('Prisma is required to create task events');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const event = await tx.taskEvent.create({
          data: input.event,
          include: {
            agent: input.selectRelations.agent ?? false,
            returnedToAgent: input.selectRelations.returnedToAgent ?? false,
          },
        });
        const task = await tx.task.update({
          where: { id: input.taskId },
          data: input.taskUpdate,
          include: {
            assignedAgent: true,
            workspace: true,
            events: { orderBy: { timestamp: 'desc' } },
          },
        });
        return { event, task };
      });
    } catch (error) {
      throw error;
    }
  }

  async assignToAgent(
    taskId: string,
    agentId: string,
  ): Promise<{ task: TaskWithRelations; agent: Agent } | null> {
    if (!this.prisma) {
      const task = this.mockTasks.find(t => t.id === taskId);
      const agent = this.mockAgents.find(a => a.id === agentId);
      if (!task || !agent) return null;
      return {
        task: { ...task, assignedAgentId: agentId, status: 'IN_PROGRESS' as TaskStatus, assignedAgent: agent },
        agent: { ...agent, status: 'WORKING', currentTaskId: taskId },
      };
    }
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.update({
          where: { id: taskId },
          data: {
            assignedAgentId: agentId,
            status: 'IN_PROGRESS' as TaskStatus,
          },
          include: {
            assignedAgent: true,
            workspace: true,
          },
        });

        const agent = await tx.agent.update({
          where: { id: agentId },
          data: {
            status: 'WORKING',
            currentTaskId: taskId,
          },
        });

        return { task, agent };
      });

      return result;
    } catch {
      return null;
    }
  }
}
