import type { PrismaClient, Task, Workspace, Agent } from '@prisma/client';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskStatus } from '@prisma/client';

export type TaskWithRelations = Task & {
  assignedAgent: Agent | null;
  workspace: Workspace;
};

export class TasksRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<TaskWithRelations[]> {
    return this.prisma.task.findMany({
      include: {
        assignedAgent: true,
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<TaskWithRelations[]> {
    return this.prisma.task.findMany({
      where: { workspaceId },
      include: {
        assignedAgent: true,
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        workspace: true,
      },
    });
  }

  async create(data: CreateTaskDto): Promise<TaskWithRelations> {
    return this.prisma.task.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'BACKLOG',
        workspaceId: data.workspaceId,
        assignedAgentId: null,
        completedAt: null,
      },
      include: {
        assignedAgent: true,
        workspace: true,
      },
    });
  }

  async update(id: string, data: UpdateTaskDto): Promise<TaskWithRelations | null> {
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
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async assignToAgent(
    taskId: string,
    agentId: string,
  ): Promise<{ task: TaskWithRelations; agent: Agent } | null> {
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
